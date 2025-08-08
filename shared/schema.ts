import { pgTable, text, serial, integer, boolean, date, timestamp, json, primaryKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'SystemAdministrator',
  FACILITY_ADMIN: 'FacilityAdministrator',
  CLINICIAN: 'Clinician',
  TRAINER: 'Trainer',
} as const;

// Define all possible permissions
export const PERMISSIONS = {
  // Medical Encounters
  MEDICAL_ENCOUNTER: 'MedicalEncounter',
  
  // ART related permissions
  ART: 'ART',
  ART_INITIAL: 'ARTInitial',
  ART_FOLLOWUP: 'ARTFollowUp',
  ART_PEDIATRIC: 'ARTPediatric',
  ART_STABLE_ON_CARE: 'ARTStableOnCare',
  
  // PEP & PREP
  PEP: 'PEP',
  PREP: 'PREP',
  PREP_FOLLOWUP: 'PREPFollowUp',
  
  // TB Service
  TB_SERVICE: 'TBService',
  TB_SCREENING: 'TBScreening',
  TB_FOLLOWUP: 'TBFollowUp',
  
  // ANC related permissions
  ANC_SERVICE: 'ANCService',
  ANC_INITIAL: 'ANC_Initial_Already_On_ART',
  ANC_FOLLOWUP: 'ANCFollowUp',
  ANC_LABOUR_DELIVERY: 'ANCLabourAndDelivery',
  ANC_LABOUR_DELIVERY_PMTCT: 'ANCLabourAndDeliveryPMTCT',
  ANC_LABOUR_DELIVERY_SUMMARY: 'ANCLabourAndDeliverySummary',
  ANC_DELIVERY_DISCHARGE_MOTHER: 'ANCDeliveryDischargeMother',
  ANC_DELIVERY_DISCHARGE_BABY: 'ANCDeliveryDischargeBaby',
  ANC_1ST_TIME_ON_ART: 'ANC_1st_Time_On_ART',
  
  // Postnatal
  POSTNATAL_ADULT: 'PostnatalAdult',
  POSTNATAL_PMTCT_ADULT: 'PostnatalPMTCT_Adult',
  POSTNATAL_PEDIATRIC: 'PostnatalPediatric',
  POSTNATAL_PMTCT_PEDIATRIC: 'PostnatalPMTCT_Pediatric',
  
  // Family Planning
  FAMILY_PLANNING: 'FamilyPlanning',
  
  // VMMC
  VMMC: 'VMMC',
  VMMC_REVIEW: 'VMMCReview',
  
  // Vital services
  VITAL: 'Vital',
  PRE_TRANSFUSION_VITAL: 'PreTransfusionVital',
  INTRA_TRANSFUSION_VITAL: 'IntraTransfusionVital',
  
  // Records
  BIRTH_RECORDS: 'BirthRecords',
  DEATH_RECORDS: 'DeathRecords',
  
  // Pharmacy services
  PHARMACY_SERVICE: 'PharmacyService',
  PHARMACY_PRESCRIPTION: 'PharmacyPrescription',
  PHARMACY_DISPENSATION: 'PharmacyDispensation',
  PHARMACY_STOCK: 'PharmacyStock',
  PHARMACY_ADMIN: 'PharmacyAdmin',
  
  // Other services
  NURSING_PLAN: 'NursingPlan',
  REFERRAL: 'Referral',
  SURGERY: 'Surgery',
  INVESTIGATION: 'Investigation',
  PRESCRIPTIONS: 'Prescriptions',
  DISPENSATIONS: 'Dispensations',
  COVID: 'Covid',
  ADVERSE_EVENT: 'AdverseEvent',
  HTS: 'HTS',
  CERVICAL_CANCER: 'CervicalCancer',
  OBV: 'OBV',
  RESULT: 'Result',
  TB_INTENSIVE_PHASE_INDICATOR: 'TBIntensivePhaseIndicator',
  MEDICAL_ENCOUNTER_IPD: 'MedicalEncounterIPD',
  TRIAGE: 'Triage',
  
  // Pediatric specific
  PEDIATRIC_INITIAL: 'PediatricInitial',
  PEDIATRIC_FOLLOWUP: 'PediatricFollowUp',
  PEDIATRIC_STABLE_ON_CARE: 'PediatricStableOnCare',
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Core Identity
  userId: text("user_id").unique(), // USR001234 format
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  middleName: text("middle_name"),
  preferredName: text("preferred_name"),
  profilePhoto: text("profile_photo"),
  dateOfBirth: date("date_of_birth"),
  sex: text("sex"),
  nrc: text("nrc"),
  category: text("category"),
  designation: text("designation"),
  
  // Contact Information
  primaryEmail: text("primary_email"),
  secondaryEmail: text("secondary_email"),
  primaryPhone: text("primary_phone"),
  secondaryPhone: text("secondary_phone"),
  workAddress: text("work_address"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  
  // Legacy fields (maintaining compatibility)
  role: text("role").notNull().default(USER_ROLES.CLINICIAN),
  facility: text("facility"),
  facilityCode: text("facility_code"),
  isAdmin: boolean("is_admin").default(false),
  email: text("email"),
  fullName: text("full_name"),
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login"),
  phoneNumber: text("phone_number"),
  permissions: json("permissions").$type<string[]>().default([]),
});

// Professional Information Table
export const usersProfessional = pgTable("users_professional", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // HPCZ Information
  hpczRegistrationNumber: text("hpcz_registration_number"),
  hpczCategory: text("hpcz_category"), // CO, ML, PT, OT, RAD, MLT, BME, DT, DH
  
  // GNCZ Information
  gnczRegistrationNumber: text("gncz_registration_number"),
  nursingCategory: text("nursing_category"), // RN, EN, RM, Public Health, Mental Health, etc.
  
  // MOH Information
  mohCertificateNumber: text("moh_certificate_number"),
  
  // Professional Details
  professionalTitle: text("professional_title"), // MD, RN, NP, PA, LPN, Administrator
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseExpirationDate: date("license_expiration_date"),
  licenseVerificationStatus: text("license_verification_status").default("Pending"),
  verificationDate: timestamp("verification_date"),
  specialty: text("specialty"),
  employmentStatus: text("employment_status").default("Active"),
  accountType: text("account_type").default("Permanent"),
  accountExpiryDate: date("account_expiry_date"),
  additionalCertifications: text("additional_certifications"),
  
  // Languages
  primaryLanguages: json("primary_languages").$type<string[]>().default([]),
  languageCertificationLevels: json("language_certification_levels").$type<Record<string, string>>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Details Table
export const usersContact = pgTable("users_contact", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactType: text("contact_type").notNull(), // email, phone, address
  contactValue: text("contact_value").notNull(),
  isPrimary: boolean("is_primary").default(false),
  label: text("label"), // work, personal, emergency
  createdAt: timestamp("created_at").defaultNow(),
});

// Geographic Access Control Table
export const usersGeographic = pgTable("users_geographic", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provinceAssignment: text("province_assignment"), // Central, Copperbelt, Eastern, etc.
  districtAssignment: text("district_assignment"),
  districtHealthOffice: text("district_health_office"),
  facilityTypeAccess: json("facility_type_access").$type<string[]>().default([]),
  departmentAccess: json("department_access").$type<string[]>().default([]),
  patientPopulationAccess: text("patient_population_access").default("All"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Configuration Table
export const usersSystemConfig = pgTable("users_system_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  digitalSignatureId: text("digital_signature_id"),
  securityLevel: text("security_level").default("Standard"),
  twoFactorAuth: text("two_factor_auth"), // SMS, Email, App
  defaultLandingPage: text("default_landing_page"),
  notificationPreferences: json("notification_preferences").$type<Record<string, boolean>>().default({}),
  timeZone: text("time_zone").default("CAT"),
  accessibilityNeeds: text("accessibility_needs"),
  dhis2UserId: text("dhis2_user_id"),
  elmisUserId: text("elmis_user_id"),
  dataProcessingConsent: boolean("data_processing_consent").default(false),
  dataProcessingConsentDate: timestamp("data_processing_consent_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit and Compliance Table
export const usersAudit = pgTable("users_audit", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountCreationDate: timestamp("account_creation_date").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  lastPasswordChange: timestamp("last_password_change"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  policyAcknowledgments: json("policy_acknowledgments").$type<Record<string, string>>().default({}),
  lastActivity: timestamp("last_activity"),
  complianceStatus: text("compliance_status").default("Active"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
});

// Comprehensive user creation schemas for multi-step wizard
export const personalInfoSchema = z.object({
  // Basic Personal Information
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  driverLicenseNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  placeOfBirth: z.string().optional(),
  provinceOfOrigin: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  disabilityStatus: z.boolean().optional(),
  disabilityDescription: z.string().optional(),
  // Contact Information
  primaryEmail: z.string().optional(),
  secondaryEmail: z.string().optional(),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  workAddress: z.string().optional(),
});

export const contactInfoSchema = z.object({
  primaryEmail: z.string().optional(),
  secondaryEmail: z.string().optional(),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  workAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const professionalInfoSchema = z.object({
  // HPCZ Information
  hpczRegistrationNumber: z.string().optional(),
  hpczCategory: z.string().optional(),
  
  // GNCZ Information
  gnczRegistrationNumber: z.string().optional(),
  nursingCategory: z.string().optional(),
  
  // MOH Information
  mohCertificateNumber: z.string().optional(),
  
  // Professional Details
  professionalTitle: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpirationDate: z.string().optional(),
  specialty: z.string().optional(),
  employmentStatus: z.string().optional(),
  accountType: z.string().optional(),
  accountExpiryDate: z.string().optional(),
  additionalCertifications: z.string().optional(),
  
  // Languages
  primaryLanguages: z.array(z.string()).optional(),
  languageCertificationLevels: z.record(z.string(), z.string()).optional(),
});

export const loginInfoSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  twoFactorAuth: z.string().optional(),
  digitalSignatureId: z.string().optional(),
  securityLevel: z.string().optional(),
});

export const rdbInfoSchema = z.object({
  // Geographic Access Controls
  provinceAssignment: z.string().optional(),
  districtAssignment: z.string().optional(),
  districtHealthOffice: z.string().optional(),
  facilityTypeAccess: z.array(z.string()).optional(),
  departmentAccess: z.array(z.string()).optional(),
  patientPopulationAccess: z.string().optional(),
  
  // System Configuration
  defaultLandingPage: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    inApp: z.boolean().default(true),
    realTime: z.boolean().default(true),
    daily: z.boolean().default(false),
    weekly: z.boolean().default(false),
  }).optional(),
  timeZone: z.string().default("CAT"),
  accessibilityNeeds: z.string().optional(),
  dhis2UserId: z.string().optional(),
  elmisUserId: z.string().optional(),
  dataProcessingConsent: z.boolean().optional(),
});

export const agreementSchema = z.object({
  userAgreement: z.boolean().optional(),
});

// Complete user creation schema combining all steps
export const completeUserCreationSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(professionalInfoSchema)
  .merge(loginInfoSchema)
  .merge(rdbInfoSchema)
  .merge(agreementSchema);

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type LoginInfo = z.infer<typeof loginInfoSchema>;
export type RdbInfo = z.infer<typeof rdbInfoSchema>;
export type AgreementInfo = z.infer<typeof agreementSchema>;
export type CompleteUserCreation = z.infer<typeof completeUserCreationSchema>;

// Normalized patient schema
export const patientCore = pgTable("patient_core", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  isEstimatedDob: boolean("is_estimated_dob").default(false),
  sex: text("sex").notNull(), // 'M', 'F', 'O'
  nrc: text("nrc"),
  noNrc: boolean("no_nrc").default(false),
  underFiveCardNumber: text("under_five_card_number"),
  napsa: text("napsa"),
  nupin: text("nupin"),
  country: text("country").notNull().default("Zambia"),
  facilityId: integer("facility_id").references(() => facilities.id),
  gestationalAge: integer("gestational_age"),
  bpSystolic1: integer("bp_systolic_1"),
  bpDiastolic1: integer("bp_diastolic_1"),
  temperatureFirst: integer("temperature_first"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const patientContacts = pgTable("patient_contacts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientCore.id, { onDelete: "cascade" }),
  contactType: text("contact_type").notNull(), // 'cellphone', 'other_cellphone', 'landline', 'email'
  contactValue: text("contact_value").notNull(),
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const patientAddress = pgTable("patient_address", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientCore.id, { onDelete: "cascade" }),
  houseNumber: text("house_number"),
  roadStreet: text("road_street"),
  area: text("area"),
  cityTownVillage: text("city_town_village"),
  landmarks: text("landmarks"),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const patientFamily = pgTable("patient_family", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientCore.id, { onDelete: "cascade" }),
  relation: text("relation").notNull(), // 'mother', 'father', 'guardian', 'spouse'
  firstName: text("first_name"),
  surname: text("surname"),
  isDeceased: boolean("is_deceased").default(false),
  nrc: text("nrc"),
  napsaPspf: text("napsa_pspf"),
  nationality: text("nationality").default("Zambia"),
  contactPhone: text("contact_phone"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const patientPersonal = pgTable("patient_personal", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientCore.id, { onDelete: "cascade" }),
  maritalStatus: text("marital_status"),
  spouseFirstName: text("spouse_first_name"),
  spouseSurname: text("spouse_surname"),
  homeLanguage: text("home_language"),
  otherHomeLanguage: text("other_home_language"),
  isBornInZambia: boolean("is_born_in_zambia"),
  provinceOfBirth: text("province_of_birth"),
  districtOfBirth: text("district_of_birth"),
  birthPlace: text("birth_place"),
  religiousCategory: text("religious_category"),
  religiousDenomination: text("religious_denomination"),
  otherReligiousDenomination: text("other_religious_denomination"),
  educationLevel: text("education_level"),
  otherEducationLevel: text("other_education_level"),
  occupation: text("occupation"),
  otherOccupation: text("other_occupation"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Feature flags for gradual rollout
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  flagName: text("flag_name").notNull().unique(),
  isEnabled: boolean("is_enabled").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patient Relationships Table
export const patientRelationships = pgTable("patient_relationships", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  relatedPatientId: integer("related_patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
  facilityId: integer("facility_id").references(() => facilities.id),
  isHousehold: boolean("is_household").default(false),
  isTbContact: boolean("is_tb_contact").default(false),
  isHtsIndex: boolean("is_hts_index").default(false),
  isBuddy: boolean("is_buddy").default(false),
  isGuardian: boolean("is_guardian").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Legacy patients table for backward compatibility
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  // Personal Information
  first_name: text("first_name").notNull(),
  surname: text("surname").notNull(),
  date_of_birth: date("date_of_birth").notNull(),
  is_estimated_dob: boolean("is_estimated_dob").default(false),
  sex: text("sex").notNull(),
  nrc: text("nrc"),
  no_nrc: boolean("no_nrc").default(false),
  under_five_card_number: text("under_five_card_number"),
  napsa: text("napsa"),
  nupin: text("nupin"),
  art_number: text("art_number"), // ART Number for HIV patients
  country: text("country").notNull(),

  // Contact Information
  cellphone: text("cellphone").notNull(),
  other_cellphone: text("other_cellphone"),
  landline: text("landline"),
  email: text("email"),
  house_number: text("house_number"),
  road_street: text("road_street"),
  area: text("area"),
  city_town_village: text("city_town_village"),
  landmarks: text("landmarks"),

  // Parents/Guardian Details
  mothers_name: text("mothers_name").notNull(), // Mother's name is mandatory
  mothers_surname: text("mothers_surname").notNull(), // Mother's surname is mandatory
  mother_deceased: boolean("mother_deceased").default(false),
  mothers_nrc: text("mothers_nrc"),
  mothers_napsa_pspf: text("mothers_napsa_pspf"),
  mothers_nationality: text("mothers_nationality").default("Zambia"),
  
  fathers_name: text("fathers_name"),
  fathers_surname: text("fathers_surname"),
  father_deceased: boolean("father_deceased").default(false),
  fathers_nrc: text("fathers_nrc"),
  fathers_napsa_pspf: text("fathers_napsa_pspf"),
  fathers_nationality: text("fathers_nationality"),
  
  guardian_name: text("guardian_name"),
  guardian_surname: text("guardian_surname"),
  guardian_relationship: text("guardian_relationship"),
  guardian_nrc: text("guardian_nrc"),
  guardian_napsa_pspf: text("guardian_napsa_pspf"),
  guardian_nationality: text("guardian_nationality"),

  // Marital/Birth/Education
  marital_status: text("marital_status"),
  spouse_first_name: text("spouse_first_name"),
  spouse_surname: text("spouse_surname"),
  
  // Birth and Religious Denomination
  home_language: text("home_language"),
  other_home_language: text("other_home_language"),
  is_born_in_zambia: boolean("is_born_in_zambia"),
  province_of_birth: text("province_of_birth"),
  district_of_birth: text("district_of_birth"),
  birth_place: text("birth_place"),
  religious_denomination: text("religious_denomination"),
  other_religious_denomination: text("other_religious_denomination"),
  
  // Education and Employment
  education_level: text("education_level"),
  other_education_level: text("other_education_level"),
  occupation: text("occupation"),
  other_occupation: text("other_occupation"),

  // System Fields
  facility: text("facility").notNull(),
  registration_date: timestamp("registration_date").defaultNow(),
  last_updated: timestamp("last_updated").defaultNow(),
});

// Form validation schema that matches frontend camelCase naming
export const insertPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  dateOfBirth: z.string()
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 110);
        
        return !isNaN(date.getTime()) && 
               date <= today && 
               date >= minDate;
      },
      { message: "Date of birth must be valid, not in the future, and not more than 110 years ago" }
    ),
  sex: z.string().min(1, "Sex is required"),
  nrc: z.string().optional(),
  noNrc: z.boolean().optional(),
  underFiveCardNumber: z.string().optional(),
  napsa: z.string().optional(),
  nupin: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  
  // Contact Information (cellphoneNumber maps to cellphone in DB)
  cellphoneNumber: z.string().min(1, "Cellphone number is required"),
  otherCellphoneNumber: z.string().optional(),
  landlineNumber: z.string().optional(),
  email: z.string().optional(),
  houseNumber: z.string().optional(),
  roadStreet: z.string().optional(),
  area: z.string().optional(),
  cityTownVillage: z.string().optional(),
  landmarks: z.string().optional(),
  
  // Parent/Guardian Details (camelCase frontend -> snake_case DB)
  mothersName: z.string().min(1, "Mother's first name is required"),
  mothersSurname: z.string().min(1, "Mother's surname is required"),
  motherDeceased: z.boolean().optional(),
  mothersNrc: z.string().optional(),
  mothersNapsaPspf: z.string().optional(),
  mothersNationality: z.string().optional(),
  
  fathersName: z.string().optional(),
  fathersSurname: z.string().optional(),
  fatherDeceased: z.boolean().optional(),
  fathersNrc: z.string().optional(),
  fathersNapsaPspf: z.string().optional(),
  fathersNationality: z.string().optional(),
  
  guardianName: z.string().optional(),
  guardianSurname: z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianNrc: z.string().optional(),
  guardianNapsaPspf: z.string().optional(),
  guardianNationality: z.string().optional(),
  
  // Marital/Birth/Education Details
  maritalStatus: z.string().optional(),
  spouseFirstName: z.string().optional(),
  spouseSurname: z.string().optional(),
  homeLanguage: z.string().optional(),
  otherHomeLanguage: z.string().optional(),
  isBornInZambia: z.boolean().optional(),
  provinceOfBirth: z.string().optional(),
  districtOfBirth: z.string().optional(),
  birthPlace: z.string().optional(),
  religiousDenomination: z.string().optional(),
  otherReligiousDenomination: z.string().optional(),
  educationLevel: z.string().optional(),
  otherEducationLevel: z.string().optional(),
  occupation: z.string().optional(),
  otherOccupation: z.string().optional(),
  
  // System Fields
  facility: z.string().optional(),
  isEstimatedDob: z.boolean().optional(),
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

// Enhanced ANC Records Table with all clinical decision support data elements
export const ancRecords = pgTable("anc_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  visitDate: timestamp("visit_date").notNull().defaultNow(),
  visitType: varchar("visit_type", { length: 50 }).notNull(), // 'initial' | 'routine'
  gestationalAge: integer("gestational_age"),
  expectedDeliveryDate: date("expected_delivery_date"),
  
  // Enhanced Vital Signs with Two-Stage Monitoring
  bloodPressureSystolic1: integer("bp_systolic_1"),
  bloodPressureDiastolic1: integer("bp_diastolic_1"),
  bloodPressureSystolic2: integer("bp_systolic_2"),
  bloodPressureDiastolic2: integer("bp_diastolic_2"),
  bloodPressureUnableToRecord: boolean("bp_unable_record").default(false),
  bloodPressureUnableReason: text("bp_unable_reason"),
  
  // Enhanced Respiratory Monitoring
  respiratoryRateFirst: integer("respiratory_rate_first"),
  respiratoryRateSecond: integer("respiratory_rate_second"),
  respiratoryExam: varchar("respiratory_exam", { length: 20 }), // 'normal' | 'abnormal'
  respiratoryFindings: text("respiratory_findings"),
  respiratoryUnableToRecord: boolean("respiratory_unable_record").default(false),
  respiratoryUnableReason: text("respiratory_unable_reason"),
  
  // Critical Oximetry Monitoring
  oxygenSaturation: integer("oxygen_saturation"),
  oximetryUnableToRecord: boolean("oximetry_unable_record").default(false),
  oximetryUnableReason: text("oximetry_unable_reason"),
  
  // Enhanced Cardiac Assessment
  pulseRateFirst: integer("pulse_rate_first"),
  pulseRateSecond: integer("pulse_rate_second"),
  cardiacExam: varchar("cardiac_exam", { length: 20 }), // 'normal' | 'abnormal'
  cardiacFindings: text("cardiac_findings"),
  
  // Temperature Monitoring
  temperatureFirst: integer("temperature_first"), // in Celsius * 10 (e.g., 373 = 37.3°C)
  temperatureSecond: integer("temperature_second"),
  temperatureUnableToRecord: boolean("temperature_unable_record").default(false),
  temperatureUnableReason: text("temperature_unable_reason"),
  
  // Comprehensive Maternal Examination
  // Pallor Assessment
  pallorExam: varchar("pallor_exam", { length: 20 }), // 'normal' | 'abnormal'
  pallorFindings: text("pallor_findings"),
  
  // Breast Examination
  breastExam: varchar("breast_exam", { length: 20 }), // 'normal' | 'abnormal'
  breastFindings: text("breast_findings"),
  
  // Enhanced Cervical Assessment
  cervicalDilation: integer("cervical_dilation"), // 0-10 cm
  cervicalPosition: varchar("cervical_position", { length: 20 }), // 'posterior' | 'mid' | 'anterior'
  cervicalConsistency: varchar("cervical_consistency", { length: 20 }), // 'firm' | 'medium' | 'soft'
  cervicalEffacement: integer("cervical_effacement"), // 0-100%
  
  // Enhanced Speculum Examination
  speculumExam: varchar("speculum_exam", { length: 20 }), // 'normal' | 'abnormal'
  speculumFindings: json("speculum_findings"), // Array of findings
  speculumDetails: text("speculum_details"),
  
  // Enhanced Pelvic Examination
  pelvicExam: varchar("pelvic_exam", { length: 20 }), // 'normal' | 'abnormal'
  pelvicFindings: json("pelvic_findings"), // Array of findings
  pelvicDetails: text("pelvic_details"),
  
  // Oedema Assessment
  oedemaExam: varchar("oedema_exam", { length: 20 }), // 'normal' | 'abnormal'
  oedemaFindings: text("oedema_findings"),
  
  // Violence Assessment
  violenceAssessment: varchar("violence_assessment", { length: 20 }), // 'no' | 'yes'
  violenceDetails: text("violence_details"),
  
  // Advanced Fetal Assessment with Two-Stage Monitoring
  symphysialFundalHeight: integer("symphysial_fundal_height"), // in cm
  fetalHeartRateFirst: integer("fetal_heart_rate_first"),
  fetalHeartRateSecond: integer("fetal_heart_rate_second"),
  fetalPositioningDone: boolean("fetal_positioning_done").default(false),
  fetalHeartRateUnableToRecord: boolean("fhr_unable_record").default(false),
  fetalHeartRateUnableReason: text("fhr_unable_reason"),
  fetalLie: varchar("fetal_lie", { length: 20 }), // 'longitudinal' | 'transverse' | 'oblique'
  fetalPresentation: varchar("fetal_presentation", { length: 20 }), // 'vertex' | 'breech' | 'shoulder' | 'face' | 'brow'
  fetalDescent: varchar("fetal_descent", { length: 20 }), // 'not_engaged' | 'engaged' | 'deep_engaged'
  fetalMovement: varchar("fetal_movement", { length: 20 }), // 'active' | 'reduced' | 'absent'
  numberOfFetus: integer("number_of_fetus").default(1),
  
  // Laboratory Results with Enhanced Monitoring
  hemoglobinLevel: integer("hemoglobin_level"), // in g/dL * 10 (e.g., 120 = 12.0 g/dL)
  syphilisTest: varchar("syphilis_test", { length: 20 }), // 'reactive' | 'non_reactive' | 'not_done'
  syphilisTreatment: varchar("syphilis_treatment", { length: 50 }),
  urineProtein: varchar("urine_protein", { length: 10 }), // 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+'
  urineGlucose: varchar("urine_glucose", { length: 10 }),
  urineLeukocytes: varchar("urine_leukocytes", { length: 10 }),
  hivStatus: varchar("hiv_status", { length: 20 }),
  hivCounseling: boolean("hiv_counseling").default(false),
  
  // Clinical Notes and Recommendations
  clinicalNotes: text("clinical_notes"),
  treatmentPlan: text("treatment_plan"),
  referralRequired: boolean("referral_required").default(false),
  referralReason: text("referral_reason"),
  nextVisitDate: date("next_visit_date"),
  
  // Audit and Tracking
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinical Decision Support Engine Tables
export const clinicalDecisionRules = pgTable("clinical_decision_rules", {
  id: serial("id").primaryKey(),
  module: varchar("module", { length: 50 }).notNull(), // 'ANC' | 'ART' | 'PHARMACOVIGILANCE'
  ruleCode: varchar("rule_code", { length: 100 }).notNull().unique(),
  ruleName: varchar("rule_name", { length: 200 }).notNull(),
  ruleDescription: text("rule_description"),
  
  // DAK Traceability Fields
  dakReference: varchar("dak_reference", { length: 100 }),
  guidelineVersion: varchar("guideline_version", { length: 20 }),
  evidenceQuality: varchar("evidence_quality", { length: 1 }), // 'A' | 'B' | 'C' | 'D'
  decisionSupportMessage: text("decision_support_message").notNull(),
  moduleCode: varchar("module_code", { length: 50 }).notNull(),
  
  // WHO Guideline Integration
  whoGuidelineReference: varchar("who_guideline_ref", { length: 200 }),
  evidenceLevel: varchar("evidence_level", { length: 20 }), // 'A' | 'B' | 'C' | 'D'
  
  // Rule Configuration
  triggerConditions: json("trigger_conditions").notNull(), // Complex condition logic
  alertSeverity: varchar("alert_severity", { length: 20 }).notNull(), // 'yellow' | 'orange' | 'red' | 'purple' | 'blue'
  alertTitle: varchar("alert_title", { length: 200 }).notNull(),
  alertMessage: text("alert_message").notNull(),
  recommendations: json("recommendations").notNull(), // Array of recommendations
  
  // Clinical Thresholds
  clinicalThresholds: json("clinical_thresholds"), // Min/max values for triggers
  
  // Rule Status and Versioning
  isActive: boolean("is_active").default(true),
  version: varchar("version", { length: 20 }).default("1.0"),
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"),
  
  // Audit
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// DAK Processing Jobs Table
export const dakProcessingJobs = pgTable("dak_processing_jobs", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  filePath: text("file_path").notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  processedCount: integer("processed_count").default(0),
  errorCount: integer("error_count").default(0),
  successCount: integer("success_count").default(0),
  errors: json("errors").default([]), // Array of error messages
  progress: integer("progress").default(0), // Percentage 0-100
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinical Alerts Tracking Table
export const clinicalAlerts = pgTable("clinical_alerts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  recordId: integer("record_id"), // Can reference ANC, ART, or other module records
  recordType: varchar("record_type", { length: 50 }).notNull(), // 'ANC' | 'ART' | 'PHARMACOVIGILANCE'
  
  // Alert Details
  ruleId: integer("rule_id").notNull(), // References clinical_decision_rules
  alertSeverity: varchar("alert_severity", { length: 20 }).notNull(),
  alertTitle: varchar("alert_title", { length: 200 }).notNull(),
  alertMessage: text("alert_message").notNull(),
  recommendations: json("recommendations").notNull(),
  
  // Alert Context
  triggerData: json("trigger_data").notNull(), // Data that triggered the alert
  clinicalContext: text("clinical_context"),
  
  // Alert Management
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgmentNotes: text("acknowledgment_notes"),
  
  // Referral Management
  referralRequired: boolean("referral_required").default(false),
  referralCompleted: boolean("referral_completed").default(false),
  referralDetails: text("referral_details"),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// WHO Clinical Guidelines Reference Table
export const whoGuidelines = pgTable("who_guidelines", {
  id: serial("id").primaryKey(),
  guidelineCode: varchar("guideline_code", { length: 100 }).notNull().unique(),
  guidelineName: varchar("guideline_name", { length: 200 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // 'ANC' | 'ART' | 'PHARMACOVIGILANCE'
  
  // Guideline Details
  guidelineDescription: text("guideline_description"),
  clinicalArea: varchar("clinical_area", { length: 100 }), // 'maternal_health' | 'fetal_health' | 'hiv_care'
  targetPopulation: varchar("target_population", { length: 100 }),
  
  // Clinical Thresholds and Parameters
  normalRanges: json("normal_ranges"), // Normal clinical parameter ranges
  alertThresholds: json("alert_thresholds"), // Threshold values for alerts
  interventionCriteria: json("intervention_criteria"), // When to intervene
  
  // Reference Information
  whoDocumentUrl: text("who_document_url"),
  publicationDate: date("publication_date"),
  lastReviewDate: date("last_review_date"),
  version: varchar("version", { length: 20 }),
  
  // Status
  isActive: boolean("is_active").default(true),
  implementationDate: timestamp("implementation_date").notNull().defaultNow(),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced ANC Clinical Decision Support Tables
export const ancPhysicalExaminations = pgTable("anc_physical_examinations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  contactNumber: integer("contact_number").notNull(),
  examDate: timestamp("exam_date").notNull().defaultNow(),
  // Vital Signs
  systolicBp: integer("systolic_bp").notNull(),
  diastolicBp: integer("diastolic_bp").notNull(),
  systolicBpAfterRest: integer("systolic_bp_after_rest"),
  diastolicBpAfterRest: integer("diastolic_bp_after_rest"),
  height: integer("height").notNull(), // in cm
  weight: integer("weight").notNull(), // in kg
  bmi: integer("bmi"), // calculated automatically
  temperature: integer("temperature"), // in celsius * 10 (e.g., 37.5 = 375)
  pulseRate: integer("pulse_rate"),
  respiratoryRate: integer("respiratory_rate"),
  // Clinical Findings
  pallorPresent: boolean("pallor_present").default(false),
  preEclampsiaSymptoms: json("pre_eclampsia_symptoms").$type<string[]>().default([]),
  urineProtein: text("urine_protein"), // None, Trace, +, ++, +++
  respiratoryExam: text("respiratory_exam"),
  // Decision Support Results
  hypertensionLevel: text("hypertension_level"), // Normal, Mild, Severe
  referralRequired: boolean("referral_required").default(false),
  alertsGenerated: json("alerts_generated").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ancMedicationTracking = pgTable("anc_medication_tracking", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  contactDate: timestamp("contact_date").notNull().defaultNow(),
  // Current Medications
  takingIfa: boolean("taking_ifa").default(false),
  ifaSideEffects: boolean("ifa_side_effects").default(false),
  ifaSideEffectsDetail: text("ifa_side_effects_detail"),
  takingCalcium: boolean("taking_calcium").default(false),
  calciumSideEffects: boolean("calcium_side_effects").default(false),
  takingAspirin: boolean("taking_aspirin").default(false),
  takingPenicillin: boolean("taking_penicillin").default(false),
  otherMedications: json("other_medications").$type<string[]>().default([]),
  // Compliance Assessment
  ifaCompliance: text("ifa_compliance"), // Good, Fair, Poor
  medicationCounseling: json("medication_counseling").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ancLaboratoryResults = pgTable("anc_laboratory_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  contactNumber: integer("contact_number").notNull(),
  testType: text("test_type").notNull(), // HIV, BloodGroup, HepatitisB, Hemoglobin
  testDate: timestamp("test_date"),
  result: text("result"),
  normalRange: text("normal_range"),
  interpretation: text("interpretation"), // Normal, Abnormal, Critical
  followUpRequired: boolean("follow_up_required").default(false),
  testStatus: text("test_status").default("Pending"), // Pending, Done, Deferred
  deferralReason: text("deferral_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ancClinicalDecisionSupport = pgTable("anc_clinical_decision_support", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  contactNumber: integer("contact_number").notNull(),
  ruleType: text("rule_type").notNull(), // Hypertension, Anaemia, PreEclampsia, Laboratory
  triggerConditions: json("trigger_conditions").$type<Record<string, any>>().notNull(),
  recommendation: text("recommendation").notNull(),
  urgencyLevel: text("urgency_level").notNull(), // Critical, Warning, Information
  actionTaken: text("action_taken"),
  dismissed: boolean("dismissed").default(false),
  dismissalReason: text("dismissal_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

// Master Facility List
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // Facility code (required in DB)
  name: varchar("name", { length: 255 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }), // Health Post, Health Center, Hospital, etc.
  level: varchar("level", { length: 50 }), // Level 1, 2, 3, etc.
  ownership: varchar("ownership", { length: 100 }), // Public, Private, Mission, etc.
  status: varchar("status", { length: 50 }).default("ACTIVE"), // ACTIVE, INACTIVE, CLOSED
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 100 }),
});

export const insertFacilitySchema = createInsertSchema(facilities);

// Audit and Compliance System Tables
export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, FAILED_LOGIN
  entityType: text("entity_type"), // patients, users, prescriptions, etc.
  entityId: text("entity_id"), // ID of the affected entity
  userId: integer("user_id").references(() => users.id),
  username: text("username"), // Stored for audit trail even if user deleted
  facilityCode: text("facility_code"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  
  // Request/Response details
  endpoint: text("endpoint"), // API endpoint accessed
  httpMethod: text("http_method"), // GET, POST, PUT, DELETE
  requestData: json("request_data"), // Sanitized request payload
  responseStatus: integer("response_status"), // HTTP status code
  
  // Clinical context
  patientNrc: text("patient_nrc"), // For patient-related events
  clinicalModule: text("clinical_module"), // ANC, ART, PREP, etc.
  
  // Risk assessment
  riskScore: integer("risk_score").default(0), // 0-10 risk level
  riskFactors: json("risk_factors").$type<string[]>().default([]),
  alertTriggered: boolean("alert_triggered").default(false),
  
  // Cryptographic integrity
  eventHash: text("event_hash").notNull(), // SHA-256 of event data
  previousHash: text("previous_hash"), // Hash of previous event (blockchain-style)
  hashChainIndex: integer("hash_chain_index").notNull(),
  
  // Metadata
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  processingTime: integer("processing_time"), // Response time in ms
  errorDetails: json("error_details"), // Error information if applicable
  complianceFlags: json("compliance_flags").$type<string[]>().default([]), // WHO, MOH compliance markers
});

export const auditRetention = pgTable("audit_retention", {
  id: serial("id").primaryKey(),
  retentionRule: text("retention_rule").notNull(), // Name of the retention rule
  eventTypes: json("event_types").$type<string[]>().notNull(), // Event types this rule applies to
  riskScoreThreshold: integer("risk_score_threshold").default(0), // Minimum risk score
  retentionPeriodDays: integer("retention_period_days").notNull(), // How long to keep
  archiveAfterDays: integer("archive_after_days"), // When to archive (optional)
  complianceRequirement: text("compliance_requirement"), // WHO, MOH, etc.
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Hash chain integrity tracking
export const auditIntegrityCheck = pgTable("audit_integrity_check", {
  id: serial("id").primaryKey(),
  checkDate: timestamp("check_date").defaultNow(),
  totalEvents: integer("total_events").notNull(),
  lastValidIndex: integer("last_valid_index").notNull(),
  hashChainValid: boolean("hash_chain_valid").notNull(),
  corruptedEvents: json("corrupted_events").$type<number[]>().default([]),
  repairActions: json("repair_actions").$type<string[]>().default([]),
  checkDurationMs: integer("check_duration_ms"),
  performedBy: text("performed_by").default("SYSTEM"),
});

// Zod schemas for new ANC tables
export const insertAncPhysicalExaminationSchema = createInsertSchema(ancPhysicalExaminations);
export const insertAncMedicationTrackingSchema = createInsertSchema(ancMedicationTracking);
export const insertAncLaboratoryResultSchema = createInsertSchema(ancLaboratoryResults);
export const insertAncClinicalDecisionSupportSchema = createInsertSchema(ancClinicalDecisionSupport);

// Audit system schemas
export const insertAuditEventSchema = createInsertSchema(auditEvents).omit({
  id: true,
  timestamp: true,
  hashChainIndex: true,
});

export const insertAuditRetentionSchema = createInsertSchema(auditRetention).omit({
  id: true,
  createdAt: true,
  lastModified: true,
});

export const insertAuditIntegrityCheckSchema = createInsertSchema(auditIntegrityCheck).omit({
  id: true,
  checkDate: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type ArtFollowUp = typeof artFollowUps.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;

// Patient Relationships Types
export const insertPatientRelationshipSchema = createInsertSchema(patientRelationships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPatientRelationship = z.infer<typeof insertPatientRelationshipSchema>;
export type PatientRelationship = typeof patientRelationships.$inferSelect;

// New ANC types
export type AncPhysicalExamination = typeof ancPhysicalExaminations.$inferSelect;
export type InsertAncPhysicalExamination = z.infer<typeof insertAncPhysicalExaminationSchema>;
export type AncMedicationTracking = typeof ancMedicationTracking.$inferSelect;
export type InsertAncMedicationTracking = z.infer<typeof insertAncMedicationTrackingSchema>;
export type AncLaboratoryResult = typeof ancLaboratoryResults.$inferSelect;
export type InsertAncLaboratoryResult = z.infer<typeof insertAncLaboratoryResultSchema>;
export type AncClinicalDecisionSupport = typeof ancClinicalDecisionSupport.$inferSelect;
export type InsertAncClinicalDecisionSupport = z.infer<typeof insertAncClinicalDecisionSupportSchema>;

// Audit system types
export type AuditEvent = typeof auditEvents.$inferSelect;
export type InsertAuditEvent = z.infer<typeof insertAuditEventSchema>;
export type AuditRetention = typeof auditRetention.$inferSelect;
export type InsertAuditRetention = z.infer<typeof insertAuditRetentionSchema>;
export type AuditIntegrityCheck = typeof auditIntegrityCheck.$inferSelect;
export type InsertAuditIntegrityCheck = z.infer<typeof insertAuditIntegrityCheckSchema>;

// Audit event types enum
export const AUDIT_EVENT_TYPES = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  EXPORT: 'EXPORT',
  PRINT: 'PRINT',
  TRANSFER: 'TRANSFER',
  BACKUP: 'BACKUP',
  SYSTEM_ACCESS: 'SYSTEM_ACCESS',
} as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES];

// DAK Rules - Store clinical decision support rules
export const dakRules = pgTable("dak_rules", {
  id: serial("id").primaryKey(),
  moduleCode: varchar("module_code", { length: 50 }).notNull(),
  ruleId: varchar("rule_id", { length: 100 }).notNull(),
  condition: text("condition").notNull(),
  action: text("action").notNull(),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  version: varchar("version", { length: 20 }).default("1.0"),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// DAK Compliance Reports - Compliance and audit reporting
export const dakComplianceReports = pgTable("dak_compliance_reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("report_type", { length: 50 }).notNull(),
  facilityId: integer("facility_id"),
  reportPeriodStart: timestamp("report_period_start").notNull(),
  reportPeriodEnd: timestamp("report_period_end").notNull(),
  complianceScore: integer("compliance_score"), // 0-100
  totalChecks: integer("total_checks").default(0),
  passedChecks: integer("passed_checks").default(0),
  failedChecks: integer("failed_checks").default(0),
  findings: json("findings"),
  recommendations: json("recommendations"),
  generatedBy: integer("generated_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// DAK Cache Metrics - Performance and cache analytics
export const dakCacheMetrics = pgTable("dak_cache_metrics", {
  id: serial("id").primaryKey(),
  metricDate: timestamp("metric_date").notNull().defaultNow(),
  cacheHits: integer("cache_hits").default(0),
  cacheMisses: integer("cache_misses").default(0),
  hitRate: integer("hit_rate").default(0), // Percentage
  totalQueries: integer("total_queries").default(0),
  cacheSize: integer("cache_size").default(0),
  averageResponseTime: integer("average_response_time").default(0), // milliseconds
  peakMemoryUsage: integer("peak_memory_usage").default(0), // bytes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for existing DAK tables
export const insertDakProcessingJobSchema = createInsertSchema(dakProcessingJobs);
export const insertDakRuleSchema = createInsertSchema(dakRules);
export const insertDakComplianceReportSchema = createInsertSchema(dakComplianceReports);
export const insertDakCacheMetricSchema = createInsertSchema(dakCacheMetrics);

// Type exports for DAK tables
export type DakProcessingJob = typeof dakProcessingJobs.$inferSelect;
export type InsertDakProcessingJob = z.infer<typeof insertDakProcessingJobSchema>;
export type DakRule = typeof dakRules.$inferSelect;
export type InsertDakRule = z.infer<typeof insertDakRuleSchema>;
export type DakComplianceReport = typeof dakComplianceReports.$inferSelect;
export type InsertDakComplianceReport = z.infer<typeof insertDakComplianceReportSchema>;
export type DakCacheMetric = typeof dakCacheMetrics.$inferSelect;
export type InsertDakCacheMetric = z.infer<typeof insertDakCacheMetricSchema>;

// Given-When-Then Counselling Session Schema
export const givenWhenThenSessionSchema = z.object({
  type: z.enum(['syphilis', 'hypertension', 'hiv', 'hepatitis_b', 'nutrition', 'preventive', 'immunization']),
  given_context: z.string(), // Clinical condition that triggered counseling
  when_action: z.string(), // Specific counseling action performed
  then_outcome: z.string(), // Observable result/outcome
  completion_status: z.enum(['completed', 'partial', 'deferred', 'not_applicable']),
  effectiveness_rating: z.number().min(1).max(5).optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
  counseling_date: z.string().optional(),
  counselor_name: z.string().optional()
});

// Enhanced Behavioral Counselling Schema with Given-When-Then tracking
export const behavioralCounsellingSchema = z.object({
  // Existing behavioral counselling fields preserved
  caffeine_counselling: z.enum(['done', 'not_done']).optional(),
  reason_caffeine_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  caffeine_other_specify: z.string().optional(),
  
  tobacco_counselling: z.enum(['done', 'not_done']).optional(),
  reason_tobacco_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  tobacco_other_specify: z.string().optional(),
  
  second_hand_smoking: z.enum(['done', 'not_done']).optional(),
  secondhand_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  secondhand_other_specify: z.string().optional(),
  
  alcohol_substance_counselling: z.enum(['done', 'not_done']).optional(),
  substance_or_alcohol_counselling_was_not_done: z.array(z.enum(['referred_instead', 'other_specify'])).optional(),
  alcohol_substance_other_specify: z.string().optional(),
  
  // New Given-When-Then tracking system
  counseling_sessions: z.array(givenWhenThenSessionSchema).optional(),
  
  // Section 1: Diagnosis & Treatment (ANC.B10.4)
  syphilis_counselling: z.enum(['done', 'not_done']).optional(),
  hypertension_counselling: z.enum(['done', 'not_done']).optional(),
  hiv_positive_counselling: z.enum(['done', 'not_done']).optional(),
  hepatitis_b_counselling: z.enum(['done', 'not_done']).optional(),
  seven_day_antibiotic_regimen: z.enum(['done', 'not_done']).optional(),
  antibiotic_regimen_reason: z.enum(['stock_out', 'other_specify']).optional(),
  antibiotic_regimen_specify: z.string().optional(),
  
  // Section 2: Nutrition Supplementation (ANC.B10.5)
  elemental_iron_andfolic_acid: z.enum(['given', 'not_given', 'alternative']).optional(),
  iron_folic_acid_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  iron_folic_acid_specify: z.string().optional(),
  calcium_supplementation: z.enum(['given', 'not_given']).optional(),
  calcium_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  calcium_specify: z.string().optional(),
  
  // Section 3: Preventive Therapy (ANC.B10.5)
  malaria_prevention_counselling: z.enum(['done', 'not_done']).optional(),
  itn_issued: z.enum(['yes', 'no']).optional(),
  cpt_cotrimoxazole: z.enum(['yes', 'no']).optional(),
  cpt_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  cpt_specify: z.string().optional(),
  deworming_mebendazole: z.enum(['yes', 'no']).optional(),
  deworming_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  deworming_specify: z.string().optional(),
  
  // Section 4: Immunization (ANC.B10.5)
  ttcv_immunisation: z.enum(['done_today', 'done_earlier', 'not_done']).optional(),
  ttcv_dose_number: z.enum(['1', '2', '3', '4']).optional(),
  ttcv_date_given: z.string().optional(),
  ttcv_reason: z.array(z.enum(['stock_out', 'expired', 'woman_ill', 'woman_refused', 'allergies', 'other_specify'])).optional(),
  ttcv_specify: z.string().optional(),
  
  // General counselling fields
  counselling_comment: z.string().optional(),
  overall_counselling_status: z.enum(['complete', 'partial', 'pending']).optional(),
  counselling_completion_date: z.string().optional()
});

export type BehavioralCounsellingData = z.infer<typeof behavioralCounsellingSchema>;
export type GivenWhenThenSession = z.infer<typeof givenWhenThenSessionSchema>;

// Preventive and Promotive Intervention Schema (separated from behavioral counselling)
export const interventionsTreatmentsSchema = z.object({
  // Nutrition Supplementation
  iron_given: z.enum(['yes', 'no']).optional(),
  iron_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  iron_specify: z.string().optional(),
  folic_acid_given: z.enum(['yes', 'no']).optional(),
  folic_acid_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  folic_acid_specify: z.string().optional(),
  calcium_given: z.enum(['yes', 'no']).optional(),
  calcium_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  calcium_specify: z.string().optional(),
  
  // Preventive Therapy
  deworming_mebendazole: z.enum(['yes', 'no']).optional(),
  deworming_reason: z.enum(['out_of_stock', 'expired', 'other_specify']).optional(),
  deworming_specify: z.string().optional(),
  
  // Malaria Prophylaxis IPT
  iptp_sp_dose1_provided: z.enum(['yes', 'no']).optional(),
  iptp_sp_dose1_date: z.string().optional(),
  iptp_sp_dose2_provided: z.enum(['yes', 'no']).optional(),
  iptp_sp_dose2_date: z.string().optional(),
  iptp_sp_dose3_provided: z.enum(['yes', 'no']).optional(),
  iptp_sp_dose3_date: z.string().optional(),
  iptp_sp_reason: z.enum(['referred', 'stock_out', 'expired', 'other_specify']).optional(),
  iptp_sp_specify: z.string().optional(),
  
  // Immunization
  ttcv_immunisation: z.enum(['done_today', 'done_earlier', 'not_done']).optional(),
  ttcv_dose_number: z.enum(['1', '2', '3', '4']).optional(),
  ttcv_date_given: z.string().optional(),
  ttcv_reason: z.array(z.enum(['stock_out', 'expired', 'woman_ill', 'woman_refused', 'allergies', 'other_specify'])).optional(),
  ttcv_specify: z.string().optional(),
  
  // General tracking
  interventions_completion_date: z.string().optional(),
  interventions_status: z.enum(['complete', 'partial', 'pending']).optional()
});

export type InterventionsTreatmentsData = z.infer<typeof interventionsTreatmentsSchema>

// Pharmacy Tables
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosageForm: text("dosage_form").notNull(), // tablet, capsule, syrup, injection, etc.
  strength: text("strength").notNull(), // e.g., "500mg", "10mg/ml"
  category: text("category").notNull(), // antibiotic, analgesic, etc.
  stockLevel: integer("stock_level").default(0),
  minimumStock: integer("minimum_stock").default(10),
  unitCost: integer("unit_cost").default(0), // in cents
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  manufacturer: text("manufacturer"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pharmacyPrescriptions = pgTable("pharmacy_prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  prescriberId: integer("prescriber_id").references(() => users.id).notNull(),
  facilityId: integer("facility_id").references(() => facilities.id).notNull(),
  prescriptionNumber: text("prescription_number").notNull().unique(),
  diagnosis: text("diagnosis"),
  status: text("status").notNull().default("pending"), // pending, dispensed, cancelled, expired
  priority: text("priority").notNull().default("routine"), // routine, urgent, emergency
  instructions: text("instructions"),
  totalCost: integer("total_cost").default(0),
  issuedAt: timestamp("issued_at").defaultNow(),
  validUntil: timestamp("valid_until"),
  dispensedAt: timestamp("dispensed_at"),
  dispensedBy: integer("dispensed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => pharmacyPrescriptions.id).notNull(),
  medicationId: integer("medication_id").references(() => medications.id).notNull(),
  
  // Enhanced prescription fields
  drugName: text("drug_name").notNull(), // Drug name as displayed
  quantity: text("quantity").notNull(), // Changed to text for enhanced flexibility
  dosage: text("dosage").notNull(), // e.g., "1 tablet twice daily"
  itemPerDose: text("item_per_dose"), // Items per dose (e.g., "1 tablet")
  frequency: text("frequency"), // Frequency (e.g., "2 times")
  timePerUnit: text("time_per_unit"), // Time unit (hour, day, week, month)
  frequencyUnit: text("frequency_unit"), // Frequency unit (times, doses, tablets)
  duration: text("duration").notNull(), // e.g., "7", "1"
  durationUnit: text("duration_unit"), // Duration unit (days, weeks, months)
  route: text("route"), // Route of administration
  startDate: date("start_date"),
  endDate: date("end_date"),
  isPasserBy: text("is_passer_by").default("No"), // Yes/No
  comments: text("comments"),
  
  // Original fields maintained for compatibility
  instructions: text("instructions"),
  quantityDispensed: integer("quantity_dispensed").default(0),
  unitCost: integer("unit_cost").default(0),
  totalCost: integer("total_cost").default(0),
  status: text("status").notNull().default("pending"), // pending, dispensed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const dispensations = pgTable("dispensations", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => pharmacyPrescriptions.id).notNull(),
  dispensedBy: integer("dispensed_by").references(() => users.id).notNull(),
  facilityId: integer("facility_id").references(() => facilities.id).notNull(),
  dispensationNumber: text("dispensation_number").notNull().unique(),
  totalAmount: integer("total_amount").default(0),
  amountPaid: integer("amount_paid").default(0),
  paymentMethod: text("payment_method"), // cash, insurance, free
  notes: text("notes"),
  patientCounseled: boolean("patient_counseled").default(false),
  counselingNotes: text("counseling_notes"),
  dispensedAt: timestamp("dispensed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Pharmacy Schemas
export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  dosageForm: z.string().min(1, "Dosage form is required"),
  strength: z.string().min(1, "Strength is required"),
  category: z.string().min(1, "Category is required"),
  stockLevel: z.number().min(0).default(0),
  minimumStock: z.number().min(0).default(10),
  unitCost: z.number().min(0).default(0),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  manufacturer: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const prescriptionSchema = z.object({
  patientId: z.number().min(1, "Patient ID is required"),
  prescriberId: z.number().min(1, "Prescriber ID is required"),
  facilityId: z.number().min(1, "Facility ID is required"),
  prescriptionNumber: z.string().min(1, "Prescription number is required"),
  diagnosis: z.string().optional(),
  status: z.enum(["pending", "dispensed", "cancelled", "expired"]).default("pending"),
  priority: z.enum(["routine", "urgent", "emergency"]).default("routine"),
  instructions: z.string().optional(),
  totalCost: z.number().min(0).default(0),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    medicationId: z.number().min(1, "Medication ID is required"),
    drugName: z.string().min(1, "Drug name is required"),
    quantity: z.string().min(1, "Quantity is required"),
    dosage: z.string().min(1, "Dosage is required"),
    itemPerDose: z.string().optional(),
    frequency: z.string().optional(),
    timePerUnit: z.string().optional(),
    frequencyUnit: z.enum([
      // Original options maintained
      "times", "doses", "tablets",
      // Enhanced medical frequency options
      "stat", "qhs", "nocturnal", "qam", "od", "bd", "q12h", "tds", "qid", "prn", "week", "every_3_months", "every_2_months"
    ]).optional(),
    duration: z.string().min(1, "Duration is required"),
    durationUnit: z.string().optional(),
    route: z.enum([
      // Enhanced comprehensive route options
      "per_oral", "sublingual", "intramuscular", "intravascular", "subcutaneous", "tropical", "rectal", "eye", "ear", "nose", "inhalational", "transdermal", "interdermal", "other", "vaginal", "orally"
    ]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isPasserBy: z.string().default("No"),
    comments: z.string().optional(),
    instructions: z.string().optional()
  })).min(1, "At least one medication item is required")
});

export const dispensationSchema = z.object({
  prescriptionId: z.number().min(1, "Prescription ID is required"),
  dispensedBy: z.number().min(1, "Dispenser ID is required"),
  facilityId: z.number().min(1, "Facility ID is required"),
  dispensationNumber: z.string().min(1, "Dispensation number is required"),
  totalAmount: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "insurance", "free"]).optional(),
  notes: z.string().optional(),
  patientCounseled: z.boolean().default(false),
  counselingNotes: z.string().optional(),
  items: z.array(z.object({
    prescriptionItemId: z.number().min(1, "Prescription item ID is required"),
    quantityDispensed: z.number().min(1, "Quantity dispensed is required"),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional()
  })).min(1, "At least one item must be dispensed")
});

// Pharmacy insert schemas
export const medicationInsertSchema = createInsertSchema(medications);
export const pharmacyPrescriptionInsertSchema = createInsertSchema(pharmacyPrescriptions);
export const prescriptionItemInsertSchema = createInsertSchema(prescriptionItems);
export const dispensationInsertSchema = createInsertSchema(dispensations);

// Pharmacy types
export type Medication = typeof medications.$inferSelect;
export type MedicationInsert = typeof medications.$inferInsert;
export type PharmacyPrescription = typeof pharmacyPrescriptions.$inferSelect;
export type PharmacyPrescriptionInsert = typeof pharmacyPrescriptions.$inferInsert;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type PrescriptionItemInsert = typeof prescriptionItems.$inferInsert;
export type Dispensation = typeof dispensations.$inferSelect;
export type DispensationInsert = typeof dispensations.$inferInsert;

export type MedicationData = z.infer<typeof medicationSchema>;
export type PharmacyPrescriptionData = z.infer<typeof prescriptionSchema>;
export type DispensationData = z.infer<typeof dispensationSchema>;

// HIV Testing Schema for ANC Module
export const hivTestingSchema = z.object({
  // Pre-test Assessment
  clientType: z.string().optional(),
  visitType: z.enum(['new', 'followup']).optional(),
  servicePoint: z.string().optional(),
  sourceOfClient: z.string().optional(),
  reasonForTesting: z.string().optional(),
  
  // Testing History
  lastTestResult: z.enum(['Positive', 'Negative', 'Indeterminant', 'Refused test or result', 'Never tested', 'I Don\'t know']).optional(),
  lastTestedDate: z.date().optional(),
  
  // Partner Information
  partnerHivStatus: z.enum(['Positive', 'Negative', 'Indeterminant', 'Refused test or result', 'Never tested', 'I Don\'t know']).optional(),
  partnerLastTestedDate: z.date().optional(),
  
  // Counselling and Consent
  patientCounselled: z.enum(['Yes', 'No']).optional(),
  consentObtained: z.enum(['Yes', 'No']).optional(),
  reasonForNotTesting: z.enum(['client_refused', 'no_consent', 'other']).optional(),
  otherReasons: z.string().optional(),
  
  // Test Status and Tracking
  testStatus: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  completedDate: z.date().optional(),
  providerId: z.string().optional(),
  testDate: z.date().optional(),
  
  // Multi-stage Testing Protocol
  determine: z.enum(['Reactive', 'Non-reactive']).optional(),
  bioline: z.enum(['Reactive', 'Non-reactive']).optional(),
  hivType: z.enum(['HIV-1', 'HIV-2', 'HIV-1&2']).optional(),
  
  // Additional fields for Non-reactive Determine results
  testNo: z.string().optional(),
  dnaPcrSampleCollected: z.enum(['Yes', 'No']).optional(),
  dnaPcrSampleCollectionDate: z.date().optional(),
  clientReceivedResults: z.enum(['Yes', 'No']).optional(),
  consentToReceiveSMSAlerts: z.enum(['Yes', 'No']).optional(),
  
  // Post Test Assessment (checkboxes)
  postTestAssessment: z.array(z.string()).optional(),
  
  // Legacy field for backward compatibility
  testResult: z.enum(['Positive', 'Negative', 'Indeterminant', 'Invalid']).optional(),
  
  // Post-test Information
  resultGiven: z.enum(['Yes', 'No']).optional(),
  postTestCounsellingDone: z.enum(['Yes', 'No']).optional(),
  referralMade: z.enum(['Yes', 'No']).optional(),
  referralLocation: z.string().optional(),
});

export type HIVTestingData = z.infer<typeof hivTestingSchema>;

// POC Test Schema with standard reference ranges
export const pocTestSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  
  // Test Order Information
  selectTest: z.string(),
  orderNumber: z.string(),
  orderPriority: z.enum(['routine', 'urgent', 'emergency']),
  orderDate: z.date(),
  testQuantity: z.number().min(1),
  sampleQuantity: z.number().min(1),
  additionalComments: z.string().optional(),
  
  // Test Status
  status: z.enum(['ordered', 'in_progress', 'completed', 'cancelled']).default('ordered'),
  orderedBy: z.string().optional(),
  completedDate: z.date().optional(),
  
  // Test Results
  result: z.object({
    numericResult: z.string().optional(),
    measuringUnit: z.string().optional(),
    resultStatus: z.enum(['normal', 'abnormal', 'critical', 'pending', 'invalid']).optional(),
    resultComment: z.string().optional(),
    resultDate: z.date().optional(),
    reviewedBy: z.string().optional(),
  }).optional(),
});

export type POCTestData = z.infer<typeof pocTestSchema>;

// POC Test Types with standard reference ranges
export const pocTestTypes = [
  {
    id: 'fasting_blood_sugar',
    name: 'Fasting Blood Sugar',
    unit: 'mmol/L',
    normalRange: '3.9-5.5',
    abnormalRange: '5.6-6.9',
    criticalRange: '≥7.0 or <2.8',
    description: 'Fasting plasma glucose test for diabetes screening'
  },
  {
    id: 'glucose_dipstick_plus',
    name: 'Glucose Dipstick (+s)',
    unit: 'positive/negative',
    normalRange: 'Negative',
    abnormalRange: 'Trace to +',
    criticalRange: '++ to ++++',
    description: 'Urine glucose dipstick test'
  },
  {
    id: 'glucose_dipstick_mmol',
    name: 'Glucose Dipstick (mmol/L)',
    unit: 'mmol/L',
    normalRange: '<2.8',
    abnormalRange: '2.8-5.5',
    criticalRange: '>5.5',
    description: 'Quantitative urine glucose measurement'
  },
  {
    id: 'hemoglobin_level',
    name: 'Hemoglobin Level',
    unit: 'g/dL',
    normalRange: '12.0-15.5 (pregnant women)',
    abnormalRange: '10.0-11.9',
    criticalRange: '<10.0 or >18.0',
    description: 'Blood hemoglobin concentration for anemia screening'
  },
  {
    id: 'hemoglobin_a1c',
    name: 'Hemoglobin A1C',
    unit: '%',
    normalRange: '<5.7',
    abnormalRange: '5.7-6.4',
    criticalRange: '≥6.5',
    description: 'Average blood glucose over 2-3 months'
  },
  {
    id: 'hepatitis_b_core_ab',
    name: 'Hepatitis B Core Antibody IgM',
    unit: 'reactive/non-reactive',
    normalRange: 'Non-reactive',
    abnormalRange: 'Indeterminate',
    criticalRange: 'Reactive',
    description: 'Acute hepatitis B infection marker'
  },
  {
    id: 'hepatitis_b_surface_ab',
    name: 'Hepatitis B Surface Antibody',
    unit: 'mIU/mL',
    normalRange: '≥10',
    abnormalRange: '1-9',
    criticalRange: '<1',
    description: 'Immunity to hepatitis B marker'
  },
  {
    id: 'hepatitis_b_tests',
    name: 'Hepatitis B Tests',
    unit: 'reactive/non-reactive',
    normalRange: 'Non-reactive',
    abnormalRange: 'Indeterminate',
    criticalRange: 'Reactive',
    description: 'Comprehensive hepatitis B screening panel'
  },
  {
    id: 'ldl_cholesterol',
    name: 'Low Density Lipoproteins (LDL)',
    unit: 'mmol/L',
    normalRange: '<2.6',
    abnormalRange: '2.6-3.3',
    criticalRange: '>3.4',
    description: 'LDL cholesterol for cardiovascular risk assessment'
  },
  {
    id: 'malaria_rdt',
    name: 'Malaria RDT',
    unit: 'positive/negative',
    normalRange: 'Negative',
    abnormalRange: 'Invalid',
    criticalRange: 'Positive',
    description: 'Rapid diagnostic test for malaria parasites'
  },
  {
    id: 'pregnancy_rdt',
    name: 'Pregnancy RDT',
    unit: 'positive/negative',
    normalRange: 'Context dependent',
    abnormalRange: 'Invalid',
    criticalRange: 'Context dependent',
    description: 'Rapid pregnancy test (urine/serum hCG)'
  },
  {
    id: 'random_blood_sugar',
    name: 'Random Blood Sugar',
    unit: 'mmol/L',
    normalRange: '<7.8',
    abnormalRange: '7.8-11.0',
    criticalRange: '≥11.1 or <2.8',
    description: 'Non-fasting blood glucose measurement'
  },
  {
    id: 'syphilis_rdt',
    name: 'Syphilis RDT',
    unit: 'reactive/non-reactive',
    normalRange: 'Non-reactive',
    abnormalRange: 'Indeterminate',
    criticalRange: 'Reactive',
    description: 'Rapid diagnostic test for syphilis'
  },
  {
    id: 'syphilis_tests',
    name: 'Syphilis Tests',
    unit: 'reactive/non-reactive',
    normalRange: 'Non-reactive',
    abnormalRange: 'Indeterminate',
    criticalRange: 'Reactive',
    description: 'Comprehensive syphilis screening panel'
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis',
    unit: 'various',
    normalRange: 'Normal parameters',
    abnormalRange: 'Mild abnormalities',
    criticalRange: 'Significant abnormalities',
    description: 'Comprehensive urine analysis including protein, glucose, blood, etc.'
  },
  {
    id: 'ogtt',
    name: 'Oral Glucose Tolerance Test (OGTT)',
    unit: 'mmol/L',
    normalRange: 'Fasting: <5.1, 1h: <10.0, 2h: <8.5',
    abnormalRange: 'Any value above normal',
    criticalRange: 'Fasting: ≥7.0, 2h: ≥11.1',
    description: 'Glucose tolerance test for gestational diabetes screening'
  }
];

export const pocTestPriorities = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' }
];

export const pocTestResultStatuses = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'critical', label: 'Critical' },
  { value: 'pending', label: 'Pending' },
  { value: 'invalid', label: 'Invalid' }
];

// Syphilis Test Subtypes (excluding VDRL per user request)
export const syphilisTestSubtypes = [
  { value: 'dual_hiv_syphilis_rdt', label: 'Dual HIV/Syphilis RDT' },
  { value: 'syphilis_rdt', label: 'Syphilis RDT' },
  { value: 'rpr', label: 'RPR' }
];

// ANC PrEP Assessment Schema
export const ancPrepAssessmentSchema = z.object({
  // Eligibility Assessment
  eligible_for_prep: z.boolean().optional(),
  offered_prep: z.boolean().optional(),
  prep_accepted: z.boolean().optional(),
  
  // Risk Factors Assessment
  risk_factors: z.array(z.string()).optional(),
  acute_hiv_symptoms: z.array(z.string()).optional(),
  
  // Client Risk Factors
  inconsistent_condom_use: z.string().optional(),
  condom_reasons: z.array(z.string()).optional(),
  condom_other_reason: z.string().optional(),
  multiple_partners: z.string().optional(),
  recent_sti: z.string().optional(),
  sti_types: z.array(z.string()).optional(),
  sti_other_specify: z.string().optional(),
  
  // Partner Risk Factors
  partner_hiv_status_known: z.string().optional(),
  partner_hiv_status: z.string().optional(),
  partner_not_on_art: z.string().optional(),
  partner_detectable_viral_load: z.string().optional(),
  partner_multiple_partners: z.string().optional(),
  partner_injection_drug_use: z.string().optional(),
  
  // Pregnancy Modifiers
  pregnancy_trimester: z.string().optional(),
  plans_to_breastfeed: z.string().optional(),
  
  // Initial Assessment
  prep_history: z.enum(['first_time', 'repeat']).optional(),
  previous_prep_use: z.boolean().optional(),
  previous_prep_stop_date: z.string().optional(),
  
  // Contraindications
  contraindications: z.array(z.string()).optional(),
  creatinine_test_required: z.boolean().optional(),
  creatinine_test_date: z.string().optional(),
  creatinine_result: z.string().optional(),
  
  // Recommended Tests
  recommended_tests: z.array(z.string()).optional(),
  
  // Initial Prescription
  prescribed_at_initial_visit: z.boolean().optional(),
  prep_regimen: z.string().optional(),
  days_prescribed: z.string().optional(),
  
  // Counseling
  adherence_counselling: z.boolean().optional(),
  
  // Enhanced Risk Reduction Counseling (Section A)
  risk_reduction_counselling_provided: z.enum(['yes', 'no']).optional(),
  counselling_not_provided_reasons: z.array(z.enum([
    'client_declined', 
    'time_resource_constraints', 
    'language_communication_barrier', 
    'client_not_ready', 
    'provider_did_not_offer', 
    'other'
  ])).optional(),
  counselling_not_provided_other: z.string().optional(),
  
  // Client Interest in PrEP (Section B)
  client_interested_in_prep: z.enum(['yes', 'no']).optional(),
  lack_of_interest_reasons: z.array(z.enum([
    'does_not_perceive_risk', 
    'prefers_other_methods', 
    'concerned_side_effects_stigma', 
    'discuss_with_partner', 
    'decide_later_visit', 
    'other'
  ])).optional(),
  lack_of_interest_other: z.string().optional(),
  
  // Planned Next Steps/Follow-Up (Section C)
  planned_next_steps: z.array(z.enum([
    'schedule_future_counselling', 
    'refer_peer_educator', 
    'provide_educational_materials', 
    'offer_prep_next_anc', 
    'no_further_action', 
    'other'
  ])).optional(),
  planned_next_steps_other: z.string().optional(),
  next_counselling_date: z.string().optional(),
  
  // Follow-up
  follow_up_date: z.string().optional(),
  follow_up_type: z.string().optional(),
  
  // Prevention Services
  prevention_services: z.array(z.string()).optional(),
  condoms_distributed: z.string().optional(),
  hiv_self_test_kits: z.boolean().optional(),
  number_of_kits: z.string().optional(),
  
  // Assessment Notes
  notes: z.string().optional(),
  assessed_by: z.string().optional(),
  assessment_date: z.string().optional(),
  
  // Screening Test Results - Follow-up fields for positive screenings
  syphilis_screening_result: z.enum(['reactive', 'non_reactive', '']).optional(),
  hepatitis_b_screening_result: z.enum(['reactive', 'non_reactive', '']).optional(),
  
  // Auto-populated PrEP Prescription Fields (Zambian CGs 2023)
  prep_dose: z.string().optional(),
  prep_frequency: z.string().optional(),
  prep_duration: z.string().optional(),
  prep_safety_notes: z.string().optional(),
  prep_population_guidance: z.string().optional(),
  prep_guideline_reference: z.string().optional()
});

export type ANCPrepAssessmentData = z.infer<typeof ancPrepAssessmentSchema>;

