import { db } from "../server/db";
import { users, USER_ROLES } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createNewAdmin() {
  try {
    // Set custom admin details here
    const adminDetails = {
      username: "superadmin",
      password: "Zambia@2025",
      fullName: "Super Administrator",
      email: "superadmin@smartcare.com",
      facility: "MoH",
      facilityCode: "MoH-HQ",
      phoneNumber: "0900000001"
    };
    
    console.log("Creating new admin user...");
    
    // Check if admin already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.username, adminDetails.username))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log(`User '${adminDetails.username}' already exists. Please choose a different username.`);
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(adminDetails.password);
    
    // Insert the new admin user
    const result = await db.insert(users).values({
      username: adminDetails.username,
      password: hashedPassword,
      role: USER_ROLES.SYSTEM_ADMIN,
      facility: adminDetails.facility,
      facilityCode: adminDetails.facilityCode,
      isAdmin: true,
      email: adminDetails.email,
      fullName: adminDetails.fullName,
      active: true,
      phoneNumber: adminDetails.phoneNumber,
      permissions: ["*"], // Full permissions
    }).returning({ id: users.id });
    
    if (result.length > 0) {
      console.log("\n=== NEW ADMIN CREATED SUCCESSFULLY ===");
      console.log(`Username: ${adminDetails.username}`);
      console.log(`Password: ${adminDetails.password}`);
      console.log(`Full Name: ${adminDetails.fullName}`);
      console.log(`Email: ${adminDetails.email}`);
      console.log(`Admin ID: ${result[0].id}`);
      console.log("=======================================");
      console.log("Please keep these credentials secure and change the password after first login.");
    } else {
      console.log("Failed to create admin user. No ID returned.");
    }
    
  } catch (error) {
    console.error("Error creating new admin user:", error);
  } finally {
    // Close the database connection pool if needed
    await db.end?.();
  }
}

// Execute the function
createNewAdmin();