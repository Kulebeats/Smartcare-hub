/**
 * Schema Push Script
 * 
 * This script creates tables in the database based on our schema definitions
 */

import { sql } from 'drizzle-orm';
import { pool, db, facilities } from '../server/db';

async function pushSchema() {
  try {
    console.log('Creating facilities table...');
    
    await db.execute(sql`
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
    
    console.log('Facilities table created successfully.');
    
    // List all tables in the database to verify
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Database tables:');
    for (const row of result.rows) {
      console.log(`- ${row.table_name}`);
    }
    
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

pushSchema().catch(console.error);