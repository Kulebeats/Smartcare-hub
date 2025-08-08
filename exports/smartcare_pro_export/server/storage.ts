import { User, InsertUser, Patient, ArtFollowUp, Prescription } from "@shared/schema";
import { db, users, patients, artFollowUps, prescriptions } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  getFacilities(): Promise<string[]>;
  getPatients(facility: string): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: Omit<Patient, "id">): Promise<Patient>;
  createArtFollowUp(followup: Omit<ArtFollowUp, "id">): Promise<ArtFollowUp>;
  createPrescription(prescription: Omit<Prescription, "id">): Promise<Prescription>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
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

  async getFacilities(): Promise<string[]> {
    return [
      "Chipata Central Hospital",
      "Chikando Rural Health Centre",
      "Champhande Rural Health Centre"
    ];
  }

  async getPatients(facility: string): Promise<Patient[]> {
    return db.select().from(patients).where(eq(patients.facility, facility));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patientData: Omit<Patient, "id">): Promise<Patient> {
    const [patient] = await db.insert(patients).values(patientData).returning();
    return patient;
  }

  async createArtFollowUp(followupData: Omit<ArtFollowUp, "id">): Promise<ArtFollowUp> {
    const [followup] = await db.insert(artFollowUps).values(followupData).returning();
    return followup;
  }

  async createPrescription(prescriptionData: Omit<Prescription, "id">): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(prescriptionData).returning();
    return prescription;
  }
}

export const storage = new DatabaseStorage();