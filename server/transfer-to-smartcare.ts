
import { storage } from './storage-direct';
import type { Patient, ArtFollowUp, Prescription } from '@shared/schema';
import { db, patients, artFollowUps, prescriptions } from './db';
import { eq } from 'drizzle-orm';

interface TransferBatch {
  patients: Patient[];
  artFollowUps: ArtFollowUp[];
  prescriptions: Prescription[];
}

async function collectPatientData(facility: string): Promise<TransferBatch> {
  // Get all patients for the facility
  const facilityPatients = await storage.getPatients(facility);
  
  // Collect related data for each patient
  const patientIds = facilityPatients.map(p => p.id);
  const followUps = await db.select().from(artFollowUps)
    .where(eq(artFollowUps.patientId, patientIds[0]));
  
  const patientPrescriptions = await db.select().from(prescriptions)
    .where(eq(prescriptions.patientId, patientIds[0]));

  return {
    patients: facilityPatients,
    artFollowUps: followUps,
    prescriptions: patientPrescriptions
  };
}

export async function transferToSmartCare(facility: string) {
  try {
    console.log(`Starting data collection for facility: ${facility}`);
    const data = await collectPatientData(facility);
    
    console.log(`Found ${data.patients.length} patients`);
    console.log(`Found ${data.artFollowUps.length} ART follow-ups`);
    console.log(`Found ${data.prescriptions.length} prescriptions`);

    // TODO: Implement actual transfer logic when SmartCare hub API is available
    
    return data;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}

// Main execution only happens through the API now
// This would be used for command-line testing if needed
/*
// Example of how to run this manually if needed:
// Command-line entry point (if used directly)
import { fileURLToPath } from 'url';

// Check if this file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const facility = process.argv[2];
  if (!facility) {
    console.error('Please provide a facility name');
    process.exit(1);
  }
  
  transferToSmartCare(facility)
    .then(() => console.log('Transfer completed'))
    .catch(error => {
      console.error('Transfer failed:', error);
      process.exit(1);
    });
}
*/
