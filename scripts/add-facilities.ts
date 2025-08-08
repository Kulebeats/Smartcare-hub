import { db } from "../server/db";
import { facilities } from "../shared/schema";

async function addFacilities() {
  try {
    console.log("Adding facilities to the database...");
    
    // List of Zambian provinces
    const provinces = [
      "Central",
      "Copperbelt",
      "Eastern",
      "Luapula",
      "Lusaka",
      "Muchinga",
      "Northern",
      "North-Western",
      "Southern",
      "Western"
    ];
    
    // Sample of districts by province (simplified list)
    const districtsByProvince: Record<string, string[]> = {
      "Central": ["Chibombo", "Kabwe", "Kapiri Mposhi", "Mkushi", "Mumbwa", "Serenje"],
      "Copperbelt": ["Chililabombwe", "Chingola", "Kalulushi", "Kitwe", "Luanshya", "Mufulira", "Ndola"],
      "Eastern": ["Chadiza", "Chipata", "Katete", "Lundazi", "Nyimba", "Petauke"],
      "Luapula": ["Chienge", "Kawambwa", "Mansa", "Mwense", "Nchelenge", "Samfya"],
      "Lusaka": ["Chongwe", "Kafue", "Luangwa", "Lusaka"],
      "Muchinga": ["Chama", "Chinsali", "Isoka", "Mafinga", "Mpika", "Nakonde"],
      "Northern": ["Chilubi", "Kaputa", "Kasama", "Luwingu", "Mbala", "Mporokoso", "Mpulungu", "Mungwi"],
      "North-Western": ["Chavuma", "Ikelenge", "Kabompo", "Kasempa", "Mufumbwe", "Mwinilunga", "Solwezi", "Zambezi"],
      "Southern": ["Choma", "Gwembe", "Kalomo", "Kazungula", "Livingstone", "Mazabuka", "Monze", "Namwala", "Siavonga", "Sinazongwe"],
      "Western": ["Kalabo", "Kaoma", "Lukulu", "Mongu", "Senanga", "Sesheke", "Shangombo"]
    };
    
    // Sample facility types and levels
    const facilityTypes = ["Hospital", "Health Centre", "Health Post", "Clinic"];
    const facilityLevels = ["Level 1", "Level 2", "Level 3"];
    const ownershipTypes = ["Public", "Private", "Mission", "NGO"];
    
    // Create facilities array
    const facilitiesToAdd = [];
    
    // Add MoH headquarters first
    facilitiesToAdd.push({
      code: "MoH-HQ",
      name: "Ministry of Health Headquarters",
      province: "Lusaka",
      district: "Lusaka",
      type: "Administrative",
      level: "National",
      ownership: "Public",
      status: "ACTIVE",
      contact: "+260211111111",
      email: "info@moh.gov.zm"
    });
    
    // Sample facilities for each district
    let facilityId = 1;
    
    for (const province of provinces) {
      const districts = districtsByProvince[province];
      
      for (const district of districts) {
        // Add district hospital
        facilitiesToAdd.push({
          code: `${district.substring(0, 3).toUpperCase()}-H-${facilityId}`,
          name: `${district} District Hospital`,
          province,
          district,
          type: "Hospital",
          level: "Level 2",
          ownership: "Public",
          status: "ACTIVE",
          contact: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `${district.toLowerCase()}hospital@moh.gov.zm`
        });
        facilityId++;
        
        // Add a health center
        facilitiesToAdd.push({
          code: `${district.substring(0, 3).toUpperCase()}-HC-${facilityId}`,
          name: `${district} Central Health Centre`,
          province,
          district,
          type: "Health Centre",
          level: "Level 1",
          ownership: "Public",
          status: "ACTIVE",
          contact: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `${district.toLowerCase()}hc@moh.gov.zm`
        });
        facilityId++;
        
        // Add a health post for some districts
        if (Math.random() > 0.5) {
          facilitiesToAdd.push({
            code: `${district.substring(0, 3).toUpperCase()}-HP-${facilityId}`,
            name: `${district} Rural Health Post`,
            province,
            district,
            type: "Health Post",
            level: "Level 1",
            ownership: "Public",
            status: "ACTIVE",
            contact: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
            email: `${district.toLowerCase()}hp@moh.gov.zm`
          });
          facilityId++;
        }
        
        // Add a private clinic for some districts
        if (Math.random() > 0.7) {
          facilitiesToAdd.push({
            code: `${district.substring(0, 3).toUpperCase()}-PVT-${facilityId}`,
            name: `${district} Private Medical Centre`,
            province,
            district,
            type: "Clinic",
            level: "Level 2",
            ownership: "Private",
            status: "ACTIVE",
            contact: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
            email: `info@${district.toLowerCase()}private.com`
          });
          facilityId++;
        }
      }
    }
    
    // Insert facilities into database
    for (const facility of facilitiesToAdd) {
      await db.insert(facilities).values(facility);
    }
    
    console.log(`Added ${facilitiesToAdd.length} facilities to the database.`);
    console.log("Facilities setup complete!");
    
  } catch (error) {
    console.error("Error adding facilities:", error);
  } finally {
    // Close the database connection
    await db.end?.();
  }
}

// Execute the function
addFacilities();