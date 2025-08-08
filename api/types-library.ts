/**
 * SmartCare PRO API Types Library
 * 
 * This file provides comprehensive TypeScript types for all API endpoints,
 * request/response schemas, and clinical data structures.
 * 
 * Generated from OpenAPI 3.1 specification
 * Version: 1.3.0
 */

// Base Entity Types
export interface User {
  id: number;
  username: string;
  role: 'SystemAdministrator' | 'FacilityAdministrator' | 'Clinician' | 'Trainer';
  facility?: string;
  facilityCode?: string;
  isAdmin: boolean;
  email?: string;
  fullName?: string;
  permissions?: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  role: 'SystemAdministrator' | 'FacilityAdministrator' | 'Clinician' | 'Trainer';
  facility?: string;
  facilityCode?: string;
  isAdmin?: boolean;
  email?: string;
  fullName?: string;
  permissions?: string[];
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  type: string;
  province: string;
  district: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
  capacity?: {
    beds?: number;
    maternity?: number;
    pediatric?: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  isActive: boolean;
}

// Patient Registry Types (185 columns comprehensive)
export interface Patient {
  id: number;
  facility: string;
  firstName: string;
  surname: string;
  dateOfBirth: string; // ISO date
  sex: 'Male' | 'Female';
  nrc?: string;
  country: string;
  cellphone?: string;
  isEstimatedDob: boolean;
  noNrc: boolean;
  registrationDate?: string;
  lastUpdated?: string;
  
  // Address Information
  area?: string;
  houseNumber?: string;
  roadStreet?: string;
  cityTownVillage?: string;
  landmarks?: string;
  
  // Additional Identifiers
  napsa?: string;
  nupin?: string;
  underFiveCardNumber?: string;
  otherCellphone?: string;
  landline?: string;
  email?: string;
  
  // Family Information
  mothersName: string;
  mothersSurname: string;
  motherDeceased?: boolean;
  mothersNrc?: string;
  mothersNapsaPspf?: string;
  mothersNationality?: string;
  
  fathersName?: string;
  fathersSurname?: string;
  fatherDeceased?: boolean;
  fathersNrc?: string;
  fathersNapsaPspf?: string;
  fathersNationality?: string;
  
  // Guardian Information
  guardianName?: string;
  guardianSurname?: string;
  guardianRelationship?: string;
  guardianNrc?: string;
  guardianNapsaPspf?: string;
  guardianNationality?: string;
  
  // Personal Information
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
  spouseFirstName?: string;
  spouseSurname?: string;
  homeLanguage?: string;
  otherHomeLanguage?: string;
  isBornInZambia?: boolean;
  provinceOfBirth?: string;
  districtOfBirth?: string;
  birthPlace?: string;
  religiousCategory?: string;
  religiousDenomination?: string;
  otherReligiousDenomination?: string;
  
  // Education and Employment
  educationLevel?: string;
  otherEducationLevel?: string;
  occupation?: string;
  otherOccupation?: string;
}

export interface PatientCreate {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female';
  nrc?: string;
  country?: string;
  cellphoneNumber?: string;
  isEstimatedDob?: boolean;
  noNrc?: boolean;
  mothersName: string;
  mothersSurname: string;
  [key: string]: any; // Allow additional fields
}

// Clinical Record Types
export interface ARTFollowUp {
  patientId: number;
  visitDate: string;
  adherence: 'Good' | 'Fair' | 'Poor';
  sideEffects?: string[];
  viralLoad?: number;
  cd4Count?: number;
  nextAppointment?: string;
  notes?: string;
}

export interface Prescription {
  patientId: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribedBy: string;
  prescriptionDate: string;
}

// Clinical Intelligence Types
export interface ClinicalAnalysisRequest {
  patientData: Record<string, any>;
  clinicalData: Record<string, any>;
  analysisType: 'risk_assessment' | 'diagnosis_support' | 'treatment_recommendation';
}

export interface ClinicalAnalysisResponse {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  recommendations: string[];
  confidence: number; // 0-1
  alerts: ClinicalAlert[];
}

export interface ClinicalAlert {
  severity: 'Critical' | 'High' | 'Medium' | 'Info' | 'Milestone';
  title: string;
  message: string;
  condition: string;
  recommendations: string[];
  requiresReferral: boolean;
  timestamp: string;
}

export interface AdverseReactionRequest {
  patientId: number;
  medication: string;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  onsetDate: string;
}

export interface AdverseReactionResponse {
  severity: string;
  probability: 'Certain' | 'Probable' | 'Possible' | 'Unlikely';
  recommendations: string[];
  requiresReporting: boolean;
}

export interface TaskRecommendationRequest {
  clinicalContext: Record<string, any>;
  patientConditions: string[];
  currentWorkload: Record<string, any>;
}

export interface TaskRecommendationResponse {
  prioritizedTasks: Array<{
    task: string;
    priority: 'High' | 'Medium' | 'Low';
    timeframe: string;
    reasoning: string;
  }>;
}

// Smart Transfer System Types
export interface TransferRequest {
  patientId: number;
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  requiredServices: string[];
  specialization?: string;
  transportType: 'Ambulance' | 'Helicopter' | 'Ground';
  originFacility: string;
  maxDistance?: number;
  medicalCondition: string;
}

export interface TransferRoute {
  facility: Facility;
  score: number;
  distance: number;
  estimatedCost: number;
  travelTime: string;
  reasoning: string;
  capacity: Record<string, any>;
  services: string[];
}

export interface TransferSearchResponse {
  success: boolean;
  routes: TransferRoute[];
  message: string;
}

export interface TransferInitiateRequest {
  selectedRoute: TransferRoute;
  patientId: number;
  urgency: string;
  medicalCondition: string;
  accompaniedBy?: string;
}

export interface TransferInitiateResponse {
  success: boolean;
  transferId: string;
  transferPlan: Record<string, any>;
  message: string;
}

export interface FacilitiesInRadiusResponse {
  success: boolean;
  facilities: Facility[];
  radius: number;
}

export interface CapacityUpdateRequest {
  facilityId: string;
  occupancyUpdate: {
    beds?: number;
    maternity?: number;
    pediatric?: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  timestamp: string;
}

export interface ValidationError {
  message: string;
  errors: Array<{
    path: string;
    message: string;
    errorCode: string;
  }>;
  timestamp: string;
}

export interface ConflictError {
  message: string;
  exists: boolean;
  field?: string;
}

// Search and Query Types
export interface PatientSearchParams {
  name?: string;
  nrc?: string;
  nupin?: string;
  cellphone?: string;
  sex?: 'Male' | 'Female';
  minAge?: number;
  maxAge?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PatientSearchQuery {
  type: 'nrc' | 'nupin' | 'cellphone' | 'name';
  query: string;
}

// Authentication Types
export interface AuthUser extends User {
  claims?: Record<string, any>;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

// ANC Clinical Decision Support Types (83 columns)
export interface ANCRecord {
  id?: number;
  patientId: number;
  visitDate: string;
  gestationalAge: number;
  
  // Vital Signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  respiratoryRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  
  // Clinical Assessments
  pallorPresent?: boolean;
  edemaPresent?: boolean;
  fetalHeartRate?: number;
  fetalMovements?: boolean;
  
  // Laboratory Results
  hemoglobin?: number;
  urineProtein?: string;
  urineGlucose?: string;
  hivStatus?: 'Positive' | 'Negative' | 'Unknown';
  syphilisTest?: 'Positive' | 'Negative' | 'Not Done';
  
  // Risk Factors
  previousCSection?: boolean;
  previousStillbirth?: boolean;
  previousPrematureBirth?: boolean;
  multiparity?: boolean;
  
  // Medications
  ironFolicAcid?: boolean;
  tetanusToxoid?: boolean;
  antimalarials?: boolean;
  arvMedication?: boolean;
  
  // Clinical Decisions
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
  alerts?: ClinicalAlert[];
  recommendations?: string[];
  nextAppointment?: string;
  referralRequired?: boolean;
  
  // WHO Compliance Fields
  whoProtocolCompliant?: boolean;
  clinicalDecisionSupport?: Record<string, any>;
  
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Ministry of Health Permission System
export const MOH_PERMISSIONS = {
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
  
  // Additional clinical services
  FAMILY_PLANNING: 'FamilyPlanning',
  VMMC: 'VMMC',
  VMMC_REVIEW: 'VMMCReview',
  HTS: 'HTS',
  CERVICAL_CANCER: 'CervicalCancer',
  PRESCRIPTIONS: 'Prescriptions',
  DISPENSATIONS: 'Dispensations',
  ADVERSE_EVENT: 'AdverseEvent'
} as const;

export type PermissionType = typeof MOH_PERMISSIONS[keyof typeof MOH_PERMISSIONS];

// API Endpoint Helper Types
export interface ApiEndpoints {
  // Authentication
  getCurrentUser: () => Promise<ApiResponse<User>>;
  
  // Facilities
  getFacilities: () => Promise<ApiResponse<Facility[]>>;
  getAllFacilities: () => Promise<ApiResponse<Facility[]>>;
  getProvinces: () => Promise<ApiResponse<string[]>>;
  getDistrictsByProvince: (province: string) => Promise<ApiResponse<string[]>>;
  getFacilitiesByDistrict: (district: string) => Promise<ApiResponse<Facility[]>>;
  getFacilitiesByProvince: (province: string) => Promise<ApiResponse<Facility[]>>;
  
  // Patients
  getPatients: (params?: PatientSearchParams) => Promise<ApiResponse<Patient[]>>;
  createPatient: (patient: PatientCreate) => Promise<ApiResponse<Patient>>;
  getPatient: (id: number) => Promise<ApiResponse<Patient>>;
  checkNRC: (nrc: string) => Promise<ApiResponse<{exists: boolean; message: string}>>;
  checkPhone: (phone: string) => Promise<ApiResponse<{exists: boolean; message: string}>>;
  searchPatients: (query: PatientSearchQuery) => Promise<ApiResponse<Patient[]>>;
  
  // Clinical Records
  createARTFollowUp: (patientId: number, data: ARTFollowUp) => Promise<ApiResponse<ARTFollowUp>>;
  createPrescription: (patientId: number, data: Prescription) => Promise<ApiResponse<Prescription>>;
  
  // Clinical Intelligence
  analyzeClinicalData: (request: ClinicalAnalysisRequest) => Promise<ApiResponse<ClinicalAnalysisResponse>>;
  analyzeAdverseReaction: (request: AdverseReactionRequest) => Promise<ApiResponse<AdverseReactionResponse>>;
  getTaskRecommendations: (request: TaskRecommendationRequest) => Promise<ApiResponse<TaskRecommendationResponse>>;
  
  // Smart Transfer
  searchTransferRoutes: (request: TransferRequest) => Promise<ApiResponse<TransferSearchResponse>>;
  initiateTransfer: (request: TransferInitiateRequest) => Promise<ApiResponse<TransferInitiateResponse>>;
  getFacilitiesInRadius: (radius: number, lat: number, lon: number) => Promise<ApiResponse<FacilitiesInRadiusResponse>>;
  updateFacilityCapacity: (request: CapacityUpdateRequest) => Promise<ApiResponse<{success: boolean; message: string}>>;
  
  // User Management
  getUsers: () => Promise<ApiResponse<User[]>>;
  createUser: (user: UserCreate) => Promise<ApiResponse<User>>;
}

// Export all types for external consumption
export type {
  User,
  UserCreate,
  Facility,
  Patient,
  PatientCreate,
  ARTFollowUp,
  Prescription,
  ClinicalAnalysisRequest,
  ClinicalAnalysisResponse,
  ClinicalAlert,
  AdverseReactionRequest,
  AdverseReactionResponse,
  TaskRecommendationRequest,
  TaskRecommendationResponse,
  TransferRequest,
  TransferRoute,
  TransferSearchResponse,
  TransferInitiateRequest,
  TransferInitiateResponse,
  FacilitiesInRadiusResponse,
  CapacityUpdateRequest,
  ApiResponse,
  ErrorResponse,
  ValidationError,
  ConflictError,
  PatientSearchParams,
  PatientSearchQuery,
  AuthUser,
  ANCRecord,
  PermissionType,
  ApiEndpoints
};