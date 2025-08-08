import { db } from '../server/db';
import { facilities, type InsertFacility } from '../shared/schema';

// Helper function to generate a facility code based on province, district and facility name
function generateFacilityCode(province: string, district: string, name: string, index: number): string {
  // Extract first 3 characters of province
  const provinceCode = province.substring(0, 3).toUpperCase();
  
  // Extract first 3 characters of district or facility name
  const districtCode = district.substring(0, 3).toUpperCase();
  
  // Create a numeric part with leading zeros
  const numericPart = String(index).padStart(3, '0');
  
  return `${provinceCode}-${districtCode}-${numericPart}`;
}

async function importFacilitiesFromJson() {
  console.log('Starting facility import process...');
  
  try {
    // Zambian healthcare facilities data
    const facilityData: InsertFacility[] = [
      // Lusaka Province
      {
        code: "LUS-MAT-001",
        name: "Matero Level 1 Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chawama General Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chilenje Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chipata Health Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chelstone Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chainama Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Mental Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "University Teaching Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Tertiary Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kabwata Health Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kalingalinga Health Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kanyama Health Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Bauleni Health Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Levy Mwanawasa University Teaching Hospital",
        province: "Lusaka",
        district: "Lusaka",
        type: "Teaching Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "SOS Children's Village Medical Centre",
        province: "Lusaka",
        district: "Lusaka",
        type: "Health Centre",
        ownership: "Private",
        status: "ACTIVE",
      },
      
      // Central Province
      {
        name: "Mwembeshi Health Centre",
        province: "Central",
        district: "Chibombo",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kapiri Mposhi District Hospital",
        province: "Central",
        district: "Kapiri Mposhi",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kabwe General Hospital",
        province: "Central",
        district: "Kabwe",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mumbwa District Hospital",
        province: "Central",
        district: "Mumbwa",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Serenje District Hospital",
        province: "Central",
        district: "Serenje",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      
      // Northern Province
      {
        name: "Kasama General Hospital",
        province: "Northern",
        district: "Kasama",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mbala General Hospital",
        province: "Northern",
        district: "Mbala",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mpulungu Rural Health Centre",
        province: "Northern",
        district: "Mpulungu",
        type: "Health Centre",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mporokoso District Hospital",
        province: "Northern",
        district: "Mporokoso",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      
      // Copperbelt Province
      {
        name: "Ndola Teaching Hospital",
        province: "Copperbelt",
        district: "Ndola",
        type: "Teaching Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kitwe Central Hospital",
        province: "Copperbelt",
        district: "Kitwe",
        type: "Central Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Chingola General Hospital",
        province: "Copperbelt",
        district: "Chingola",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mufulira General Hospital",
        province: "Copperbelt",
        district: "Mufulira",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Konkola Mine Hospital",
        province: "Copperbelt",
        district: "Chililabombwe",
        type: "Mine Hospital",
        ownership: "Private",
        status: "ACTIVE",
      },
      {
        name: "Nchanga North Hospital",
        province: "Copperbelt",
        district: "Chingola",
        type: "Mine Hospital",
        ownership: "Private",
        status: "ACTIVE",
      },
      
      // Eastern Province
      {
        name: "Chipata General Hospital",
        province: "Eastern",
        district: "Chipata",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Petauke District Hospital",
        province: "Eastern",
        district: "Petauke",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Katete St. Francis Mission Hospital",
        province: "Eastern",
        district: "Katete",
        type: "Mission Hospital",
        ownership: "Mission",
        status: "ACTIVE",
      },
      
      // Western Province
      {
        name: "Lewanika General Hospital",
        province: "Western",
        district: "Mongu",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kalabo District Hospital",
        province: "Western",
        district: "Kalabo",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Senanga District Hospital",
        province: "Western",
        district: "Senanga",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      
      // North-Western Province
      {
        name: "Solwezi General Hospital",
        province: "North-Western",
        district: "Solwezi",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kabompo District Hospital",
        province: "North-Western",
        district: "Kabompo",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kasempa District Hospital",
        province: "North-Western",
        district: "Kasempa",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      
      // Southern Province
      {
        name: "Livingstone Central Hospital",
        province: "Southern",
        district: "Livingstone",
        type: "Central Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Choma General Hospital",
        province: "Southern",
        district: "Choma",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mazabuka District Hospital",
        province: "Southern",
        district: "Mazabuka",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Monze Mission Hospital",
        province: "Southern",
        district: "Monze",
        type: "Mission Hospital",
        ownership: "Mission",
        status: "ACTIVE",
      },
      
      // Muchinga Province
      {
        name: "Chinsali General Hospital",
        province: "Muchinga",
        district: "Chinsali",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Nakonde District Hospital",
        province: "Muchinga",
        district: "Nakonde",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Mpika District Hospital",
        province: "Muchinga",
        district: "Mpika",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      
      // Luapula Province
      {
        name: "Mansa General Hospital",
        province: "Luapula",
        district: "Mansa",
        type: "General Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Kawambwa District Hospital",
        province: "Luapula",
        district: "Kawambwa",
        type: "District Hospital",
        ownership: "Public",
        status: "ACTIVE",
      },
      {
        name: "Nchelenge St. Paul's Mission Hospital",
        province: "Luapula",
        district: "Nchelenge",
        type: "Mission Hospital",
        ownership: "Mission",
        status: "ACTIVE",
      },
    ];
    
    // Create map of provinces and districts for API
    const provinceMap = new Map<string, Set<string>>();
    
    // Add codes to all facilities
    const facilitiesWithCodes: InsertFacility[] = [];
    let counter = 1;
    
    for (const facility of facilityData) {
      // Add province and district to map
      if (facility.province) {
        if (!provinceMap.has(facility.province)) {
          provinceMap.set(facility.province, new Set<string>());
        }
        if (facility.district) {
          provinceMap.get(facility.province)?.add(facility.district);
        }
      }
      
      // Skip if already has a code
      if (facility.code) {
        facilitiesWithCodes.push(facility);
        continue;
      }
      
      // Generate code for facility
      const code = generateFacilityCode(
        facility.province || 'UNK',
        facility.district || 'UNK',
        facility.name,
        counter++
      );
      
      // Add to list with code
      facilitiesWithCodes.push({
        ...facility,
        code
      });
    }
    
    console.log('Provinces and Districts:');
    for (const [province, districts] of provinceMap.entries()) {
      console.log(`${province}: ${Array.from(districts).join(', ')}`);
    }
    
    // Clear existing facility data
    await db.delete(facilities);
    console.log('Cleared existing facility data');
    
    // Insert new facility data
    await db.insert(facilities).values(facilitiesWithCodes);
    console.log(`Successfully imported ${facilitiesWithCodes.length} facilities`);
    
  } catch (error) {
    console.error('Error during facility import:', error);
  } finally {
    process.exit(0);
  }
}

importFacilitiesFromJson();