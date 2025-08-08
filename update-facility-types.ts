import { db } from "./server/db";
import { facilities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import fs from "fs";
import { parse } from "csv-parse/sync";

interface CSVFacility {
  'Hims code': string;
  'Name': string;
  'Province': string;
  'District': string;
  'Type': string;
  'Ownership': string;
  'Ownership type': string;
  'Catchment population head count': string;
}

async function updateFacilityTypes() {
  console.log('Starting facility type update...');
  
  try {
    // Read and parse CSV file
    const csvContent = fs.readFileSync('./attached_assets/MasterFacilityList.csv', 'utf-8');
    const records: CSVFacility[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} facilities in CSV`);

    let updatedCount = 0;
    let notFoundCount = 0;
    const batchSize = 100;

    // Process facilities in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);

      for (const record of batch) {
        const facilityCode = record['Hims code']?.trim();
        const facilityType = record['Type']?.trim();
        
        if (!facilityCode || !facilityType) {
          console.log(`Skipping facility with missing code or type: ${facilityCode}`);
          continue;
        }

        try {
          // Find facility by code and update type
          const result = await db
            .update(facilities)
            .set({ type: facilityType })
            .where(eq(facilities.code, facilityCode))
            .returning({ id: facilities.id, code: facilities.code, name: facilities.name });

          if (result.length > 0) {
            updatedCount++;
            if (updatedCount % 50 === 0) {
              console.log(`Updated ${updatedCount} facilities so far...`);
            }
          } else {
            notFoundCount++;
            console.log(`Facility not found in database: ${facilityCode} - ${record['Name']}`);
          }
        } catch (error) {
          console.error(`Error updating facility ${facilityCode}:`, error);
        }
      }
    }

    console.log('\n=== Facility Type Update Summary ===');
    console.log(`Total facilities in CSV: ${records.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Not found in database: ${notFoundCount}`);

    // Get type distribution after update
    const typeStats = await db
      .select({
        type: facilities.type,
        count: sql<number>`count(*)`
      })
      .from(facilities)
      .groupBy(facilities.type);

    console.log('\n=== Current Facility Type Distribution ===');
    typeStats.forEach(stat => {
      console.log(`${stat.type || 'NULL'}: ${stat.count}`);
    });

  } catch (error) {
    console.error('Error updating facility types:', error);
    process.exit(1);
  }
}

updateFacilityTypes()
  .then(() => {
    console.log('Facility type update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });