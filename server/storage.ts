import { User, InsertUser, Patient, ArtFollowUp, Prescription, Facility, InsertFacility, PatientRelationship, InsertPatientRelationship } from "@shared/schema";
import { db } from "./db";
import { users, patients, artFollowUps, prescriptions, facilities, patientCore, patientContacts, patientAddress, patientFamily, patientPersonal, featureFlags, patientRelationships } from "@shared/schema";
import { eq, sql, asc, desc, like, SQL, or, and, ilike, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserFacility(userId: number, facility: string): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  updateUserPermissions(userId: number, permissions: string[]): Promise<User | undefined>;
  updateUserStatus(userId: number, active: boolean): Promise<User | undefined>;
  updateUser(userId: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined>;
  updateLastLogin(userId: number): Promise<User | undefined>;
  deleteUser(userId: number): Promise<void>;
  deleteAllUsersExceptAdmin(adminUserId: number): Promise<void>;
  
  // Facility methods
  getFacilityById(id: number): Promise<Facility | undefined>;
  getFacilityByName(name: string): Promise<Facility | undefined>;
  getAllFacilities(): Promise<Facility[]>;
  getFacilitiesPaginated(page: number, limit: number, search?: string, province?: string, district?: string): Promise<{ facilities: Facility[], total: number, hasMore: boolean }>;
  getFacilitiesByProvince(province: string): Promise<Facility[]>;
  getFacilitiesByDistrict(district: string): Promise<Facility[]>;
  getProvinces(): Promise<string[]>;
  getDistrictsByProvince(province: string): Promise<string[]>;
  getFacilityNames(): Promise<string[]>;
  createFacility(facility: InsertFacility): Promise<Facility>;
  updateFacility(id: number, facilityData: Partial<Facility>): Promise<Facility | undefined>;
  
  // Legacy method (to be deprecated)
  getFacilities(): Promise<string[]>;
  
  // Dashboard analytics methods
  getPatientCount(facility: string): Promise<number>;
  getMonthlyVisitCount(facility: string): Promise<number>;
  getActiveFacilityCount(): Promise<number>;
  getPatientRegistrationTrends(facility: string): Promise<any[]>;
  getServiceDistribution(facility: string): Promise<any[]>;
  getFacilityPerformanceMetrics(): Promise<any[]>;
  getDatabaseMetrics(): Promise<any>;
  getCacheMetrics(): Promise<any>;
  
  // Patient methods
  getPatients(
    facility: string, 
    options?: { 
      limit?: number; 
      sortBy?: string; 
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  searchPatients(facility: string, searchParams: {
    name?: string;
    nrc?: string;
    nupin?: string;
    cellphone?: string;
    sex?: string;
    minAge?: number;
    maxAge?: number;
  }): Promise<Patient[]>;
  getPatientByNrc(nrc: string): Promise<Patient | undefined>;
  getPatientByArtNumber(artNumber: string): Promise<Patient | undefined>;
  getPatientByNupin(nupin: string): Promise<Patient | undefined>;
  getPatientByCellphone(cellphone: string): Promise<Patient | undefined>;
  getPatientByPhoneNumber(phoneNumber: string): Promise<Patient | undefined>;
  searchPatientsByName(name: string): Promise<Patient[]>;
  searchPatientsByArtNumber(artNumber: string): Promise<Patient[]>;
  searchPatientsByNRC(nrc: string): Promise<Patient[]>;
  searchPatientsByNUPIN(nupin: string): Promise<Patient[]>;
  searchPatientsByCellphone(cellphone: string): Promise<Patient[]>;
  createPatient(patient: Omit<Patient, "id">): Promise<Patient>;
  
  // Clinical methods
  createArtFollowUp(followup: Omit<ArtFollowUp, "id">): Promise<ArtFollowUp>;
  createPrescription(prescription: Omit<Prescription, "id">): Promise<Prescription>;
  
  // Patient Relationship methods
  getPatientRelationships(patientId: number): Promise<PatientRelationship[]>;
  createPatientRelationship(relationship: Omit<PatientRelationship, "id" | "createdAt" | "updatedAt">): Promise<PatientRelationship>;
  deletePatientRelationship(id: number): Promise<void>;
  searchPatientsForRelationship(searchTerm: string, currentPatientId?: number): Promise<Patient[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true,
        tableName: 'session',
        disableTouch: false,
        ttl: 86400 // 24 hours in seconds
      });
    } catch (error) {
      console.warn('PostgreSQL session store initialization failed, using memory store:', error);
      // Fallback to memory store for development/testing
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async updateUserFacility(userId: number, facilityName: string): Promise<User> {
    // Get the facility to access its code
    const facility = await this.getFacilityByName(facilityName);
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        facility: facilityName,
        facilityCode: facility?.code || null 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      return undefined;
    }
  }
  
  async updateUserPermissions(userId: number, permissions: string[]): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ permissions })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return undefined;
    }
  }
  
  async updateUserStatus(userId: number, active: boolean): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ active })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user status:', error);
      return undefined;
    }
  }
  
  async updateUser(userId: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }
  
  async updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user password:', error);
      return undefined;
    }
  }
  
  async updateLastLogin(userId: number): Promise<User | undefined> {
    try {
      const now = new Date();
      const [updatedUser] = await db
        .update(users)
        .set({ lastLogin: now })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Error updating last login:', error);
      return undefined;
    }
  }
  
  async deleteUser(userId: number): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, userId));
      console.log(`User with ID: ${userId} has been deleted.`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
  
  async deleteAllUsersExceptAdmin(adminUserId: number): Promise<void> {
    try {
      await db.delete(users).where(
        sql`${users.id} != ${adminUserId}`
      );
      console.log(`All users except admin (ID: ${adminUserId}) have been deleted.`);
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }

  // Facility methods
  async getFacilityById(id: number): Promise<Facility | undefined> {
    try {
      const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
      return facility;
    } catch (error) {
      console.error("Error getting facility by ID:", error);
      return undefined;
    }
  }

  async getFacilityByName(name: string): Promise<Facility | undefined> {
    try {
      const [facility] = await db.select().from(facilities).where(eq(facilities.name, name));
      return facility;
    } catch (error) {
      console.error("Error getting facility by name:", error);
      return undefined;
    }
  }

  async getAllFacilities(): Promise<Facility[]> {
    try {
      return await db.select().from(facilities).orderBy(asc(facilities.name));
    } catch (error) {
      console.error("Error getting all facilities:", error);
      return [];
    }
  }

  async getFacilitiesPaginated(page: number = 1, limit: number = 50, search?: string, province?: string, district?: string): Promise<{ facilities: Facility[], total: number, hasMore: boolean }> {
    console.log(`DatabaseStorage.getFacilitiesPaginated called - page: ${page}, limit: ${limit}, search: "${search}", province: "${province}", district: "${district}"`);
    try {
      const offset = (page - 1) * limit;
      
      // Clean parameters - convert empty strings to undefined
      const cleanSearch = search?.trim() || undefined;
      const cleanProvince = province?.trim() || undefined;
      const cleanDistrict = district?.trim() || undefined;
      
      // Build where conditions
      const conditions = [];
      
      // Search condition
      if (cleanSearch) {
        conditions.push(or(
          ilike(facilities.name, `%${cleanSearch}%`),
          ilike(facilities.code, `%${cleanSearch}%`),
          ilike(facilities.province, `%${cleanSearch}%`),
          ilike(facilities.district, `%${cleanSearch}%`)
        ));
      }
      
      // Province filter
      if (cleanProvince) {
        conditions.push(eq(facilities.province, cleanProvince));
      }
      
      // District filter  
      if (cleanDistrict) {
        conditions.push(eq(facilities.district, cleanDistrict));
      }
      
      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count for pagination info
      let countQuery = db
        .select({ count: sql`count(*)` })
        .from(facilities);
      
      if (whereCondition) {
        countQuery = countQuery.where(whereCondition);
      }
      
      const [countResult] = await countQuery;
      const total = Number(countResult.count);

      // Get paginated facilities
      let facilitiesQuery = db
        .select()
        .from(facilities);
      
      if (whereCondition) {
        facilitiesQuery = facilitiesQuery.where(whereCondition);
      }
      
      const paginatedFacilities = await facilitiesQuery
        .orderBy(asc(facilities.name))
        .limit(limit)
        .offset(offset);

      const hasMore = offset + paginatedFacilities.length < total;

      console.log(`Retrieved ${paginatedFacilities.length} facilities (page ${page}/${Math.ceil(total / limit)})`);
      
      return {
        facilities: paginatedFacilities,
        total,
        hasMore
      };
    } catch (error) {
      console.error("Error getting paginated facilities:", error);
      return { facilities: [], total: 0, hasMore: false };
    }
  }

  async getFacilitiesByProvince(province: string): Promise<Facility[]> {
    try {
      return await db
        .select()
        .from(facilities)
        .where(eq(facilities.province, province))
        .orderBy(asc(facilities.name));
    } catch (error) {
      console.error("Error getting facilities by province:", error);
      return [];
    }
  }

  async getFacilitiesByDistrict(district: string): Promise<Facility[]> {
    try {
      return await db
        .select()
        .from(facilities)
        .where(eq(facilities.district, district))
        .orderBy(asc(facilities.name));
    } catch (error) {
      console.error("Error getting facilities by district:", error);
      return [];
    }
  }

  async getProvinces(): Promise<string[]> {
    try {
      const provincesResult = await db
        .select({ province: facilities.province })
        .from(facilities)
        .where(sql`${facilities.province} != '' AND ${facilities.province} IS NOT NULL`)
        .groupBy(facilities.province)
        .orderBy(asc(facilities.province));
      
      // Additional safety filter to ensure no empty values
      return provincesResult
        .map(result => result.province)
        .filter(province => province && province.trim() !== '');
    } catch (error) {
      console.error("Error getting provinces:", error);
      return [];
    }
  }

  async getDistrictsByProvince(province: string): Promise<string[]> {
    try {
      const districtsResult = await db
        .select({ district: facilities.district })
        .from(facilities)
        .where(sql`${facilities.province} = ${province} AND ${facilities.district} != '' AND ${facilities.district} IS NOT NULL`)
        .groupBy(facilities.district)
        .orderBy(asc(facilities.district));
      
      // Additional safety filter to ensure no empty values
      return districtsResult
        .map(result => result.district)
        .filter(district => district && district.trim() !== '');
    } catch (error) {
      console.error("Error getting districts by province:", error);
      return [];
    }
  }

  async getFacilityNames(): Promise<string[]> {
    try {
      const namesResult = await db
        .select({ name: facilities.name })
        .from(facilities)
        .orderBy(asc(facilities.name));
      
      return namesResult.map(result => result.name);
    } catch (error) {
      console.error("Error getting facility names:", error);
      return [];
    }
  }

  async createFacility(facilityData: InsertFacility): Promise<Facility> {
    try {
      const [facility] = await db.insert(facilities).values(facilityData).returning();
      return facility;
    } catch (error) {
      console.error("Error creating facility:", error);
      throw error;
    }
  }

  async updateFacility(id: number, facilityData: Partial<Facility>): Promise<Facility | undefined> {
    try {
      const [facility] = await db
        .update(facilities)
        .set(facilityData)
        .where(eq(facilities.id, id))
        .returning();
      return facility;
    } catch (error) {
      console.error("Error updating facility:", error);
      return undefined;
    }
  }

  // Legacy method - now gets names from the facilities table
  async getFacilities(): Promise<string[]> {
    try {
      // If facilities table has data, use it
      const facilityCount = await db.select({ count: sql<number>`count(*)` }).from(facilities);
      
      if (facilityCount[0].count > 0) {
        return this.getFacilityNames();
      }
      
      // Otherwise return hardcoded values (fallback)
      return [
        "Chipata Central Hospital",
        "Chikando Rural Health Centre",
        "Champhande Rural Health Centre"
      ];
    } catch (error) {
      console.error("Error getting facilities:", error);
      return [
        "Chipata Central Hospital",
        "Chikando Rural Health Centre",
        "Champhande Rural Health Centre"
      ];
    }
  }

  async getPatients(
    facility: string, 
    options?: { 
      limit?: number; 
      sortBy?: string; 
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<Patient[]> {
    try {
      // Start the query with the select statement
      let query = db.select({
        id: patients.id,
        firstName: patients.first_name,
        surname: patients.surname,
        sex: patients.sex,
        dateOfBirth: patients.date_of_birth,
        facility: patients.facility,
        nrc: patients.nrc,
        cellphoneNumber: patients.cellphone,
        otherCellphoneNumber: patients.other_cellphone,
        nupin: patients.nupin,
        mothersName: patients.mothers_name,
        mothersSurname: patients.mothers_surname,
        fathersName: patients.fathers_name,
        fathersSurname: patients.fathers_surname,
        homeLanguage: patients.home_language,
        maritalStatus: patients.marital_status,
        registrationDate: patients.registration_date
        // Omitting religious_category and other optional fields that might cause errors
      })
      .from(patients)
      .where(eq(patients.facility, facility));
      
      // Add sorting
      if (options?.sortBy) {
        // Handle special case for registrationDate which always exists
        if (options.sortBy === 'registrationDate') {
          query = options.sortOrder === 'asc' 
            ? query.orderBy(asc(patients.registration_date))
            : query.orderBy(desc(patients.registration_date));
        } 
        // Handle other sort fields (defaulting to id if invalid)
        else {
          query = options.sortOrder === 'asc'
            ? query.orderBy(asc(patients.id))
            : query.orderBy(desc(patients.id));
        }
      } else {
        // Default sort by most recent registration date
        query = query.orderBy(desc(patients.registration_date));
      }
      
      // Add limit if specified
      if (options?.limit && options.limit > 0) {
        query = query.limit(options.limit);
      }
      
      return query;
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    try {
      // Explicitly select columns to avoid issues with schema changes
      const [patient] = await db.select({
        id: patients.id,
        firstName: patients.first_name,
        surname: patients.surname,
        sex: patients.sex,
        dateOfBirth: patients.date_of_birth,
        facility: patients.facility,
        nrc: patients.nrc,
        cellphoneNumber: patients.cellphone,
        otherCellphoneNumber: patients.other_cellphone,
        nupin: patients.nupin,
        mothersName: patients.mothers_name,
        mothersSurname: patients.mothers_surname,
        fathersName: patients.fathers_name,
        fathersSurname: patients.fathers_surname,
        homeLanguage: patients.home_language,
        maritalStatus: patients.marital_status,
        email: patients.email,
        area: patients.area,
        cityTownVillage: patients.city_town_village,
        registrationDate: patients.registration_date
      })
      .from(patients)
      .where(eq(patients.id, id));
      
      return patient;
    } catch (error) {
      console.error("Error fetching patient by ID:", error);
      return undefined;
    }
  }
  
  async searchPatients(facility: string, searchParams: {
    name?: string;
    nrc?: string;
    nupin?: string;
    cellphone?: string;
    sex?: string;
    minAge?: number;
    maxAge?: number;
  }): Promise<Patient[]> {
    try {
      // Start with a raw SQL query that explicitly selects columns (avoiding religious_category)
      let queryStr = `
        SELECT 
          id, first_name, surname, sex, date_of_birth, 
          facility, nrc, cellphone, other_cellphone, 
          nupin, mothers_name, mothers_surname,
          fathers_name, fathers_surname, home_language,
          marital_status, email, napsa, registration_date
        FROM v_patients_legacy 
        WHERE facility = $1
      `;
      
      const queryParams: any[] = [facility];
      let paramCounter = 2;
      
      // Enhanced name search (searches in both firstName and surname)
      if (searchParams.name) {
        // Split search terms to allow searching for "John Doe" across first_name and surname
        const searchTerms = searchParams.name.trim().split(/\s+/);
        
        if (searchTerms.length === 1) {
          // Single term search - check both first_name and surname
          const nameLower = `%${searchTerms[0].toLowerCase()}%`;
          // Use ILIKE for case-insensitive search - will use the gin_trgm_ops indexes
          queryStr += ` AND (first_name ILIKE $${paramCounter} OR surname ILIKE $${paramCounter})`;
          queryParams.push(nameLower);
          paramCounter++;
        } else if (searchTerms.length >= 2) {
          // Multiple terms - try different combinations
          queryStr += ` AND (
            (first_name ILIKE $${paramCounter} AND surname ILIKE $${paramCounter + 1}) OR
            (first_name ILIKE $${paramCounter + 1} AND surname ILIKE $${paramCounter}) OR
            (first_name ILIKE $${paramCounter + 2}) OR
            (surname ILIKE $${paramCounter + 2})
          )`;
          
          // First term in first name, second in surname
          queryParams.push(`%${searchTerms[0].toLowerCase()}%`);
          // Second term in first name, first in surname
          queryParams.push(`%${searchTerms[1].toLowerCase()}%`);
          // Combined terms in either field
          queryParams.push(`%${searchTerms.join(' ').toLowerCase()}%`);
          paramCounter += 3;
        }
      }
      
      // Enhanced NRC search - more precise matching using indexes
      if (searchParams.nrc) {
        // Remove slashes and spaces for better matching
        const cleanNrc = searchParams.nrc.replace(/[\/\s]/g, '');
        queryStr += ` AND (
          nrc ILIKE $${paramCounter} OR 
          REPLACE(REPLACE(nrc, '/', ''), ' ', '') ILIKE $${paramCounter + 1}
        )`;
        // Search with exact format
        queryParams.push(`%${searchParams.nrc.toLowerCase()}%`);
        // Search with cleaned format
        queryParams.push(`%${cleanNrc.toLowerCase()}%`);
        paramCounter += 2;
      }
      
      // Enhanced NUPIN search - exact and partial matching
      if (searchParams.nupin) {
        // Remove dashes for better matching
        const cleanNupin = searchParams.nupin.replace(/-/g, '');
        queryStr += ` AND (
          nupin ILIKE $${paramCounter} OR
          REPLACE(nupin, '-', '') ILIKE $${paramCounter + 1}
        )`;
        queryParams.push(`%${searchParams.nupin}%`);
        queryParams.push(`%${cleanNupin}%`);
        paramCounter += 2;
      }
      
      // Enhanced cellphone search - handle different formats
      if (searchParams.cellphone) {
        // Remove spaces, dashes, and plus signs for better matching
        const cleanPhone = searchParams.cellphone.replace(/[\s\-\+]/g, '');
        
        // Use the last digits for more flexible matching
        const lastDigits = cleanPhone.length > 4 ? cleanPhone.slice(-4) : cleanPhone;
        
        queryStr += ` AND (
          cellphone ILIKE $${paramCounter} OR 
          other_cellphone ILIKE $${paramCounter} OR
          REPLACE(REPLACE(REPLACE(cellphone, ' ', ''), '-', ''), '+', '') ILIKE $${paramCounter + 1} OR
          REPLACE(REPLACE(REPLACE(other_cellphone, ' ', ''), '-', ''), '+', '') ILIKE $${paramCounter + 1} OR
          cellphone LIKE $${paramCounter + 2} OR
          other_cellphone LIKE $${paramCounter + 2}
        )`;
        
        queryParams.push(`%${searchParams.cellphone}%`); // Original format
        queryParams.push(`%${cleanPhone}%`);  // Cleaned format
        queryParams.push(`%${lastDigits}`);   // Last digits
        paramCounter += 3;
      }
      
      // Sex search (simple equality, will use index)
      if (searchParams.sex) {
        queryStr += ` AND sex = $${paramCounter}`;
        queryParams.push(searchParams.sex);
        paramCounter++;
      }
      
      // Add age range search using date of birth
      if (searchParams.minAge !== undefined || searchParams.maxAge !== undefined) {
        const today = new Date();
        
        if (searchParams.minAge !== undefined) {
          const maxDate = new Date();
          maxDate.setFullYear(today.getFullYear() - searchParams.minAge);
          queryStr += ` AND date_of_birth <= $${paramCounter}`;
          queryParams.push(maxDate);
          paramCounter++;
        }
        
        if (searchParams.maxAge !== undefined) {
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - searchParams.maxAge - 1);
          minDate.setDate(minDate.getDate() + 1); // Add 1 day to get correct range
          queryStr += ` AND date_of_birth > $${paramCounter}`;
          queryParams.push(minDate);
          paramCounter++;
        }
      }
      
      // Execute raw query
      const result = await pool.query(queryStr, queryParams);
      return result.rows as Patient[];
    } catch (error) {
      console.error("Error searching patients:", error);
      return [];
    }
  }
  
  async getPatientByNrc(nrc: string): Promise<Patient | undefined> {
    try {
      // Skip empty NRC
      if (!nrc || nrc.trim() === '') {
        return undefined;
      }
      
      // Normalize NRC format - remove spaces and slashes for better matching
      const normalizedNrc = nrc.replace(/[\s\/]/g, '');
      
      const [patient] = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
          // Omitting religious fields and other optional fields that might cause errors
        })
        .from(patients)
        .where(
          or(
            eq(patients.nrc, nrc), // Exact match first
            sql`REPLACE(REPLACE(${patients.nrc}, '/', ''), ' ', '') = ${normalizedNrc}` // Normalized match
          )
        );
      return patient;
    } catch (error) {
      console.error("Error getting patient by NRC:", error);
      return undefined;
    }
  }
  
  /**
   * Search for patients by NRC with flexible matching
   * @param nrc The NRC to search for
   * @returns Array of matching patients
   */
  async searchPatientsByNrc(nrc: string): Promise<Patient[]> {
    try {
      // Skip empty NRC
      if (!nrc || nrc.trim() === '') {
        return [];
      }
      
      // Normalize NRC format for better matching
      const normalizedNrc = nrc.replace(/[\s\/]/g, '');
      
      return await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          or(
            eq(patients.nrc, nrc), // Exact match
            sql`${patients.nrc} ILIKE ${`%${nrc}%`}`, // Partial match
            sql`REPLACE(REPLACE(${patients.nrc}, '/', ''), ' ', '') ILIKE ${`%${normalizedNrc}%`}` // Normalized partial match
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${patients.nrc} = ${nrc} THEN 1 
            WHEN ${patients.nrc} ILIKE ${`${nrc}%`} THEN 2
            ELSE 3
          END`
        )
        .limit(10);
    } catch (error) {
      console.error("Error searching patients by NRC:", error);
      return [];
    }
  }
  
  // Enhanced getPatientByNupin method - used for searching and validation
  async getPatientByNupin(nupin: string): Promise<Patient | undefined> {
    try {
      // Skip empty queries
      if (!nupin || nupin.trim() === '') {
        return undefined;
      }
      
      const [patient] = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
          // Omitting religious fields and other optional fields that might cause errors
        })
        .from(patients)
        .where(eq(patients.nupin, nupin));
      return patient;
    } catch (error) {
      console.error("Error getting patient by NUPIN:", error);
      return undefined;
    }
  }
  
  // Alias method for compatibility with search endpoint
  async getPatientByPhoneNumber(phoneNumber: string): Promise<Patient | undefined> {
    try {
      // Check in both cellphone and other_cellphone fields
      const [patient] = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          sql`${patients.cellphone} = ${phoneNumber} OR ${patients.other_cellphone} = ${phoneNumber}`
        );
      return patient;
    } catch (error) {
      console.error("Error getting patient by phone number:", error);
      return undefined;
    }
  }

  async getPatientByCellphone(cellphone: string): Promise<Patient | undefined> {
    try {
      const [patient] = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(eq(patients.cellphone, cellphone));
      return patient;
    } catch (error) {
      console.error("Error getting patient by cellphone:", error);
      return undefined;
    }
  }

  async getPatientByArtNumber(artNumber: string): Promise<Patient | undefined> {
    try {
      const [patient] = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          artNumber: patients.art_number,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(eq(patients.art_number, artNumber));
      return patient;
    } catch (error) {
      console.error("Error getting patient by ART number:", error);
      return undefined;
    }
  }
  
  // This is already implemented above - removed to avoid duplication
  
  /**
   * Enhanced search for patients by name (first name and/or surname)
   * This function is optimized for exact and partial name matching
   * 
   * @param name The name to search for (can be first name, surname, or full name)
   * @param options Optional parameters for filtering
   * @returns Array of matching patients, sorted by relevance
   */
  async searchPatientsByName(name: string, options?: {
    sex?: string;
    facility?: string;
    limit?: number;
  }): Promise<Patient[]> {
    try {
      // Split search terms to allow searching for "John Doe" across first_name and surname
      const searchTerms = name.trim().split(/\s+/);
      const limit = options?.limit || 50;
      
      // Build query with different approaches based on number of search terms
      let query = db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients);
      
      // Add facility filter if provided
      if (options?.facility) {
        query = query.where(eq(patients.facility, options.facility));
      }
      
      // Add sex filter if provided
      if (options?.sex) {
        query = query.where(eq(patients.sex, options.sex));
      }
      
      // Handle different search scenarios
      if (searchTerms.length === 1) {
        // Single term search - check both first_name and surname
        query = query.where(
          or(
            // Use ILIKE equivalent in SQL for case-insensitive search - uses indexes
            sql`${patients.first_name} ILIKE ${`%${searchTerms[0]}%`}`,
            sql`${patients.surname} ILIKE ${`%${searchTerms[0]}%`}`
          )
        );
      } else if (searchTerms.length >= 2) {
        // Multiple terms - we need to handle various combinations
        const firstTerm = `%${searchTerms[0]}%`;
        const secondTerm = `%${searchTerms[1]}%`;
        const fullSearch = `%${searchTerms.join(' ')}%`;
        
        query = query.where(
          or(
            // First term in first name, second in surname (typical case)
            and(
              sql`${patients.first_name} ILIKE ${firstTerm}`,
              sql`${patients.surname} ILIKE ${secondTerm}`
            ),
            // Second term in first name, first in surname (reversed order)
            and(
              sql`${patients.first_name} ILIKE ${secondTerm}`,
              sql`${patients.surname} ILIKE ${firstTerm}`
            ),
            // Full term in first name
            sql`${patients.first_name} ILIKE ${fullSearch}`,
            // Full term in surname
            sql`${patients.surname} ILIKE ${fullSearch}`
          )
        );
      }
      
      // Add ordering by relevance
      // We'll use a common technique to order results with exact matches first
      query = query.orderBy(
        sql`CASE 
          WHEN ${patients.first_name} ILIKE ${name + '%'} THEN 1
          WHEN ${patients.surname} ILIKE ${name + '%'} THEN 2
          WHEN ${patients.first_name} ILIKE ${'%' + name + '%'} THEN 3
          WHEN ${patients.surname} ILIKE ${'%' + name + '%'} THEN 4
          ELSE 5
        END`,
        desc(patients.registration_date)
      );
      
      // Apply limit
      query = query.limit(limit);
      
      return await query;
    } catch (error) {
      console.error("Error searching patients by name:", error);
      return [];
    }
  }

  async createPatientNormalized(data: any): Promise<any> {
    const userId = 2; // Default user ID for now
    
    // Get facility ID
    const facility = await db.select().from(facilities).where(eq(facilities.name, data.facility)).limit(1);
    const facilityId = facility[0]?.id || 1;
    
    // Start transaction for normalized patient creation
    return await db.transaction(async (tx) => {
      // 1. Create core patient record
      const [patient] = await tx.insert(patientCore).values({
        firstName: data.firstName,
        surname: data.surname,
        dateOfBirth: data.dateOfBirth,
        isEstimatedDob: data.isEstimatedDob,
        sex: data.sex,
        nrc: data.nrc,
        noNrc: data.noNrc,
        underFiveCardNumber: data.underFiveCardNumber,
        napsa: data.napsa,
        nupin: data.nupin,
        country: data.country,
        facilityId: facilityId,
        createdBy: userId,
        updatedBy: userId
      }).returning();
      
      // 2. Create contact records
      if (data.contacts && data.contacts.length > 0) {
        await tx.insert(patientContacts).values(
          data.contacts.map((contact: any) => ({
            patientId: patient.id,
            contactType: contact.type,
            contactValue: contact.value,
            isPrimary: contact.isPrimary,
            createdBy: userId
          }))
        );
      }
      
      // 3. Create address record
      if (data.address && Object.values(data.address).some(v => v)) {
        await tx.insert(patientAddress).values({
          patientId: patient.id,
          houseNumber: data.address.houseNumber,
          roadStreet: data.address.roadStreet,
          area: data.address.area,
          cityTownVillage: data.address.cityTownVillage,
          landmarks: data.address.landmarks,
          createdBy: userId
        });
      }
      
      // 4. Create family records
      if (data.family && data.family.length > 0) {
        await tx.insert(patientFamily).values(
          data.family.map((member: any) => ({
            patientId: patient.id,
            relation: member.relation,
            firstName: member.firstName,
            surname: member.surname,
            isDeceased: member.isDeceased,
            nrc: member.nrc,
            napsaPspf: member.napsaPspf,
            nationality: member.nationality,
            contactPhone: member.contactPhone,
            createdBy: userId
          }))
        );
      }
      
      // 5. Create personal information record
      if (data.personal && Object.values(data.personal).some(v => v)) {
        await tx.insert(patientPersonal).values({
          patientId: patient.id,
          maritalStatus: data.personal.maritalStatus,
          spouseFirstName: data.personal.spouseFirstName,
          spouseSurname: data.personal.spouseSurname,
          homeLanguage: data.personal.homeLanguage,
          otherHomeLanguage: data.personal.otherHomeLanguage,
          isBornInZambia: data.personal.isBornInZambia,
          provinceOfBirth: data.personal.provinceOfBirth,
          districtOfBirth: data.personal.districtOfBirth,
          birthPlace: data.personal.birthPlace,
          religiousCategory: data.personal.religiousCategory,
          religiousDenomination: data.personal.religiousDenomination,
          otherReligiousDenomination: data.personal.otherReligiousDenomination,
          educationLevel: data.personal.educationLevel,
          otherEducationLevel: data.personal.otherEducationLevel,
          occupation: data.personal.occupation,
          otherOccupation: data.personal.otherOccupation,
          createdBy: userId
        });
      }
      
      // Return the created patient with basic info
      return {
        id: patient.id,
        firstName: patient.firstName,
        surname: patient.surname,
        dateOfBirth: patient.dateOfBirth,
        sex: patient.sex,
        facility: data.facility,
        createdAt: patient.createdAt
      };
    });
  }

  async createPatient(patientData: Omit<Patient, "id">): Promise<Patient> {
    try {
      // Check if NRC already exists (if provided)
      if (patientData.nrc) {
        const existingPatient = await this.getPatientByNrc(patientData.nrc);
        if (existingPatient) {
          throw new Error(`Patient with NRC ${patientData.nrc} already exists`);
        }
      }
      
      // Create the patient if NRC is unique or not provided
      const [patient] = await db.insert(patients).values(patientData).returning();
      return patient;
    } catch (error) {
      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`Patient with NRC ${patientData.nrc} already exists`);
      }
      
      // Re-throw the original error
      throw error;
    }
  }

  async createArtFollowUp(followupData: Omit<ArtFollowUp, "id">): Promise<ArtFollowUp> {
    const [followup] = await db.insert(artFollowUps).values(followupData).returning();
    return followup;
  }

  async createPrescription(prescriptionData: Omit<Prescription, "id">): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(prescriptionData).returning();
    return prescription;
  }

  // Dashboard analytics methods for real data
  async getPatientCount(facility: string): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)::int` })
        .from(patients)
        .where(eq(patients.facility, facility));
      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting patient count:", error);
      return 0;
    }
  }

  async getMonthlyVisitCount(facility: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await db.select({ count: sql`count(*)::int` })
        .from(patients)
        .where(and(
          eq(patients.facility, facility),
          sql`${patients.registration_date} >= ${thirtyDaysAgo}`
        ));
      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting monthly visit count:", error);
      return 0;
    }
  }

  async getActiveFacilityCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(distinct ${facilities.name})::int` })
        .from(facilities);
      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting active facility count:", error);
      return 0;
    }
  }

  async getPatientRegistrationTrends(facility: string): Promise<any[]> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const results = await db.select({
        month: sql`to_char(${patients.registration_date}, 'Mon')`,
        newPatients: sql`count(*)::int`
      })
      .from(patients)
      .where(and(
        eq(patients.facility, facility),
        sql`${patients.registration_date} >= ${sixMonthsAgo}`
      ))
      .groupBy(sql`to_char(${patients.registration_date}, 'Mon'), extract(month from ${patients.registration_date})`)
      .orderBy(sql`extract(month from ${patients.registration_date})`);
      
      return results;
    } catch (error) {
      console.error("Error getting patient registration trends:", error);
      return [];
    }
  }

  async getServiceDistribution(facility: string): Promise<any[]> {
    try {
      // Get distribution based on actual patient data
      const results = await db.select({
        service: sql`case 
          when ${patients.sex} = 'Female' and extract(years from age(${patients.date_of_birth})) between 15 and 49 then 'ANC'
          when exists(select 1 from ${artFollowUps} where ${artFollowUps.patientId} = ${patients.id}) then 'ART'
          else 'General'
        end`,
        count: sql`count(*)::int`
      })
      .from(patients)
      .where(eq(patients.facility, facility))
      .groupBy(sql`case 
        when ${patients.sex} = 'Female' and extract(years from age(${patients.date_of_birth})) between 15 and 49 then 'ANC'
        when exists(select 1 from ${artFollowUps} where ${artFollowUps.patientId} = ${patients.id}) then 'ART'
        else 'General'
      end`);
      
      return results.map(r => ({ name: r.service, value: r.count }));
    } catch (error) {
      console.error("Error getting service distribution:", error);
      return [];
    }
  }

  async getFacilityPerformanceMetrics(): Promise<any[]> {
    try {
      const results = await db.select({
        facility: facilities.name,
        patients: sql`count(${patients.id})::int`,
        // Mock satisfaction rating - would come from survey data
        satisfaction: sql`4.0 + (random() * 1.0)`
      })
      .from(facilities)
      .leftJoin(patients, eq(facilities.name, patients.facility))
      .groupBy(facilities.name)
      .orderBy(sql`count(${patients.id}) desc`);
      
      return results;
    } catch (error) {
      console.error("Error getting facility performance metrics:", error);
      return [];
    }
  }

  async getDatabaseMetrics(): Promise<any> {
    try {
      const connectionCount = await db.select({ count: sql`count(*)::int` })
        .from(sql`pg_stat_activity`)
        .where(sql`datname = current_database()`);
        
      const dbSize = await db.select({ size: sql`pg_size_pretty(pg_database_size(current_database()))` })
        .from(sql`pg_database`);
        
      return {
        activeConnections: connectionCount[0]?.count || 0,
        databaseSize: dbSize[0]?.size || 'Unknown',
        averageQueryTime: '45ms' // Would be calculated from pg_stat_statements
      };
    } catch (error) {
      console.error("Error getting database metrics:", error);
      return {
        activeConnections: 0,
        databaseSize: 'Unknown',
        averageQueryTime: 'Unknown'
      };
    }
  }

  async getCacheMetrics(): Promise<any> {
    // Return basic cache metrics - would integrate with actual cache service
    return {
      hitRate: 87,
      missRate: 13,
      totalRequests: 1247,
      cacheSize: '24.8 MB'
    };
  }

  // Search methods for unified search interface
  async searchPatientsByArtNumber(artNumber: string): Promise<Patient[]> {
    try {
      if (!artNumber || artNumber.trim() === '') {
        return [];
      }
      
      const results = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          artNumber: patients.art_number,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          or(
            eq(patients.art_number, artNumber), // Exact match
            sql`${patients.art_number} ILIKE ${`%${artNumber}%`}` // Partial match
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${patients.art_number} = ${artNumber} THEN 1 
            WHEN ${patients.art_number} ILIKE ${`${artNumber}%`} THEN 2
            ELSE 3
          END`
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error("Error searching patients by ART number:", error);
      return [];
    }
  }

  async searchPatientsByNRC(nrc: string): Promise<Patient[]> {
    try {
      if (!nrc || nrc.trim() === '') {
        return [];
      }
      
      const normalizedNrc = nrc.replace(/[\s\/]/g, '');
      
      const results = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          or(
            eq(patients.nrc, nrc), // Exact match
            sql`${patients.nrc} ILIKE ${`%${nrc}%`}`, // Partial match
            sql`REPLACE(REPLACE(${patients.nrc}, '/', ''), ' ', '') ILIKE ${`%${normalizedNrc}%`}` // Normalized partial match
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${patients.nrc} = ${nrc} THEN 1 
            WHEN ${patients.nrc} ILIKE ${`${nrc}%`} THEN 2
            ELSE 3
          END`
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error("Error searching patients by NRC:", error);
      return [];
    }
  }

  async searchPatientsByNUPIN(nupin: string): Promise<Patient[]> {
    try {
      if (!nupin || nupin.trim() === '') {
        return [];
      }
      
      const results = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          or(
            eq(patients.nupin, nupin), // Exact match
            sql`${patients.nupin} ILIKE ${`%${nupin}%`}` // Partial match
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${patients.nupin} = ${nupin} THEN 1 
            WHEN ${patients.nupin} ILIKE ${`${nupin}%`} THEN 2
            ELSE 3
          END`
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error("Error searching patients by NUPIN:", error);
      return [];
    }
  }

  async searchPatientsByCellphone(cellphone: string): Promise<Patient[]> {
    try {
      if (!cellphone || cellphone.trim() === '') {
        return [];
      }
      
      const results = await db
        .select({
          id: patients.id,
          firstName: patients.first_name,
          surname: patients.surname,
          sex: patients.sex,
          dateOfBirth: patients.date_of_birth,
          facility: patients.facility,
          nrc: patients.nrc,
          cellphoneNumber: patients.cellphone,
          otherCellphoneNumber: patients.other_cellphone,
          nupin: patients.nupin,
          mothersName: patients.mothers_name,
          mothersSurname: patients.mothers_surname,
          fathersName: patients.fathers_name,
          fathersSurname: patients.fathers_surname,
          homeLanguage: patients.home_language,
          maritalStatus: patients.marital_status
        })
        .from(patients)
        .where(
          or(
            eq(patients.cellphone, cellphone), // Primary cellphone exact match
            eq(patients.other_cellphone, cellphone), // Other cellphone exact match
            sql`${patients.cellphone} ILIKE ${`%${cellphone}%`}`, // Primary cellphone partial match
            sql`${patients.other_cellphone} ILIKE ${`%${cellphone}%`}` // Other cellphone partial match
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${patients.cellphone} = ${cellphone} OR ${patients.other_cellphone} = ${cellphone} THEN 1 
            WHEN ${patients.cellphone} ILIKE ${`${cellphone}%`} OR ${patients.other_cellphone} ILIKE ${`${cellphone}%`} THEN 2
            ELSE 3
          END`
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error("Error searching patients by cellphone:", error);
      return [];
    }
  }

  // Patient Relationship methods
  async getPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    try {
      const relationships = await db.select()
        .from(patientRelationships)
        .where(
          or(
            eq(patientRelationships.patientId, patientId),
            eq(patientRelationships.relatedPatientId, patientId)
          )
        );
      
      return relationships;
    } catch (error) {
      console.error('Error fetching patient relationships:', error);
      return [];
    }
  }

  async createPatientRelationship(relationshipData: Omit<PatientRelationship, "id" | "createdAt" | "updatedAt">): Promise<PatientRelationship> {
    try {
      const [relationship] = await db.insert(patientRelationships)
        .values({
          ...relationshipData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Create bidirectional relationship for certain types
      if (relationshipData.relationshipType === 'sibling' || relationshipData.relationshipType === 'spouse') {
        await db.insert(patientRelationships)
          .values({
            patientId: relationshipData.relatedPatientId,
            relatedPatientId: relationshipData.patientId,
            relationshipType: relationshipData.relationshipType,
            facilityId: relationshipData.facilityId,
            isHousehold: relationshipData.isHousehold,
            isTbContact: relationshipData.isTbContact,
            isHtsIndex: relationshipData.isHtsIndex,
            isBuddy: relationshipData.isBuddy,
            isGuardian: relationshipData.isGuardian,
            createdBy: relationshipData.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
      }
      
      return relationship;
    } catch (error) {
      console.error('Error creating patient relationship:', error);
      throw error;
    }
  }

  async deletePatientRelationship(id: number): Promise<void> {
    try {
      await db.delete(patientRelationships).where(eq(patientRelationships.id, id));
    } catch (error) {
      console.error('Error deleting patient relationship:', error);
      throw error;
    }
  }

  async searchPatientsForRelationship(searchTerm: string, currentPatientId?: number): Promise<Patient[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      
      let query = db.select()
        .from(patients)
        .where(
          or(
            ilike(sql`CONCAT(${patients.first_name}, ' ', ${patients.surname})`, searchPattern),
            ilike(patients.nrc, searchPattern),
            ilike(patients.nupin, searchPattern),
            ilike(patients.cellphone, searchPattern),
            ilike(patients.art_number, searchPattern)
          )
        )
        .limit(20);
      
      // Exclude current patient from results
      if (currentPatientId) {
        query = query.where(sql`${patients.id} != ${currentPatientId}`);
      }
      
      const results = await query;
      return results;
    } catch (error) {
      console.error('Error searching patients for relationship:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();