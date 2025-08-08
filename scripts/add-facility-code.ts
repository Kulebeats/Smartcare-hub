import { pool, db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addFacilityCodeColumn() {
  try {
    console.log('Adding facility_code column to users table...');
    
    // Check if column already exists
    const checkColumnExistsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'facility_code'
    `;
    
    const columnExists = await db.execute(sql.raw(checkColumnExistsQuery));
    
    if (columnExists.rows.length === 0) {
      // Add the column if it doesn't exist
      await db.execute(sql.raw(`
        ALTER TABLE users 
        ADD COLUMN facility_code TEXT
      `));
      console.log('Successfully added facility_code column to users table');
      
      // Update existing users with facility codes
      console.log('Updating existing users with facility codes...');
      
      // Get all users with facilities
      const usersWithFacilities = await db.execute(sql.raw(`
        SELECT id, facility FROM users WHERE facility IS NOT NULL
      `));
      
      if (usersWithFacilities.rows.length > 0) {
        console.log(`Found ${usersWithFacilities.rows.length} users with facilities to update.`);
        
        // Get all facilities to create a lookup map
        const allFacilities = await db.execute(sql.raw(`
          SELECT name, code FROM facilities
        `));
        
        // Create a lookup map for facility name to code
        const facilityCodeMap: Record<string, string> = {};
        for (const facility of allFacilities.rows) {
          facilityCodeMap[facility.name] = facility.code;
        }
        
        // For each user, look up the facility code and update their record
        for (const user of usersWithFacilities.rows) {
          if (user.facility && facilityCodeMap[user.facility]) {
            const facilityCode = facilityCodeMap[user.facility];
            
            // Update the user record with the facility code using a safe query
            const updateQuery = `
              UPDATE users 
              SET facility_code = $1 
              WHERE id = $2
            `;
            
            await pool.query(updateQuery, [facilityCode, user.id]);
            console.log(`Updated user ${user.id} with facility code for ${user.facility}`);
          } else {
            console.log(`No matching facility code found for user ${user.id} with facility ${user.facility}`);
          }
        }
        
        console.log('Migration completed successfully');
      } else {
        console.log('No users with facilities found, skipping updates');
      }
    } else {
      console.log('facility_code column already exists, skipping migration');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

addFacilityCodeColumn();