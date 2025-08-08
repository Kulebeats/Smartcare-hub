import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  surname: z.string().min(1, 'Surname is required').max(100),
  dateOfBirth: z.string().refine(
    val => !isNaN(Date.parse(val)) && new Date(val) <= new Date(),
    'Invalid date of birth'
  ),
  sex: z.enum(['Male', 'Female'], { errorMap: () => ({ message: 'Sex must be Male or Female' }) }),
  nrc: z.string()
    .regex(/^\d{6}\/\d{2}\/\d{1}$/, 'NRC format must be XXXXXX/XX/X')
    .optional(),
  cellphoneNumber: z.string()
    .regex(/^(\+260|260|0)?[97]\d{8}$/, 'Invalid Zambian phone number format'),
  landlineNumber: z.string()
    .regex(/^(\+260|260|0)?[2]\d{6}$/, 'Invalid landline format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  country: z.string().min(1, 'Country is required').default('Zambia'),
  facility: z.string().min(1, 'Facility is required').optional(),
  isEstimatedDob: z.boolean().optional().default(false),
  noNrc: z.boolean().optional().default(false),
  // Contact fields
  otherCellphoneNumber: z.string().optional(),
  // Address fields
  houseNumber: z.string().max(100).optional(),
  roadStreet: z.string().max(200).optional(),
  area: z.string().max(100).optional(),
  cityTownVillage: z.string().max(100).optional(),
  landmarks: z.string().max(200).optional(),
  // Family contact fields
  mothersName: z.string().min(1, "Mother's first name is required").max(100),
  mothersSurname: z.string().min(1, "Mother's surname is required").max(100),
  motherDeceased: z.boolean().optional().default(false),
  mothersNrc: z.string().optional(),
  mothersNapsaPspf: z.string().optional(),
  mothersNationality: z.string().optional().default('Zambia'),
  fathersName: z.string().max(100).optional(),
  fathersSurname: z.string().max(100).optional(),
  fatherDeceased: z.boolean().optional().default(false),
  fathersNrc: z.string().optional(),
  fathersNapsaPspf: z.string().optional(),
  fathersNationality: z.string().optional(),
  // Guardian fields
  guardianName: z.string().max(100).optional(),
  guardianSurname: z.string().max(100).optional(),
  guardianRelationship: z.string().max(100).optional(),
  guardianNrc: z.string().optional(),
  guardianNapsaPspf: z.string().optional(),
  guardianNationality: z.string().optional(),
  // Personal information
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
  // Additional IDs
  underFiveCardNumber: z.string().optional(),
  napsa: z.string().optional(),
  nupin: z.string().optional()
});

export const ancRecordSchema = z.object({
  patient_id: z.number().positive('Patient ID is required'),
  visit_type: z.enum(['initial', 'routine'], { 
    errorMap: () => ({ message: 'Visit type must be initial or routine' }) 
  }),
  visit_date: z.string().refine(
    val => !isNaN(Date.parse(val)),
    'Invalid visit date'
  ),
  gestational_age: z.number()
    .min(4, 'Gestational age must be at least 4 weeks')
    .max(42, 'Gestational age cannot exceed 42 weeks'),
  bp_systolic: z.number()
    .min(60, 'Systolic BP too low')
    .max(250, 'Systolic BP too high')
    .optional(),
  bp_diastolic: z.number()
    .min(40, 'Diastolic BP too low')
    .max(150, 'Diastolic BP too high')
    .optional(),
  temperature: z.number()
    .min(350, 'Temperature too low (×10 units)')
    .max(420, 'Temperature too high (×10 units)')
    .optional(),
  weight: z.number()
    .min(30, 'Weight too low')
    .max(200, 'Weight too high')
    .optional(),
  alert_severity: z.enum(['yellow', 'orange', 'red', 'purple', 'blue']).optional(),
  notes: z.string().max(1000).optional()
});

export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email format').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  role: z.enum(['SystemAdministrator', 'FacilityAdministrator', 'Clinician', 'Trainer']),
  facility: z.string().optional()
});

export const dataSubjectRequestSchema = z.object({
  request_type: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE'], {
    errorMap: () => ({ message: 'Request type must be ACCESS, RECTIFICATION, or ERASURE' })
  }),
  target_id: z.string().min(1, 'Target ID is required'),
  reason: z.string().max(500).optional()
});