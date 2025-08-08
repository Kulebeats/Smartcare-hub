import { db } from "../server/db";
import { facilities } from "../shared/schema";
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';

async function importFacilities() {
  const csvFilePath = path.resolve('./attached_assets/MasterFacilityList.csv');
  
  console.log(`Reading facilities from ${csvFilePath}`);
  
  const importedFacilities: any[] = [];
  let failedRows = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv.parse({ headers: true, trim: true }))
      .on('error', error => {
        console.error('Error reading CSV:', error);
        reject(error);
      })
      .on('data', async (row) => {
        try {
          // Make sure province, district, and name are not empty
          if (!row.Province || !row.District || !row.Name) {
            failedRows++;
            return;
          }

          // Print out the first row to debug
          if (importedFacilities.length === 0) {
            console.log('First row:', row);
            console.log('Row keys:', Object.keys(row));
          }

          // Generate a code if it's missing or empty
          // Try different possible field names for the code
          let code = row['Hims code'] || row['HIMS code'] || row['HIMS_code'] || row['hims_code'];
          if (code) code = code.toString().trim();
          
          // Check for "New Facility" or empty code
          if (!code || code === "New Facility" || code === "0") {
            // Create a code based on province, district and a random number
            const provinceCode = row.Province.substring(0, 3).toUpperCase();
            const districtCode = row.District.substring(0, 3).toUpperCase();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            code = `${provinceCode}-${districtCode}-${randomCode}`;
          }
          
          // Make sure this code doesn't already exist in our import list
          const existingFacilityIndex = importedFacilities.findIndex(f => f.code === code);
          if (existingFacilityIndex >= 0) {
            // Append a unique identifier to make it unique
            code = `${code}-${importedFacilities.length}`;
          }
          
          // Ensure code length is within our field length (50 chars)
          if (code.length > 50) {
            code = code.substring(0, 45) + "-" + importedFacilities.length;
          }

          importedFacilities.push({
            code,
            name: row.Name.trim(),
            province: row.Province.trim(),
            district: row.District.trim(),
            type: row.Type || null,
            ownership: row.Ownership || null,
            status: 'ACTIVE'
          });
        } catch (error) {
          failedRows++;
          console.error('Error processing row:', error, row);
        }
      })
      .on('end', async (rowCount: number) => {
        try {
          console.log(`Finished reading ${rowCount} rows, found ${importedFacilities.length} valid facilities`);
          
          if (failedRows > 0) {
            console.log(`Failed to process ${failedRows} rows`);
          }
          
          // Clear existing facilities first
          console.log('Clearing existing facilities...');
          await db.delete(facilities);
          
          // Insert in batches to avoid exceeding query parameter limits
          const BATCH_SIZE = 100;
          for (let i = 0; i < importedFacilities.length; i += BATCH_SIZE) {
            const batch = importedFacilities.slice(i, i + BATCH_SIZE);
            console.log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(importedFacilities.length / BATCH_SIZE)}`);
            await db.insert(facilities).values(batch);
          }
          
          console.log(`Successfully imported ${importedFacilities.length} facilities`);
          resolve();
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      });
  });
}

importFacilities()
  .then(() => {
    console.log('Facility import complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });