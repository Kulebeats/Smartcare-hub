
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from '@neondatabase/serverless';
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Exit with error if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function main() {
  console.log("🚀 Starting database migration...");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("📊 Creating/updating tables for patients, users, facilities...");
  
  try {
    // This will push the schema directly to the database
    // Uses schema definitions from shared/schema.ts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Clinician',
        facility TEXT,
        facility_code TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        email TEXT,
        full_name TEXT,
        active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        phone_number TEXT,
        permissions JSONB DEFAULT '[]'::jsonb
      );
      
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        surname TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        is_estimated_dob BOOLEAN DEFAULT FALSE,
        sex TEXT NOT NULL,
        nrc TEXT,
        no_nrc BOOLEAN DEFAULT FALSE,
        under_five_card_number TEXT,
        napsa TEXT,
        country TEXT NOT NULL,
        cellphone TEXT NOT NULL,
        other_cellphone TEXT,
        landline TEXT,
        email TEXT,
        house_number TEXT,
        road_street TEXT,
        area TEXT,
        city_town_village TEXT,
        landmarks TEXT,
        mothers_name TEXT,
        fathers_name TEXT,
        guardian_name TEXT,
        guardian_relationship TEXT,
        marital_status TEXT,
        birth_place TEXT,
        education_level TEXT,
        occupation TEXT,
        facility TEXT NOT NULL,
        registration_date TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS art_follow_ups (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        visit_date TIMESTAMP NOT NULL,
        complaints TEXT,
        tb_symptoms TEXT,
        physical_exam TEXT,
        diagnosis TEXT,
        treatment_plan TEXT,
        next_visit DATE
      );
      
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        drug_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration INTEGER NOT NULL,
        duration_unit TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        prescribed_date TIMESTAMP NOT NULL,
        facility TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS facilities (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
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
    
    console.log("✅ Database tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating database tables:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
