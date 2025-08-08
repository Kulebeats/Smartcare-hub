import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("clinician"),
  facility: text("facility"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  // Personal Information
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  isEstimatedDob: boolean("is_estimated_dob").default(false),
  sex: text("sex").notNull(),
  nrc: text("nrc"),
  noNrc: boolean("no_nrc").default(false),
  underFiveCardNumber: text("under_five_card_number"),
  napsa: text("napsa"),
  country: text("country").notNull(),

  // Contact Information
  cellphoneNumber: text("cellphone").notNull(),
  otherCellphoneNumber: text("other_cellphone"),
  landlineNumber: text("landline"),
  email: text("email"),
  houseNumber: text("house_number"),
  roadStreet: text("road_street"),
  area: text("area"),
  cityTownVillage: text("city_town_village"),
  landmarks: text("landmarks"),

  // Parents/Guardian Details
  mothersName: text("mothers_name"),
  fathersName: text("fathers_name"),
  guardianName: text("guardian_name"),
  guardianRelationship: text("guardian_relationship"),

  // Marital/Birth/Education
  maritalStatus: text("marital_status"),
  birthPlace: text("birth_place"),
  educationLevel: text("education_level"),
  occupation: text("occupation"),

  // System Fields
  facility: text("facility").notNull(),
  registrationDate: timestamp("registration_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Create insert schema for new patients
export const insertPatientSchema = createInsertSchema(patients)
  .omit({ id: true, registrationDate: true, lastUpdated: true })
  .extend({
    dateOfBirth: z.string().transform((str) => new Date(str)),
  });

export const artFollowUps = pgTable("art_follow_ups", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  complaints: text("complaints"),
  tbSymptoms: text("tb_symptoms"),
  physicalExam: text("physical_exam"),
  diagnosis: text("diagnosis"),
  treatmentPlan: text("treatment_plan"),
  nextVisit: date("next_visit"),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  drugName: text("drug_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: integer("duration").notNull(),
  durationUnit: text("duration_unit").notNull(),
  quantity: integer("quantity").notNull(),
  prescribedDate: timestamp("prescribed_date").notNull(),
  facility: text("facility").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type ArtFollowUp = typeof artFollowUps.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;