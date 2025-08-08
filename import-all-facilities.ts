import { db } from "./server/db";
import { facilities } from "./shared/schema";
import { count, sql } from "drizzle-orm";
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

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

async function importAllFacilities() {
  console.log('Starting comprehensive facility import from MasterFacilityList.csv...');
  
  try {
    // Read and parse CSV file
    let csvContent = fs.readFileSync('./attached_assets/MasterFacilityList.csv', 'utf-8');
    
    // Remove BOM if present
    if (csvContent.charCodeAt(0) === 0xFEFF) {
      csvContent = csvContent.slice(1);
    }
    
    const records: CSVFacility[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true
    });

    console.log(`Found ${records.length} facilities in CSV file`);

    // Clear existing facilities to ensure clean import
    console.log('Clearing existing facilities...');
    await db.delete(facilities);

    // Process facilities in batches for better performance
    const batchSize = 100;
    let importedCount = 0;
    let totalBatches = Math.ceil(records.length / batchSize);
    
    // Track seen codes to handle duplicates
    const seenCodes = new Set<string>();

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} facilities)...`);

      const facilityData = batch.map((record, index) => {
        let code = record['Hims code']?.trim() || '';
        const name = record['Name']?.trim() || '';
        const province = record['Province']?.trim() || '';
        const district = record['District']?.trim() || '';
        
        // Handle any duplicate codes by making them unique
        if (seenCodes.has(code)) {
          const originalCode = code;
          let counter = 1;
          do {
            code = `${originalCode}_dup${counter}`;
            counter++;
          } while (seenCodes.has(code));
          console.log(`Duplicate code detected: ${originalCode} -> ${code}`);
        }
        
        seenCodes.add(code);
        
        const facility = { code, name, province, district };
        
        // Debug first few records
        if (currentBatch === 1 && index < 3) {
          console.log(`Debug record ${index + 1}:`, {
            raw: record,
            processed: facility,
            hasAllFields: !!(facility.code && facility.name && facility.province && facility.district)
          });
        }
        
        return facility;
      }).filter(facility => 
        facility.code && 
        facility.name && 
        facility.province && 
        facility.district
      );

      console.log(`Batch ${currentBatch}: ${batch.length} raw records -> ${facilityData.length} valid facilities`);

      if (facilityData.length > 0) {
        await db.insert(facilities).values(facilityData);
        importedCount += facilityData.length;
        console.log(`Batch ${currentBatch} completed: ${facilityData.length} facilities imported`);
      }
    }

    console.log(`\n✅ Import completed successfully!`);
    console.log(`Total facilities imported: ${importedCount}`);

    // Verify import with province counts
    console.log('\n📊 Facilities by Province:');
    const provinceCounts = await db
      .select({
        province: facilities.province,
        count: count(facilities.id)
      })
      .from(facilities)
      .groupBy(facilities.province)
      .orderBy(facilities.province);

    provinceCounts.forEach(({ province, count }) => {
      console.log(`  ${province}: ${count} facilities`);
    });

    const totalInDb = await db.select({ count: count(facilities.id) }).from(facilities);
    console.log(`\n🏥 Total facilities in database: ${totalInDb[0].count}`);

  } catch (error) {
    console.error('❌ Error importing facilities:', error);
    throw error;
  }
}

// Run the import
importAllFacilities()
  .then(() => {
    console.log('\n🎉 All facilities imported successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });