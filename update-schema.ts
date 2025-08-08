import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function updateSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  // Direct SQL query to alter the table
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Add permissions column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'permissions'
        ) THEN
          ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
        END IF;
      END $$;
    `;
    
    // Add phone_number column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'phone_number'
        ) THEN
          ALTER TABLE users ADD COLUMN phone_number TEXT;
        END IF;
      END $$;
    `;
    
    // Update facility code column length if the table exists
    await sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_name = 'facilities'
        ) THEN
          ALTER TABLE facilities ALTER COLUMN code TYPE VARCHAR(50);
        END IF;
      END $$;
    `;

    console.log('Schema updated successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

updateSchema();