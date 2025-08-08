import { db } from "./server/db";
import { facilities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function refineFacilityTypes() {
  console.log('Refining "Health Facility" category into specific types...');
  
  try {
    let updatedCount = 0;

    // Define specific patterns for better categorization
    const refinedPatterns = [
      // Dental facilities
      { pattern: '%dental%', type: 'Dental Clinic' },
      { pattern: '%surgery%', type: 'General Surgery' },
      
      // Optical facilities
      { pattern: '%optician%', type: 'Optical Centre' },
      { pattern: '%optical%', type: 'Optical Centre' },
      { pattern: '%vision care%', type: 'Optical Centre' },
      
      // Diagnostic facilities
      { pattern: '%diagnostic%', type: 'Diagnostic Centre' },
      { pattern: '%laboratory%', type: 'Laboratory' },
      { pattern: '%lab%', type: 'Laboratory' },
      { pattern: '%pathology%', type: 'Laboratory' },
      { pattern: '%ultrasound%', type: 'Diagnostic Centre' },
      
      // Specialized healthcare
      { pattern: '%hospice%', type: 'Hospice' },
      { pattern: '%rehabilitation%', type: 'Rehabilitation Centre' },
      { pattern: '%rehab%', type: 'Rehabilitation Centre' },
      { pattern: '%wellness%', type: 'Wellness Centre' },
      { pattern: '%nursing home%', type: 'Nursing Home' },
      
      // Medical centers and services
      { pattern: '%medical center%', type: 'Medical Centre' },
      { pattern: '%medical centre%', type: 'Medical Centre' },
      { pattern: '%medical services%', type: 'Medical Centre' },
      { pattern: '%healthcare%', type: 'Medical Centre' },
      { pattern: '%health care%', type: 'Medical Centre' },
      
      // Specialized hospitals and mini hospitals
      { pattern: '%mini hospital%', type: 'Mini Hospital' },
      { pattern: '%mini hosp%', type: 'Mini Hospital' },
      { pattern: '%memorial hosp%', type: 'Hospital' },
      
      // Correctional and specialized facilities
      { pattern: '%correctional%', type: 'Correctional Health Facility' },
      { pattern: '%prison%', type: 'Correctional Health Facility' },
      { pattern: '%remand%', type: 'Correctional Health Facility' },
      
      // Military and security facilities
      { pattern: '%army%', type: 'Military Health Facility' },
      { pattern: '%zns%', type: 'Security Health Facility' },
      
      // Mission facilities (HAHC = Health Association of Health Care)
      { pattern: '%hahc%', type: 'Mission Health Centre' },
      { pattern: '%mission%', type: 'Mission Health Centre' },
      
      // Rural health facilities that got miscategorized
      { pattern: '%rural health centre%', type: 'Health Centre' },
      { pattern: '%rural health center%', type: 'Health Centre' },
      { pattern: '%rural health post%', type: 'Health Post' },
      { pattern: '%health post%', type: 'Health Post' },
      { pattern: '%heath post%', type: 'Health Post' }, // Common misspelling
      { pattern: '%helath post%', type: 'Health Post' }, // Common misspelling
      
      // Ambulance and emergency services
      { pattern: '%ambulance%', type: 'Emergency Services' },
      { pattern: '%emergency%', type: 'Emergency Services' },
      
      // VCT and ART centers
      { pattern: '%vct%', type: 'VCT Centre' },
      { pattern: '%art centre%', type: 'ART Centre' }
    ];

    console.log('Applying refined facility type patterns...');

    for (const { pattern, type } of refinedPatterns) {
      const result = await db
        .update(facilities)
        .set({ type })
        .where(sql`LOWER(${facilities.name}) LIKE LOWER(${pattern}) AND ${facilities.type} = 'Health Facility'`)
        .returning({ id: facilities.id, name: facilities.name });

      const count = result.length;
      if (count > 0) {
        updatedCount += count;
        console.log(`Updated ${count} facilities to type "${type}"`);
        if (count <= 5) {
          result.forEach(f => console.log(`  - ${f.name}`));
        }
      }
    }

    // Check remaining "Health Facility" entries
    const remaining = await db
      .select({ count: sql<number>`count(*)` })
      .from(facilities)
      .where(eq(facilities.type, 'Health Facility'));

    console.log(`\nRemaining "Health Facility" entries: ${remaining[0].count}`);

    // Show what's left
    if (remaining[0].count > 0) {
      const remainingFacilities = await db
        .select({ name: facilities.name })
        .from(facilities)
        .where(eq(facilities.type, 'Health Facility'))
        .limit(20);

      console.log('\nRemaining unclassified facilities:');
      remainingFacilities.forEach(f => console.log(`  - ${f.name}`));
    }

    console.log('\n=== Refined Facility Type Update Summary ===');
    console.log(`Total facilities reclassified: ${updatedCount}`);

    // Get updated type distribution
    const typeStats = await db
      .select({
        type: facilities.type,
        count: sql<number>`count(*)`
      })
      .from(facilities)
      .groupBy(facilities.type)
      .orderBy(sql`count(*) DESC`);

    console.log('\n=== Updated Facility Type Distribution ===');
    typeStats.forEach(stat => {
      console.log(`${stat.type || 'NULL'}: ${stat.count}`);
    });

  } catch (error) {
    console.error('Error refining facility types:', error);
    process.exit(1);
  }
}

refineFacilityTypes()
  .then(() => {
    console.log('Facility type refinement completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });