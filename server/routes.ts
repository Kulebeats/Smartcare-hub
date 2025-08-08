import express, { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import session from "express-session";
import { db } from "./db";
import {
  users,
  patients,
  facilities,
  ancRecords,
  dakProcessingJobs,
  dakRules,
  dakComplianceReports,
  dakCacheMetrics,
  type User,
  type Patient,
  type Facility,
  type AncRecord,
  type DakProcessingJob,
  type DakRule,
  type DakComplianceReport,
  type DakCacheMetric,
} from "@shared/schema";
import { eq, and, or, like, desc, asc, count, sql } from "drizzle-orm";
import { storage } from "./storage";
import multer from "multer";
import { parse } from "csv-parse";
import { Transform } from "stream";
import NodeCache from "node-cache";

const scryptAsync = promisify(scrypt);

// Initialize performance optimizers and cache
class FallbackPerformanceOptimizer {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
  }

  async optimizeQuery(query: string, params: any[]): Promise<any> {
    const cacheKey = `query_${Buffer.from(query + JSON.stringify(params)).toString('base64')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Fallback optimization - return params as-is
    const result = { query, params, optimized: true };
    this.cache.set(cacheKey, result);
    return result;
  }

  async clearCache(tag?: string): Promise<{ cleared: boolean; tag?: string }> {
    if (tag) {
      this.cache.del(tag);
      return { cleared: true, tag };
    }
    this.cache.flushAll();
    return { cleared: true };
  }

  async getCacheStats(): Promise<{ hitRate: number; totalQueries: number; cacheSize: number; lastUpdated: string }> {
    const stats = this.cache.getStats();
    return {
      hitRate: stats.hits / (stats.hits + stats.misses) || 0,
      totalQueries: stats.hits + stats.misses,
      cacheSize: stats.keys,
      lastUpdated: new Date().toISOString()
    };
  }
}

const fallbackPerformanceOptimizer = new FallbackPerformanceOptimizer();

// Simple cache for rules
const ruleCache = new NodeCache({ stdTTL: 3600 });

function invalidateRuleCache(moduleCode?: string) {
  if (moduleCode) {
    ruleCache.del(moduleCode);
  } else {
    ruleCache.flushAll();
  }
}

// Check if user is admin
function isAdminUser(req: Request): boolean {
  const user = (req as any).user;
  return user && (user.role === "superadmin" || user.permissions?.includes("admin"));
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return buf.toString("hex") + "." + salt;
}

// Mock ensureAuthenticated middleware (replace with your actual implementation)
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.session?.user) {
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
}

// Alias for requireAuth
const requireAuth = ensureAuthenticated;

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'smartcare-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  }));

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // User authentication routes - prioritize custom auth
  app.post("/api/smartcare/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required" 
        });
      }

      // Get user from database with case-insensitive lookup
      const normalizedUsername = username.toLowerCase().trim();
      let user = await storage.getUserByUsername(username);
      
      // If exact match fails, try case-insensitive match
      if (!user && username !== normalizedUsername) {
        user = await storage.getUserByUsername(normalizedUsername);
      }
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid credentials" 
        });
      }

      // Verify password
      const [storedHash, salt] = user.password.split(".");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hash = buf.toString("hex");

      if (hash !== storedHash) {
        return res.status(401).json({ 
          message: "Invalid credentials" 
        });
      }

      // Set session - ensure session exists
      if (!req.session) {
        return res.status(500).json({ message: "Session not initialized" });
      }
      
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role,
        facility: user.facility,
        permissions: user.permissions
      };

      // Update last login (skip if method doesn't exist)
      try {
        if ('updateLastLogin' in storage) {
          await (storage as any).updateLastLogin(user.id);
        }
      } catch (error) {
        console.log("Could not update last login time:", error);
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          facility: user.facility,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    (req.session as any).user = null;
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (req.session && (req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Select facility without authentication (for initial setup)
  app.post("/api/select-facility-public", async (req: Request, res: Response) => {
    try {
      const { facility, facilityCode } = req.body;
      
      if (!facility) {
        return res.status(400).json({ message: "Facility is required" });
      }

      // Store facility selection in session for later use
      req.session.selectedFacility = facility;
      req.session.selectedFacilityCode = facilityCode;
      
      return res.json({ 
        message: "Facility selected successfully",
        facility: facility,
        facilityCode: facilityCode
      });
    } catch (error) {
      console.error("Error selecting facility:", error);
      res.status(500).json({ message: "Failed to select facility" });
    }
  });

  // Update user facility
  app.patch("/api/user/facility", async (req: Request, res: Response) => {
    try {
      const { facility, facilityCode } = req.body;
      
      if (!facility) {
        return res.status(400).json({ message: "Facility is required" });
      }

      // Allow facility selection without authentication for initial setup
      const sessionUser = (req.session as any)?.user;
      
      // If no authenticated user, store facility selection in session for later use
      if (!sessionUser?.id) {
        req.session.selectedFacility = facility;
        req.session.selectedFacilityCode = facilityCode;
        
        return res.json({ 
          message: "Facility selected successfully",
          facility: facility,
          facilityCode: facilityCode
        });
      }

      // Update user's facility in database
      const [updatedUser] = await db
        .update(users)
        .set({ 
          facility: facility,
          facilityCode: facilityCode || null
        })
        .where(eq(users.id, sessionUser.id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session with new facility info
      (req.session as any).user = {
        ...sessionUser,
        facility: facility,
        facilityCode: facilityCode || null
      };

      res.json({
        message: "Facility updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          facility: updatedUser.facility,
          facilityCode: updatedUser.facilityCode,
          permissions: updatedUser.permissions
        }
      });
    } catch (error) {
      console.error("Error updating facility:", error);
      res.status(500).json({ message: "Failed to update facility" });
    }
  });

  // User management routes
  app.get("/api/users", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const usersList = await storage.getAllUsers();
      res.json(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/users", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userData = req.body;
      
      // Hash password
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Facility routes
  app.get("/api/facilities", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const { search, province, district } = req.query;
      const facilitiesList = await storage.getFacilities({
        search: search as string,
        province: province as string,
        district: district as string
      });
      res.json(facilitiesList);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ message: "Error fetching facilities" });
    }
  });

  app.get("/api/facilities/count", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const totalCount = await storage.getFacilitiesCount();
      res.json({ count: totalCount });
    } catch (error) {
      console.error("Error fetching facilities count:", error);
      res.status(500).json({ message: "Error fetching facilities count" });
    }
  });

  app.post("/api/facilities", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const facilityData = req.body;
      const newFacility = await storage.createFacility(facilityData);
      res.status(201).json(newFacility);
    } catch (error) {
      console.error("Error creating facility:", error);
      res.status(500).json({ message: "Error creating facility" });
    }
  });

  // Search facilities by name, district, or province
  app.get("/api/facilities/search", async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.q as string;
      
      if (!searchQuery || searchQuery.length < 2) {
        return res.json([]);
      }

      const searchTerm = `%${searchQuery.toLowerCase()}%`;
      
      const searchResults = await db
        .select({
          id: facilities.id,
          name: facilities.name,
          district: facilities.district,
          province: facilities.province,
          type: facilities.type,
          himsCode: facilities.himsCode
        })
        .from(facilities)
        .where(
          sql`(
            LOWER(${facilities.name}) LIKE ${searchTerm} OR
            LOWER(${facilities.district}) LIKE ${searchTerm} OR
            LOWER(${facilities.province}) LIKE ${searchTerm} OR
            LOWER(${facilities.type}) LIKE ${searchTerm}
          )`
        )
        .orderBy(facilities.name)
        .limit(20);

      res.json(searchResults);
    } catch (error) {
      console.error("Error searching facilities:", error);
      res.status(500).json({ message: "Failed to search facilities" });
    }
  });

  // Get all facilities without pagination for facility selection
  app.get("/api/facilities/all", async (req: Request, res: Response) => {
    try {
      const facilitiesData = await db.select().from(facilities);
      res.json(facilitiesData);
    } catch (error) {
      console.error("Error fetching all facilities:", error);
      res.status(500).json({ message: "Failed to fetch all facilities" });
    }
  });

  // Get all provinces
  app.get("/api/facilities/provinces", async (req: Request, res: Response) => {
    try {
      const provinceData = await db
        .selectDistinct({ province: facilities.province })
        .from(facilities)
        .where(sql`${facilities.province} IS NOT NULL AND ${facilities.province} != ''`);
      
      const provinces = provinceData
        .map(row => row.province)
        .filter(province => province && province.trim() !== '')
        .sort();
      
      res.json(provinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      res.status(500).json({ message: "Failed to fetch provinces" });
    }
  });

  // Get districts by province
  app.get("/api/facilities/districts/:province", async (req: Request, res: Response) => {
    try {
      const { province } = req.params;
      
      if (!province || province.trim() === '') {
        return res.status(400).json({ message: "Province parameter is required" });
      }

      const districtData = await db
        .selectDistinct({ district: facilities.district })
        .from(facilities)
        .where(
          and(
            eq(facilities.province, province),
            sql`${facilities.district} IS NOT NULL AND ${facilities.district} != ''`
          )
        );
      
      const districts = districtData
        .map(row => row.district)
        .filter(district => district && district.trim() !== '')
        .sort();
      
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Failed to fetch districts" });
    }
  });

  // Get facilities by district
  app.get("/api/facilities/byDistrict/:district", async (req: Request, res: Response) => {
    try {
      const { district } = req.params;
      
      if (!district || district.trim() === '') {
        return res.status(400).json({ message: "District parameter is required" });
      }

      const facilitiesData = await db
        .select()
        .from(facilities)
        .where(eq(facilities.district, district))
        .orderBy(facilities.name);
      
      res.json(facilitiesData);
    } catch (error) {
      console.error("Error fetching facilities by district:", error);
      res.status(500).json({ message: "Failed to fetch facilities by district" });
    }
  });

  // CSV Upload and Import Routes
  app.post("/api/admin/upload-csv", ensureAuthenticated, upload.single("csvFile"), async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvData = req.file.buffer.toString("utf-8");
      const fileName = req.file.originalname || "upload.csv";

      // Parse CSV data
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      parser.on("data", (record) => {
        records.push(record);
      });

      parser.on("error", (error) => {
        console.error("CSV parsing error:", error);
        return res.status(400).json({ message: "Invalid CSV format", error: error.message });
      });

      parser.on("end", async () => {
        try {
          // Import facilities from CSV
          let imported = 0;
          let errors = 0;

          for (const record of records) {
            try {
              // Map CSV columns to facility fields
              const facilityData = {
                code: record["Hims code"] || record.code,
                name: record["Name"] || record.name,
                province: record["Province"] || record.province,
                district: record["District"] || record.district,
                type: record["Type"] || record.type,
                ownership: record["Ownership"] || record.ownership,
                ownershipType: record["Ownership type"] || record.ownershipType,
                catchmentPopulation: parseInt(record["Catchment population head count"]) || 0
              };

              if (facilityData.code && facilityData.name) {
                await storage.createFacility(facilityData);
                imported++;
              }
            } catch (error) {
              console.error("Error importing facility:", error);
              errors++;
            }
          }

          res.json({
            message: "CSV import completed",
            imported,
            errors,
            total: records.length
          });
        } catch (error) {
          console.error("Error processing CSV:", error);
          res.status(500).json({ message: "Error processing CSV", error: error.message });
        }
      });

      parser.write(csvData);
      parser.end();

    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ message: "Error uploading CSV", error: error.message });
    }
  });

  // Patient search and management routes
  app.get("/api/patients/search", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const { type, query } = req.query;

      if (!type || !query) {
        return res.status(400).json({
          message: "Search type and query are required"
        });
      }

      let patients = [];
      const searchType = type as string;
      const searchQuery = query as string;

      console.log("Searching patients: type=" + searchType + ", query=" + searchQuery);

      switch (searchType) {
        case "nrc":
          const patientByNrc = await storage.getPatientByNrc(searchQuery);
          if (patientByNrc) {
            patients = [patientByNrc];
          }
          break;
        case "name":
          patients = await storage.getPatientsByName(searchQuery);
          break;
        case "art_number":
          const patientByArt = await storage.getPatientByArtNumber(searchQuery);
          if (patientByArt) {
            patients = [patientByArt];
          }
          break;
        default:
          return res.status(400).json({
            message: "Invalid search type. Use 'nrc', 'name', or 'art_number'"
          });
      }

      console.log("Found " + patients.length + " patients");

      // Add tracking for each patient result
      patients.forEach((patient, index) => {
        console.log("Patient " + (index + 1) + ":", {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          nrc: patient.nrc,
          artNumber: patient.artNumber
        });
      });

      res.json({
        patients,
        searchType,
        searchQuery,
        count: patients.length
      });
    } catch (error: any) {
      console.error("Patient search error:", error);
      res.status(500).json({
        message: "Error searching patients",
        error: error.message
      });
    }
  });

  // Safe patient search endpoint that returns JSON without auth redirects
  app.get("/api/patients/search-safe", async (req: Request, res: Response) => {
    try {
      const { type, query } = req.query;
      
      if (!type || !query) {
        return res.status(400).json({ 
          success: false,
          message: "Missing search parameters",
          error: "Both 'type' and 'query' parameters are required"
        });
      }

      let results = [];
      const searchType = type as string;
      const searchQuery = query as string;

      console.log("Safe search: type=" + searchType + ", query=" + searchQuery);
      
      switch (searchType) {
        case 'nrc':
          // Direct database query for NRC
          const nrcResults = await db
            .select()
            .from(patients)
            .where(eq(patients.nrc, searchQuery));
          results = nrcResults;
          break;
          
        case 'art_number':
          // Direct database query for ART number
          const artResults = await db
            .select()
            .from(patients)
            .where(eq(patients.art_number, searchQuery));
          results = artResults;
          break;
          
        case 'nupin':
          // Direct database query for NUPIN
          const nupinResults = await db
            .select()
            .from(patients)
            .where(eq(patients.nupin, searchQuery));
          results = nupinResults;
          break;
          
        case 'cellphone':
          // Direct database query for cellphone
          const phoneResults = await db
            .select()
            .from(patients)
            .where(eq(patients.cellphone, searchQuery));
          results = phoneResults;
          break;
          
        case 'name':
          // For name search, check both first_name and surname
          const nameQuery = `%${searchQuery}%`;
          const nameResults = await db
            .select()
            .from(patients)
            .where(
              or(
                like(patients.first_name, nameQuery),
                like(patients.surname, nameQuery)
              )
            );
          results = nameResults;
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid search type",
            error: "Supported types: nrc, art_number, nupin, cellphone, name"
          });
      }

      console.log("Safe search found " + results.length + " patients");

      res.json({
        success: true,
        searchType: searchType,
        query: searchQuery,
        results: results,
        count: results.length
      });

    } catch (error: any) {
      console.error("Error in safe patient search:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: error.message || "Unknown error occurred"
      });
    }
  });

  app.post("/api/patients", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const patientData = req.body;

      // Validate required fields
      const requiredFields = [
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "sex", label: "Sex" },
        { name: "dateOfBirth", label: "Date of Birth" },
        { name: "nrc", label: "NRC Number" },
        { name: "phoneNumber", label: "Phone Number" },
        { name: "province", label: "Province" },
        { name: "district", label: "District" },
        { name: "address", label: "Address" }
      ];

      // Check for missing required fields
      const mandatoryFields = requiredFields.filter(field => 
        field.name !== "artNumber" // ART Number is optional for new patients
      );

      if (mandatoryFields.length > 0) {
        const missingFields = [];
        mandatoryFields.forEach(({ name, label }) => {
          const value = req.body[name];
          const isEmpty = !value || value.toString().trim() === '';
          console.log("Field " + name + ": value=\"" + value + "\", isEmpty=" + isEmpty);

          if (isEmpty) {
            missingFields.push(name);
          }
        });

        if (missingFields.length > 0) {
          return res.status(400).json({
            message: "Missing required fields",
            missingFields: missingFields,
            details: "Please provide: " + missingFields.join(', ')
          });
        }
      }

      // Normalize sex field
      if (patientData.sex) {
        const normalizedSex = patientData.sex.toLowerCase();
        if (normalizedSex === "male" || normalizedSex === "m") {
          patientData.sex = "male";
        } else if (normalizedSex === "female" || normalizedSex === "f") {
          patientData.sex = "female";
        }
      }

      // Set facility from user context
      const currentUser = (req as any).user;
      if (currentUser?.facilityId) {
        patientData.facilityId = currentUser.facilityId;
      }

      const newPatient = await storage.createPatient(patientData);
      res.status(201).json(newPatient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      res.status(500).json({ 
        message: "Error creating patient",
        error: error.message 
      });
    }
  });

  // ANC Records routes
  app.get("/api/patients/:patientId/anc-records", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const records = await storage.getAncRecordsByPatientId(parseInt(patientId));
      res.json(records);
    } catch (error) {
      console.error("Error fetching ANC records:", error);
      res.status(500).json({ message: "Error fetching ANC records" });
    }
  });

  // ANC Records routes - alternative path for frontend compatibility  
  app.get("/api/patients/:patientId/anc/records", async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      
      // Return mock ANC records for demo purposes
      const mockRecords = [
        {
          id: 1,
          patientId: parseInt(patientId) || 123,
          visitType: 'initial',
          visitDate: '2024-12-15T10:00:00Z',
          contact_number: 1,
          gestationalAge: 12,
          bloodPressureSystolic1: 120,
          bloodPressureDiastolic1: 80,
          temperatureFirst: 370,
          pulseRateFirst: 72,
          respiratoryRateFirst: 18,
          hemoglobinLevel: 11.5,
          urineProtein: 'negative',
          syphilisTest: 'negative',
          hivStatus: 'negative',
          recommendations: ['Iron supplementation', 'Calcium supplementation'],
          medications: {
            iron_folic_acid: true,
            calcium: true
          },
          social_history: {
            tobacco_smoking: false,
            alcohol: false,
            substance_use: false,
            caffeine_intake: 'moderate'
          },
          physiological_symptoms: ['Nausea and vomiting', 'Low back pain'],
          other_symptoms: ['Gets tired easily'],
          created_at: '2024-12-15T10:00:00Z'
        }
      ];
      
      res.json(mockRecords);
    } catch (error) {
      console.error("Error fetching ANC records:", error);
      res.status(500).json({ message: "Error fetching ANC records" });
    }
  });

  app.post("/api/patients/:patientId/anc-records", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const recordData = {
        ...req.body,
        patientId: parseInt(patientId),
        facilityId: (req as any).user?.facilityId
      };

      const newRecord = await storage.createAncRecord(recordData);
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error creating ANC record:", error);
      res.status(500).json({ message: "Error creating ANC record" });
    }
  });

  // Duplicate patient search endpoint for compatibility
  app.get("/api/patients", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const { type, query } = req.query;

      if (!type || !query) {
        return res.status(400).json({
          message: "Search type and query are required"
        });
      }

      let patients = [];
      const searchType = type as string;
      const searchQuery = query as string;

      console.log("Patient search: type=" + searchType + ", query=" + searchQuery);

      switch (searchType) {
        case "nrc":
          const patientByNrc = await storage.getPatientByNrc(searchQuery);
          if (patientByNrc) {
            patients = [patientByNrc];
          }
          break;
        case "name":
          patients = await storage.getPatientsByName(searchQuery);
          break;
        case "art_number":
          const patientByArt = await storage.getPatientByArtNumber(searchQuery);
          if (patientByArt) {
            patients = [patientByArt];
          }
          break;
        default:
          return res.status(400).json({
            message: "Invalid search type. Use 'nrc', 'name', or 'art_number'"
          });
      }

      console.log("Found " + patients.length + " patients");

      res.json({
        patients,
        searchType,
        searchQuery,
        count: patients.length
      });
    } catch (error: any) {
      console.error("Patient search error:", error);
      res.status(500).json({
        message: "Error searching patients",
        error: error.message
      });
    }
  });

  // DAK (Data Analytics and Knowledge) Management System Routes
  
  // CSV Upload for DAK Rules Processing
  app.post("/api/admin/dak/upload-csv", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Handle raw CSV data from request body
      const csvData = req.body;
      if (!csvData || typeof csvData !== "string") {
        return res.status(400).json({ message: "Invalid CSV data" });
      }

      const fileName = req.headers["x-filename"] as string || "rules_upload.csv";

      // Create processing job
      const [job] = await db
        .insert(dakProcessingJobs)
        .values({
          status: "PENDING",
          filePath: "memory://" + fileName,
          originalFileName: fileName,
          fileSize: csvData.length,
          uploadedBy: (req as any).user.id,
          startedAt: new Date(),
        })
        .returning();

      // Process the CSV file from memory buffer
      console.log("Starting DAK CSV processing for job " + job.id);

      // Update job status to processing
      await db
        .update(dakProcessingJobs)
        .set({
          status: "PROCESSING",
          processedAt: new Date(),
        })
        .where(eq(dakProcessingJobs.id, job.id));

      // Parse and process CSV data
      const records: any[] = [];
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',').map((v: string) => v.trim());
          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index] || '';
          });
          records.push(record);
        }
      }

      // Process rules from CSV
      let processed = 0;
      let errors = 0;

      for (const record of records) {
        try {
          // Map CSV columns to DAK rule fields
          const ruleData = {
            moduleCode: record.moduleCode || record.module_code || '',
            ruleId: record.ruleId || record.rule_id || '',
            condition: record.condition || '',
            action: record.action || '',
            priority: parseInt(record.priority) || 1,
            isActive: record.isActive === 'true' || record.is_active === 'true',
            version: record.version || '1.0',
            description: record.description || '',
            createdBy: (req as any).user.id,
            createdAt: new Date(),
          };

          if (ruleData.moduleCode && ruleData.ruleId) {
            await db.insert(dakRules).values(ruleData);
            processed++;
          }
        } catch (error) {
          console.error("Error processing rule:", error);
          errors++;
        }
      }

      // Update job status to completed
      await db
        .update(dakProcessingJobs)
        .set({
          status: "COMPLETED",
          completedAt: new Date(),
          recordsProcessed: processed,
          errors: errors,
        })
        .where(eq(dakProcessingJobs.id, job.id));

      // Invalidate rule cache
      invalidateRuleCache();

      res.json({
        message: "DAK CSV processing completed",
        jobId: job.id,
        processed,
        errors,
        total: records.length
      });

    } catch (error: any) {
      console.error("DAK CSV upload error:", error);
      res.status(500).json({
        message: "Error processing DAK CSV",
        error: error.message
      });
    }
  });

  // DAK Rules Management
  app.get("/api/admin/dak/rules", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { moduleCode, isActive } = req.query;
      
      let query = db.select().from(dakRules);
      
      if (moduleCode) {
        query = query.where(eq(dakRules.moduleCode, moduleCode as string));
      }
      
      if (isActive !== undefined) {
        query = query.where(eq(dakRules.isActive, isActive === 'true'));
      }

      const rules = await query.orderBy(desc(dakRules.createdAt));

      res.json({
        rules,
        count: rules.length
      });
    } catch (error: any) {
      console.error("Error fetching DAK rules:", error);
      res.status(500).json({
        message: "Error fetching DAK rules",
        error: error.message
      });
    }
  });

  // DAK Rule Integrity Check
  app.get("/api/admin/dak/integrity-check", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const totalRules = await db.select({ count: count() }).from(dakRules);
      const activeRules = await db.select({ count: count() }).from(dakRules).where(eq(dakRules.isActive, true));
      const duplicateRules = await db
        .select({ 
          moduleCode: dakRules.moduleCode, 
          ruleId: dakRules.ruleId, 
          count: count() 
        })
        .from(dakRules)
        .groupBy(dakRules.moduleCode, dakRules.ruleId)
        .having(sql`count(*) > 1`);

      res.json({
        totalRules: totalRules[0].count,
        activeRules: activeRules[0].count,
        duplicateRules: duplicateRules.length,
        integrityScore: Math.max(0, 100 - (duplicateRules.length * 10))
      });
    } catch (error: any) {
      console.error("Error checking DAK integrity:", error);
      res.status(500).json({
        message: "Error checking DAK integrity",
        error: error.message
      });
    }
  });

  // DAK Compliance Report
  app.get("/api/admin/dak/compliance-report", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { startDate, endDate } = req.query;
      
      let query = db.select().from(dakComplianceReports);
      
      if (startDate && endDate) {
        query = query.where(
          and(
            sql`${dakComplianceReports.createdAt} >= ${startDate}`,
            sql`${dakComplianceReports.createdAt} <= ${endDate}`
          )
        );
      }

      const reports = await query.orderBy(desc(dakComplianceReports.createdAt));

      res.json({
        reports,
        count: reports.length
      });
    } catch (error: any) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({
        message: "Error fetching compliance reports",
        error: error.message
      });
    }
  });

  // DAK Processing Jobs Status
  app.get("/api/admin/dak/jobs", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const jobs = await db
        .select()
        .from(dakProcessingJobs)
        .orderBy(desc(dakProcessingJobs.startedAt))
        .limit(50);

      res.json({
        jobs,
        count: jobs.length
      });
    } catch (error: any) {
      console.error("Error fetching DAK jobs:", error);
      res.status(500).json({
        message: "Error fetching DAK jobs",
        error: error.message
      });
    }
  });

  // DAK Cache Management
  app.get("/api/admin/dak/cache-metrics", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const cacheStats = await fallbackPerformanceOptimizer.getCacheStats();
      
      res.json(cacheStats);
    } catch (error: any) {
      console.error("Error fetching cache metrics:", error);
      res.status(500).json({
        message: "Error fetching cache metrics",
        error: error.message
      });
    }
  });

  // DAK Cache Invalidation
  app.delete("/api/admin/dak/invalidate-cache", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { moduleCode } = req.body;
      
      invalidateRuleCache(moduleCode);

      res.json({
        success: true,
        message: moduleCode
          ? "Cache invalidated for module: " + moduleCode
          : "Entire rule cache invalidated",
      });
    } catch (error: any) {
      console.error("Error invalidating cache:", error);
      res.status(500).json({
        success: false,
        error: "Failed to invalidate cache",
      });
    }
  });

  // SmartCare PRO Performance Optimization Routes
  app.post("/api/admin/optimize", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!isAdminUser(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { query, params } = req.body;
      const result = await fallbackPerformanceOptimizer.optimizeQuery(query, params);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error applying optimizations:", error);
      res.status(500).json({
        success: false,
        error: "Failed to apply optimizations"
      });
    }
  });

  app.get("/api/admin/cache/stats", async (req, res) => {
    try {
      const stats = await fallbackPerformanceOptimizer.getCacheStats();
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get cache stats"
      });
    }
  });

  app.delete("/api/admin/cache/clear", async (req, res) => {
    try {
      const result = await fallbackPerformanceOptimizer.clearCache();
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({
        success: false,
        error: "Failed to clear cache"
      });
    }
  });

  app.delete("/api/admin/cache/tag/:tag", async (req, res) => {
    try {
      const { tag } = req.params;
      const result = await fallbackPerformanceOptimizer.clearCache(tag);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error clearing cache tag:", error);
      res.status(500).json({
        success: false,
        error: "Failed to clear cache tag"
      });
    }
  });

  // ============================================================================
  // Patient Relationship Management
  // ============================================================================

  // Get patient relationships
  app.get("/api/patients/:id/relationships", requireAuth, async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }

      const relationships = await storage.getPatientRelationships(patientId);
      res.json(relationships);
    } catch (error) {
      console.error("Error fetching patient relationships:", error);
      res.status(500).json({ error: "Failed to fetch patient relationships" });
    }
  });

  // Create patient relationship
  app.post("/api/patients/:id/relationships", requireAuth, async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "Invalid patient ID" });
      }

      const relationshipData = {
        ...req.body,
        patientId,
        createdBy: req.user?.id
      };

      const relationship = await storage.createPatientRelationship(relationshipData);
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error creating patient relationship:", error);
      res.status(500).json({ error: "Failed to create patient relationship" });
    }
  });

  // Delete patient relationship
  app.delete("/api/relationships/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const relationshipId = parseInt(req.params.id);
      if (isNaN(relationshipId)) {
        return res.status(400).json({ error: "Invalid relationship ID" });
      }

      await storage.deletePatientRelationship(relationshipId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting patient relationship:", error);
      res.status(500).json({ error: "Failed to delete patient relationship" });
    }
  });

  // Search patients for relationship binding
  app.get("/api/patients/search-for-relationship", requireAuth, async (req: Request, res: Response) => {
    try {
      const { q: searchTerm, exclude } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: "Search term is required" });
      }

      const currentPatientId = exclude ? parseInt(exclude as string) : undefined;
      const patients = await storage.searchPatientsForRelationship(searchTerm, currentPatientId);
      res.json(patients);
    } catch (error) {
      console.error("Error searching patients for relationship:", error);
      res.status(500).json({ error: "Failed to search patients" });
    }
  });

  const server = createServer(app);
  return server;
}