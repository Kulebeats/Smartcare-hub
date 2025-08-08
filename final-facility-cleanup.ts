import { db } from "./server/db";
import { facilities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function finalFacilityCleanup() {
  console.log('Final cleanup of remaining "Health Facility" entries...');
  
  try {
    let updatedCount = 0;

    // Get all remaining "Health Facility" entries to analyze them
    const remainingFacilities = await db
      .select({ id: facilities.id, name: facilities.name, code: facilities.code })
      .from(facilities)
      .where(eq(facilities.type, 'Health Facility'));

    console.log(`Analyzing ${remainingFacilities.length} remaining facilities...`);

    // Final patterns for remaining facilities
    const finalPatterns = [
      // Rural health facilities with common misspellings
      { pattern: '%rural helath%', type: 'Health Centre' },
      { pattern: '%rural health%', type: 'Health Centre' },
      { pattern: '%heatlh post%', type: 'Health Post' },
      { pattern: '%chantete%', type: 'Health Post' },
      
      // Corporate/Industrial health services
      { pattern: '%chemicals%', type: 'Industrial Health Service' },
      { pattern: '%mining%', type: 'Industrial Health Service' },
      { pattern: '%farm%', type: 'Occupational Health Service' },
      
      // Community health services
      { pattern: '%health service%', type: 'Community Health Service' },
      { pattern: '%consulting room%', type: 'Consulting Room' },
      
      // Unknown patterns - check for common endings
      { pattern: '% post', type: 'Health Post' },
      { pattern: '% centre', type: 'Health Centre' },
      { pattern: '% center', type: 'Health Centre' }
    ];

    // Apply final patterns
    for (const { pattern, type } of finalPatterns) {
      const result = await db
        .update(facilities)
        .set({ type })
        .where(sql`LOWER(${facilities.name}) LIKE LOWER(${pattern}) AND ${facilities.type} = 'Health Facility'`)
        .returning({ id: facilities.id, name: facilities.name });

      const count = result.length;
      if (count > 0) {
        updatedCount += count;
        console.log(`Updated ${count} facilities to type "${type}"`);
        result.forEach(f => console.log(`  - ${f.name}`));
      }
    }

    // Handle remaining facilities by assigning them to "Primary Health Care Facility"
    const stillRemaining = await db
      .select({ count: sql<number>`count(*)` })
      .from(facilities)
      .where(eq(facilities.type, 'Health Facility'));

    if (stillRemaining[0].count > 0) {
      console.log(`\nAssigning remaining ${stillRemaining[0].count} facilities to "Primary Health Care Facility"`);
      
      const finalUpdate = await db
        .update(facilities)
        .set({ type: 'Primary Health Care Facility' })
        .where(eq(facilities.type, 'Health Facility'))
        .returning({ id: facilities.id, name: facilities.name });

      updatedCount += finalUpdate.length;
      console.log(`Updated ${finalUpdate.length} facilities to "Primary Health Care Facility"`);
    }

    console.log('\n=== Final Cleanup Summary ===');
    console.log(`Total facilities reclassified: ${updatedCount}`);

    // Final type distribution
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
      console.log(`${stat.type}: ${stat.count}`);
    });

    // Verify no facilities remain untyped
    const untypedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(facilities)
      .where(sql`${facilities.type} IS NULL OR ${facilities.type} = 'Health Facility'`);

    console.log(`\nFacilities still untyped or generic: ${untypedCount[0].count}`);

  } catch (error) {
    console.error('Error in final cleanup:', error);
    process.exit(1);
  }
}

finalFacilityCleanup()
  .then(() => {
    console.log('Final facility type cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });