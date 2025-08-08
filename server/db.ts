import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced pool configuration with retry logic
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

export const db = drizzle({ client: pool, schema });

// Database connection health check with retry
export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.warn(`Database connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  return false;
}

// Export individual tables for direct use
export const { 
  users, 
  patients, 
  artFollowUps, 
  prescriptions, 
  facilities,
  patientCore,
  patientContacts,
  patientAddress,
  patientFamily,
  patientPersonal,
  featureFlags
} = schema;