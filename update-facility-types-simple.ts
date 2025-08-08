import { db } from "./server/db";
import { facilities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function updateFacilityTypesSimple() {
  console.log('Starting facility type update using pattern-based assignment...');
  
  try {
    let updatedCount = 0;

    // Define facility type patterns based on common naming conventions
    const typePatterns = [
      { pattern: '%Hospital%', type: 'Hospital' },
      { pattern: '%District Hospital%', type: '1st Level Hospital' },
      { pattern: '%General Hospital%', type: '2nd Level Hospital' },
      { pattern: '%Central Hospital%', type: '3rd Level Hospital' },
      { pattern: '%Teaching Hospital%', type: '3rd Level Hospital' },
      { pattern: '%Referral Hospital%', type: '2nd Level Hospital' },
      { pattern: '%Health Centre%', type: 'Health Centre' },
      { pattern: '%Health Center%', type: 'Health Centre' },
      { pattern: '%Rural Health Centre%', type: 'Health Centre' },
      { pattern: '%Urban Health Centre%', type: 'Health Centre' },
      { pattern: '%Health Post%', type: 'Health Post' },
      { pattern: '%Clinic%', type: 'Clinic' },
      { pattern: '%Medical Centre%', type: 'Medical Centre' },
      { pattern: '%Maternity%', type: 'Maternity Centre' },
      { pattern: '%Dispensary%', type: 'Dispensary' }
    ];

    console.log('Applying pattern-based facility type assignments...');

    for (const { pattern, type } of typePatterns) {
      const result = await db
        .update(facilities)
        .set({ type })
        .where(sql`${facilities.name} ILIKE ${pattern} AND ${facilities.type} IS NULL`)
        .returning({ id: facilities.id });

      const count = result.length;
      if (count > 0) {
        updatedCount += count;
        console.log(`Updated ${count} facilities to type "${type}"`);
      }
    }

    // Handle remaining facilities with default types based on common patterns
    const defaultMappings = [
      // Update remaining hospitals
      { 
        sql: sql`${facilities.name} ILIKE '%hospital%' AND ${facilities.type} IS NULL`,
        type: 'Hospital'
      },
      // Update remaining health centres
      { 
        sql: sql`(${facilities.name} ILIKE '%health%' AND ${facilities.name} ILIKE '%centre%') AND ${facilities.type} IS NULL`,
        type: 'Health Centre'
      },
      // Update remaining clinics
      { 
        sql: sql`${facilities.name} ILIKE '%clinic%' AND ${facilities.type} IS NULL`,
        type: 'Clinic'
      },
      // Default for remaining facilities
      { 
        sql: sql`${facilities.type} IS NULL`,
        type: 'Health Facility'
      }
    ];

    console.log('Applying default type assignments for remaining facilities...');

    for (const { sql: condition, type } of defaultMappings) {
      const result = await db
        .update(facilities)
        .set({ type })
        .where(condition)
        .returning({ id: facilities.id });

      const count = result.length;
      if (count > 0) {
        updatedCount += count;
        console.log(`Updated ${count} facilities to default type "${type}"`);
      }
    }

    console.log('\n=== Facility Type Update Summary ===');
    console.log(`Total facilities updated: ${updatedCount}`);

    // Get type distribution after update
    const typeStats = await db
      .select({
        type: facilities.type,
        count: sql<number>`count(*)`
      })
      .from(facilities)
      .groupBy(facilities.type)
      .orderBy(sql`count(*) DESC`);

    console.log('\n=== Final Facility Type Distribution ===');
    typeStats.forEach(stat => {
      console.log(`${stat.type || 'NULL'}: ${stat.count}`);
    });

    // Verify all facilities have types
    const nullCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(facilities)
      .where(sql`${facilities.type} IS NULL`);

    console.log(`\nFacilities without type: ${nullCount[0].count}`);

  } catch (error) {
    console.error('Error updating facility types:', error);
    process.exit(1);
  }
}

updateFacilityTypesSimple()
  .then(() => {
    console.log('Facility type update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });