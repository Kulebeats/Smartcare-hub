import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

// Test script to debug CSV parsing and HMIS code extraction
async function testCSVParsing() {
  console.log("Testing CSV parsing for HMIS codes...");
  
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
    console.log('Available columns:', Object.keys(records[0]));
    
    // Check the first few Eastern Province facilities
    const easternFacilities = records
      .filter((record: any) => record.Province?.trim() === 'Eastern')
      .slice(0, 10);
    
    console.log('\nFirst 10 Eastern Province facilities:');
    easternFacilities.forEach((record: any, index: number) => {
      console.log(`${index + 1}. HMIS Code: "${record['Hims code']}" | Name: "${record.Name}" | Province: "${record.Province}"`);
    });
    
    // Check for any missing HMIS codes in Eastern Province
    const easternWithoutHMIS = records
      .filter((record: any) => record.Province?.trim() === 'Eastern')
      .filter((record: any) => !record['Hims code']?.trim());
    
    console.log(`\nEastern facilities without HMIS codes: ${easternWithoutHMIS.length}`);
    
    if (easternWithoutHMIS.length > 0) {
      console.log('First 5 facilities without HMIS codes:');
      easternWithoutHMIS.slice(0, 5).forEach((record: any, index: number) => {
        console.log(`${index + 1}. Name: "${record.Name}" | District: "${record.District}"`);
      });
    }
    
  } catch (error) {
    console.error('Error testing CSV parsing:', error);
  }
}

testCSVParsing().catch(console.error);