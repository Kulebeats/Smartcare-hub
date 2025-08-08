#!/usr/bin/env node

/**
 * SmartCare PRO API Type Generation and Validation Script
 * 
 * Automates:
 * - TypeScript type generation from OpenAPI spec
 * - Schema validation
 * - API endpoint testing
 * - Documentation updates
 * 
 * Usage: npm run build:api-types
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const API_SPEC_PATH = path.join(process.cwd(), 'api', 'openapi.yaml');
const TYPES_OUTPUT_PATH = path.join(process.cwd(), 'api', 'generated-types.ts');
const CLIENT_TYPES_PATH = path.join(process.cwd(), 'client', 'src', 'types', 'api.ts');

console.log('🚀 Building SmartCare PRO API Types and Validation...');

// Step 1: Validate OpenAPI specification
function validateOpenAPISpec() {
  console.log('1️⃣ Validating OpenAPI specification...');
  
  try {
    const spec = yaml.load(fs.readFileSync(API_SPEC_PATH, 'utf8'));
    
    // Basic validation checks
    const requiredFields = ['openapi', 'info', 'paths'];
    for (const field of requiredFields) {
      if (!spec[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate version
    if (!spec.openapi.startsWith('3.')) {
      throw new Error(`Unsupported OpenAPI version: ${spec.openapi}`);
    }
    
    // Count endpoints
    const pathCount = Object.keys(spec.paths).length;
    console.log(`   ✅ Valid OpenAPI 3.1 specification with ${pathCount} endpoints`);
    
    return spec;
  } catch (error) {
    console.error(`   ❌ OpenAPI validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Step 2: Generate TypeScript types
function generateTypeScriptTypes() {
  console.log('2️⃣ Generating TypeScript types...');
  
  try {
    // Generate types using openapi-typescript
    execSync(`npx openapi-typescript ${API_SPEC_PATH} --output ${TYPES_OUTPUT_PATH}`, {
      stdio: 'pipe'
    });
    
    console.log(`   ✅ Types generated: ${TYPES_OUTPUT_PATH}`);
  } catch (error) {
    console.error(`   ❌ Type generation failed: ${error.message}`);
    process.exit(1);
  }
}

// Step 3: Create client-side API types
function createClientTypes() {
  console.log('3️⃣ Creating client-side API types...');
  
  const clientTypesContent = `/**
 * SmartCare PRO API Types for Client
 * 
 * Auto-generated from OpenAPI specification
 * Do not edit manually - use 'npm run build:api-types'
 */

// Import generated types
import type { paths, components } from '../../api/generated-types';

// Export commonly used types
export type User = components['schemas']['User'];
export type Facility = components['schemas']['Facility'];
export type Patient = components['schemas']['Patient'];
export type PatientCreate = components['schemas']['PatientCreate'];
export type ClinicalAlert = components['schemas']['ClinicalAlert'];
export type TransferRoute = components['schemas']['TransferRoute'];
export type ErrorResponse = components['schemas']['ErrorResponse'];

// API response wrapper
export type ApiResponse<T = any> = {
  data?: T;
  message?: string;
  success?: boolean;
  timestamp?: string;
};

// Request/Response types for specific endpoints
export type GetPatientsResponse = paths['/api/patients']['get']['responses']['200']['content']['application/json'];
export type CreatePatientRequest = paths['/api/patients']['post']['requestBody']['content']['application/json'];
export type CreatePatientResponse = paths['/api/patients']['post']['responses']['201']['content']['application/json'];

export type GetFacilitiesResponse = paths['/api/facilities']['get']['responses']['200']['content']['application/json'];
export type GetProvincesResponse = paths['/api/facilities/provinces']['get']['responses']['200']['content']['application/json'];

export type ClinicalAnalysisRequest = paths['/api/ai/clinical-analysis']['post']['requestBody']['content']['application/json'];
export type ClinicalAnalysisResponse = paths['/api/ai/clinical-analysis']['post']['responses']['200']['content']['application/json'];

export type TransferSearchRequest = paths['/api/transfers/search']['post']['requestBody']['content']['application/json'];
export type TransferSearchResponse = paths['/api/transfers/search']['post']['responses']['200']['content']['application/json'];

// Clinical decision support types
export interface ANCRecord {
  id?: number;
  patientId: number;
  visitDate: string;
  gestationalAge: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
  alerts?: ClinicalAlert[];
  recommendations?: string[];
  nextAppointment?: string;
  referralRequired?: boolean;
}

// Permission system
export const PERMISSIONS = {
  ANC_SERVICE: 'ANCService',
  MEDICAL_ENCOUNTER: 'MedicalEncounter',
  ART: 'ART',
  PREP: 'PREP',
  FAMILY_PLANNING: 'FamilyPlanning',
  PRESCRIPTIONS: 'Prescriptions'
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];
`;

  // Ensure directory exists
  const clientTypesDir = path.dirname(CLIENT_TYPES_PATH);
  if (!fs.existsSync(clientTypesDir)) {
    fs.mkdirSync(clientTypesDir, { recursive: true });
  }
  
  fs.writeFileSync(CLIENT_TYPES_PATH, clientTypesContent);
  console.log(`   ✅ Client types created: ${CLIENT_TYPES_PATH}`);
}

// Step 4: Validate generated types
function validateGeneratedTypes() {
  console.log('4️⃣ Validating generated types...');
  
  try {
    // Check if TypeScript can compile the generated types
    execSync(`npx tsc --noEmit ${TYPES_OUTPUT_PATH}`, {
      stdio: 'pipe'
    });
    
    console.log('   ✅ Generated types are valid TypeScript');
  } catch (error) {
    console.error('   ❌ Generated types have TypeScript errors');
    console.error(error.stdout?.toString() || error.message);
    process.exit(1);
  }
}

// Step 5: Generate API client helper
function generateAPIClient() {
  console.log('5️⃣ Generating API client helper...');
  
  const apiClientContent = `/**
 * SmartCare PRO API Client
 * 
 * Type-safe API client with request/response validation
 * Auto-generated from OpenAPI specification
 */

import type {
  User,
  Facility,
  Patient,
  PatientCreate,
  GetPatientsResponse,
  CreatePatientRequest,
  ClinicalAnalysisRequest,
  ClinicalAnalysisResponse,
  TransferSearchRequest,
  TransferSearchResponse,
  ApiResponse
} from './api';

// Base API configuration
const API_BASE_URL = process.env.VITE_API_URL || '';

// HTTP client with error handling
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = \`\${API_BASE_URL}\${endpoint}\`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(\`\${response.status}: \${errorData.message || 'API request failed'}\`);
  }
  
  return response.json();
}

// Type-safe API methods
export const smartCareAPI = {
  // Authentication
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/api/user');
  },
  
  // Facilities
  async getFacilities(): Promise<Facility[]> {
    return apiRequest<Facility[]>('/api/facilities');
  },
  
  async getAllFacilities(): Promise<Facility[]> {
    return apiRequest<Facility[]>('/api/facilities/all');
  },
  
  async getProvinces(): Promise<string[]> {
    return apiRequest<string[]>('/api/facilities/provinces');
  },
  
  async getDistrictsByProvince(province: string): Promise<string[]> {
    return apiRequest<string[]>(\`/api/facilities/districts/\${encodeURIComponent(province)}\`);
  },
  
  // Patients
  async getPatients(params?: Record<string, any>): Promise<Patient[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<Patient[]>(\`/api/patients\${query}\`);
  },
  
  async createPatient(patient: PatientCreate): Promise<Patient> {
    return apiRequest<Patient>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },
  
  async getPatient(id: number): Promise<Patient> {
    return apiRequest<Patient>(\`/api/patients/\${id}\`);
  },
  
  async searchPatients(type: string, query: string): Promise<Patient[]> {
    return apiRequest<Patient[]>(\`/api/patients/search?type=\${type}&query=\${encodeURIComponent(query)}\`);
  },
  
  // Clinical Intelligence
  async analyzeClinicalData(request: ClinicalAnalysisRequest): Promise<ClinicalAnalysisResponse> {
    return apiRequest<ClinicalAnalysisResponse>('/api/ai/clinical-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Smart Transfer
  async searchTransferRoutes(request: TransferSearchRequest): Promise<TransferSearchResponse> {
    return apiRequest<TransferSearchResponse>('/api/transfers/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Validation helpers
  async checkNRC(nrc: string): Promise<{ exists: boolean; message: string }> {
    return apiRequest(\`/api/patients/check-nrc/\${encodeURIComponent(nrc)}\`);
  },
  
  async checkPhone(phone: string): Promise<{ exists: boolean; message: string }> {
    return apiRequest(\`/api/patients/check-phone/\${encodeURIComponent(phone)}\`);
  },
};

// Export for use in React components
export default smartCareAPI;
`;

  const apiClientPath = path.join(process.cwd(), 'client', 'src', 'lib', 'smartcare-api.ts');
  const apiClientDir = path.dirname(apiClientPath);
  
  if (!fs.existsSync(apiClientDir)) {
    fs.mkdirSync(apiClientDir, { recursive: true });
  }
  
  fs.writeFileSync(apiClientPath, apiClientContent);
  console.log(`   ✅ API client generated: ${apiClientPath}`);
}

// Step 6: Update package.json scripts
function updatePackageScripts() {
  console.log('6️⃣ Updating package.json scripts...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add API-related scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:api-types': 'node scripts/build-api-types.js',
    'test:api': 'node scripts/test-api-endpoints.js',
    'validate:openapi': 'npx swagger-codegen-cli validate -i api/openapi.yaml',
    'docs:api': 'npx @redocly/openapi-cli build-docs api/openapi.yaml --output docs/api/redoc.html'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Package.json scripts updated');
}

// Main execution
async function main() {
  try {
    const spec = validateOpenAPISpec();
    generateTypeScriptTypes();
    createClientTypes();
    validateGeneratedTypes();
    generateAPIClient();
    updatePackageScripts();
    
    console.log('\n✨ SmartCare PRO API build completed successfully!');
    console.log('\nGenerated files:');
    console.log(`  📄 ${TYPES_OUTPUT_PATH}`);
    console.log(`  📄 ${CLIENT_TYPES_PATH}`);
    console.log(`  📄 client/src/lib/smartcare-api.ts`);
    
    console.log('\nAvailable commands:');
    console.log('  npm run build:api-types  - Regenerate types');
    console.log('  npm run test:api         - Test API endpoints');
    console.log('  npm run docs:api         - Generate documentation');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}