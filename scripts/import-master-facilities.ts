import { db } from "../server/db";
import { facilities } from "../shared/schema";
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { eq } from 'drizzle-orm';

async function importFacilities() {
  console.log("Starting import of facilities from MasterFacilityList.csv...");
  
  try {
    // Read the CSV file
    const csvFilePath = './attached_assets/MasterFacilityList.csv';
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse the CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true  // Handle BOM character
    });
    
    console.log(`Parsed ${records.length} facilities from CSV file`);
    
    // Filter facilities from Eastern Province
    const easternFacilities = records.filter(
      (record: any) => record.Province?.trim() === 'Eastern'
    );
    
    console.log(`Found ${easternFacilities.length} facilities in Eastern Province`);

    // Delete all existing facilities
    await db.delete(facilities);
    console.log("Cleared existing facilities table");
    
    // Prepare facilities for insert
    let facilitiesToInsert = easternFacilities.map((record: any) => {
      return {
        code: record['Hims code']?.trim() || generateFacilityCode(record.Province, record.District, record.Name),
        name: record.Name?.trim(),
        province: record.Province?.trim(),
        district: record.District?.trim(),
        type: record.Type?.trim() || null,
        level: extractLevel(record.Type?.trim()),
        ownership: record.Ownership?.trim() || null,
        status: 'ACTIVE',
        // Additional data if available
        latitude: null,
        longitude: null,
        contact: null,
        email: null
      };
    });
    
    // Filter out entries with missing required fields
    facilitiesToInsert = facilitiesToInsert.filter(facility => 
      facility.name && facility.province && facility.district
    );
    
    console.log(`Prepared ${facilitiesToInsert.length} valid facilities for import`);
    
    // Insert facilities in chunks to avoid exceeding database limits
    const chunkSize = 50;
    for (let i = 0; i < facilitiesToInsert.length; i += chunkSize) {
      const chunk = facilitiesToInsert.slice(i, i + chunkSize);
      await db.insert(facilities).values(chunk).onConflictDoNothing({
        target: facilities.code
      });
      console.log(`Imported facilities ${i + 1} to ${Math.min(i + chunkSize, facilitiesToInsert.length)}`);
    }
    
    // Verify import by counting facilities
    const count = await db.select({ count: facilities.id }).from(facilities);
    console.log(`Import complete. Total facilities in database: ${count[0]?.count || 0}`);
    
  } catch (error) {
    console.error("Error importing facilities:", error);
  }
}

function generateFacilityCode(province: string, district: string, name: string): string {
  // Generate a code based on province, district, and facility name
  if (!province || !district) {
    return `UNKNOWN-${Math.floor(Math.random() * 10000)}`;
  }
  
  const provinceCode = province.substring(0, 3).toUpperCase();
  const districtCode = district.substring(0, 3).toUpperCase();
  
  // Create a hash from the facility name to ensure uniqueness
  const nameHash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString()
    .substring(0, 4);
  
  return `${provinceCode}-${districtCode}-${nameHash}`;
}

function extractLevel(type: string | null): string | null {
  if (!type) return null;
  
  if (type.includes('1st Level Hospital')) return 'Level 1';
  if (type.includes('2nd Level Hospital')) return 'Level 2';
  if (type.includes('3rd Level Hospital')) return 'Level 3';
  
  return null;
}

// Run the import function
importFacilities()
  .then(() => {
    console.log('Master facility list import completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during import:', error);
    process.exit(1);
  });