// Direct storage implementation with proper method binding
import { db } from "./db";
import { 
  patients, users, facilities, ancRecords, artRecords, 
  pharmacovigilanceRecords, patientAddress, patientPersonal,
  type User, type Patient, type Facility
} from "@shared/schema";
import { eq, isNotNull, ne, or, and, ilike, sql, count } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserStatus(userId: number, active: boolean): Promise<User | undefined>;
  deleteUser(userId: number): Promise<boolean>;

  // Patient management
  getPatients(facility?: string, options?: { limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: Omit<Patient, 'id'>): Promise<Patient>;

  // Facility management
  getAllFacilities(): Promise<Facility[]>;
  getFacility(code: string): Promise<Facility | undefined>;
  getFacilitiesByDistrict(district: string): Promise<Facility[]>;
  getFacilitiesPaginated(page: number, limit: number, search?: string, province?: string, district?: string): Promise<{ facilities: Facility[], total: number, hasMore: boolean }>;
  getProvinces(): Promise<string[]>;
  getDistrictsByProvince(province: string): Promise<string[]>;
  getFacilitiesByProvince(province: string): Promise<Facility[]>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    console.log('DatabaseStorage.getAllUsers called');
    const allUsers = await db.select().from(users);
    console.log('Retrieved users:', allUsers.length);
    return allUsers;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(userId: number, active: boolean): Promise<User | undefined> {
    console.log('DatabaseStorage.updateUserStatus called:', userId, active);
    const [user] = await db
      .update(users)
      .set({ active })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async deleteUser(userId: number): Promise<boolean> {
    console.log('DatabaseStorage.deleteUser called:', userId);
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount > 0;
  }

  async getPatients(facility?: string, options?: { limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Patient[]> {
    console.log('DatabaseStorage.getPatients called');
    let query = db.select().from(patients);
    
    if (facility) {
      query = query.where(eq(patients.facility, facility));
    }

    const result = await query;
    console.log('Retrieved patients:', result.length);
    return result;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    return newPatient;
  }

  async getAllFacilities(): Promise<Facility[]> {
    console.log('DatabaseStorage.getAllFacilities called');
    const allFacilities = await db.select().from(facilities);
    console.log('Retrieved facilities:', allFacilities.length);
    return allFacilities;
  }

  async getFacility(code: string): Promise<Facility | undefined> {
    const [facility] = await db.select().from(facilities).where(eq(facilities.code, code));
    return facility || undefined;
  }

  async getFacilitiesByDistrict(district: string): Promise<Facility[]> {
    console.log('DatabaseStorage.getFacilitiesByDistrict called for district:', district);
    const districtFacilities = await db.select().from(facilities).where(eq(facilities.district, district));
    console.log('Retrieved facilities for district:', districtFacilities.length);
    return districtFacilities;
  }

  async getProvinces(): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ province: facilities.province })
        .from(facilities)
        .where(isNotNull(facilities.province))
        .orderBy(facilities.province);
      
      return result
        .map(row => row.province)
        .filter(province => province && province.trim() !== '');
    } catch (error) {
      console.error("Error getting provinces:", error);
      return [];
    }
  }

  async getDistrictsByProvince(province: string): Promise<string[]> {
    try {
      const result = await db
        .selectDistinct({ district: facilities.district })
        .from(facilities)
        .where(eq(facilities.province, province))
        .orderBy(facilities.district);
      
      return result
        .map(row => row.district)
        .filter(district => district && district.trim() !== '');
    } catch (error) {
      console.error("Error getting districts by province:", error);
      return [];
    }
  }

  async getFacilitiesByProvince(province: string): Promise<Facility[]> {
    try {
      return await db
        .select()
        .from(facilities)
        .where(eq(facilities.province, province))
        .orderBy(facilities.name);
    } catch (error) {
      console.error("Error getting facilities by province:", error);
      return [];
    }
  }

  async getFacilitiesPaginated(page: number = 1, limit: number = 50, search?: string, province?: string, district?: string): Promise<{ facilities: Facility[], total: number, hasMore: boolean }> {
    console.log(`DatabaseStorage.getFacilitiesPaginated called - page: ${page}, limit: ${limit}, search: "${search}", province: "${province}", district: "${district}"`);
    try {
      const offset = (page - 1) * limit;
      
      // Clean parameters
      const cleanSearch = search?.trim() || undefined;
      const cleanProvince = province?.trim() || undefined;
      const cleanDistrict = district?.trim() || undefined;
      
      // Start with base query
      let baseQuery = db.select().from(facilities);
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(facilities);
      
      // Apply filters
      const conditions = [];
      
      if (cleanSearch) {
        const searchCondition = or(
          ilike(facilities.name, `%${cleanSearch}%`),
          ilike(facilities.code, `%${cleanSearch}%`),
          ilike(facilities.province, `%${cleanSearch}%`),
          ilike(facilities.district, `%${cleanSearch}%`)
        );
        conditions.push(searchCondition);
      }
      
      if (cleanProvince) {
        conditions.push(eq(facilities.province, cleanProvince));
      }
      
      if (cleanDistrict) {
        conditions.push(eq(facilities.district, cleanDistrict));
      }
      
      if (conditions.length > 0) {
        const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
        baseQuery = baseQuery.where(whereCondition);
        countQuery = countQuery.where(whereCondition);
      }
      
      // Get total count
      const [{ count: total }] = await countQuery;
      
      // Get paginated results
      const paginatedFacilities = await baseQuery
        .orderBy(facilities.name)
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
}

export const storage = new DatabaseStorage();