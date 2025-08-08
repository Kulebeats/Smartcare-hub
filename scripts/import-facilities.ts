/**
 * Facility Import Script
 * 
 * This script imports facility data from a CSV file into the database.
 * Run with: tsx scripts/import-facilities.ts <path-to-csv-file>
 * 
 * CSV Format:
 * code,name,province,district,type,level,ownership,status,latitude,longitude,contact,email
 */

import { pool } from '../server/db';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

async function importFacilities(csvFilePath: string) {
  console.log(`Importing facilities from ${csvFilePath}...`);
  
  try {
    // Read CSV file
    const fileContent = fs.readFileSync(path.resolve(csvFilePath), 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Found ${records.length} facilities in CSV file.`);
    
    // Get count of existing facilities
    const countResult = await pool.query('SELECT COUNT(*) FROM facilities');
    console.log(`Database currently has ${countResult.rows[0].count} facilities.`);
    
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        province VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        type VARCHAR(100),
        level VARCHAR(50),
        ownership VARCHAR(100),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        latitude VARCHAR(20),
        longitude VARCHAR(20),
        contact VARCHAR(100),
        email VARCHAR(100)
      );
    `);
    
    // Process facilities in batches to avoid overwhelming the DB
    const batchSize = 50;
    let importedCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Prepare query for batch insert with ON CONFLICT DO UPDATE
      const values = batch.map((record: any, index: number) => {
        const params = [
          record.code || `FAC${Math.floor(Math.random() * 10000)}`,
          record.name,
          record.province,
          record.district,
          record.type || null,
          record.level || null,
          record.ownership || null,
          record.status || 'ACTIVE',
          record.latitude || null,
          record.longitude || null,
          record.contact || null,
          record.email || null
        ];
        
        const placeholders = params.map((_, j) => `$${j + 1 + index * 12}`).join(', ');
        return `(${placeholders})`;
      });
      
      const flatParams = batch.flatMap((record: any) => [
        record.code || `FAC${Math.floor(Math.random() * 10000)}`,
        record.name,
        record.province,
        record.district,
        record.type || null,
        record.level || null,
        record.ownership || null,
        record.status || 'ACTIVE',
        record.latitude || null,
        record.longitude || null,
        record.contact || null,
        record.email || null
      ]);
      
      const query = `
        INSERT INTO facilities 
          (code, name, province, district, type, level, ownership, status, latitude, longitude, contact, email)
        VALUES
          ${values.join(', ')}
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          province = EXCLUDED.province,
          district = EXCLUDED.district,
          type = EXCLUDED.type,
          level = EXCLUDED.level,
          ownership = EXCLUDED.ownership,
          status = EXCLUDED.status,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          contact = EXCLUDED.contact,
          email = EXCLUDED.email
        RETURNING id, name;
      `;
      
      const result = await pool.query(query, flatParams);
      importedCount += result.rowCount;
      
      console.log(`Imported batch ${i / batchSize + 1} with ${result.rowCount} facilities.`);
    }
    
    console.log(`Successfully imported ${importedCount} facilities.`);
    
    // Display some sample facilities
    const sampleResult = await pool.query('SELECT id, name FROM facilities LIMIT 5');
    console.log('Sample of imported facilities:');
    sampleResult.rows.forEach((facility: any) => {
      console.log(`- ID: ${facility.id}, Name: ${facility.name}`);
    });
    
  } catch (error) {
    console.error('Error importing facilities:', error);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed.');
  }
}

// Check command line arguments
if (process.argv.length < 3) {
  console.error('Please provide a path to the CSV file.');
  console.log('Usage: tsx scripts/import-facilities.ts <path-to-csv-file>');
  process.exit(1);
}

const csvFilePath = process.argv[2];
importFacilities(csvFilePath).catch(console.error);