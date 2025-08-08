import { db } from "../server/db";
import { users } from "../shared/schema";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
  const username = "testuser";
  const password = "test123";
  
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
    
    if (existingUser) {
      console.log(`User '${username}' already exists. Updating to remove facility assignment.`);
      
      // Update existing user to remove facility assignment
      await db
        .update(users)
        .set({
          facility: null,
          facilityCode: null
        })
        .where(eq(users.username, username));
      
      console.log(`Updated '${username}' to have no facility assignment.`);
      
    } else {
      // Create a new user with no facility
      const hashedPassword = await hashPassword(password);
      
      await db.insert(users).values({
        username,
        password: hashedPassword,
        role: "clinician",
        facility: null,
        facilityCode: null,
        isAdmin: false,
        active: true
      });
      
      console.log(`Created test user '${username}' with password '${password}' and no facility assignment.`);
    }
    
    console.log("Login with these credentials:");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

createTestUser();