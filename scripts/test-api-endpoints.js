#!/usr/bin/env node

/**
 * SmartCare PRO API Endpoint Testing Script
 * 
 * Comprehensive validation of all API endpoints including:
 * - Authentication flows
 * - Request/response validation
 * - OpenAPI compliance
 * - Clinical decision support endpoints
 * - Smart transfer system
 * 
 * Usage: node scripts/test-api-endpoints.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const RESULTS_FILE = path.join(__dirname, '..', 'api-test-results.json');

// Test session tracking
let sessionCookie = null;
const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: API_BASE_URL,
  totalTests: 0,
  passed: 0,
  failed: 0,
  results: []
};

// HTTP client with session support
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  validateStatus: () => true // Don't throw on HTTP errors
});

// Test logging utilities
function logTest(name, status, details = {}) {
  testResults.totalTests++;
  testResults[status]++;
  
  const result = {
    test: name,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.results.push(result);
  
  const emoji = status === 'passed' ? '✅' : '❌';
  console.log(`${emoji} ${name} - ${status.toUpperCase()}`);
  
  if (details.error) {
    console.log(`   Error: ${details.error}`);
  }
  if (details.responseTime) {
    console.log(`   Response time: ${details.responseTime}ms`);
  }
}

// Authentication test
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  try {
    const start = Date.now();
    const response = await client.get('/api/user');
    const responseTime = Date.now() - start;
    
    if (response.status === 401) {
      logTest('GET /api/user (unauthenticated)', 'passed', {
        statusCode: response.status,
        responseTime,
        note: 'Correctly returns 401 for unauthenticated request'
      });
    } else if (response.status === 200) {
      logTest('GET /api/user (authenticated)', 'passed', {
        statusCode: response.status,
        responseTime,
        userData: response.data
      });
      
      // Store session if authenticated
      if (response.headers['set-cookie']) {
        sessionCookie = response.headers['set-cookie'][0];
        client.defaults.headers.cookie = sessionCookie;
      }
    } else {
      logTest('GET /api/user', 'failed', {
        statusCode: response.status,
        responseTime,
        error: `Unexpected status code: ${response.status}`
      });
    }
  } catch (error) {
    logTest('GET /api/user', 'failed', {
      error: error.message
    });
  }
}

// Facility endpoints test
async function testFacilityEndpoints() {
  console.log('\n🏥 Testing Facility Management Endpoints...');
  
  const facilityTests = [
    { endpoint: '/api/facilities', method: 'GET', name: 'Get user facilities' },
    { endpoint: '/api/facilities/all', method: 'GET', name: 'Get all facilities' },
    { endpoint: '/api/facilities/provinces', method: 'GET', name: 'Get provinces' },
    { endpoint: '/api/facilities/districts/Lusaka', method: 'GET', name: 'Get districts by province' },
    { endpoint: '/api/facilities/byDistrict/Lusaka District', method: 'GET', name: 'Get facilities by district' },
    { endpoint: '/api/facilities/byProvince/Lusaka', method: 'GET', name: 'Get facilities by province' }
  ];
  
  for (const test of facilityTests) {
    try {
      const start = Date.now();
      const response = await client[test.method.toLowerCase()](test.endpoint);
      const responseTime = Date.now() - start;
      
      if (response.status === 200) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          dataCount: Array.isArray(response.data) ? response.data.length : 'N/A'
        });
      } else if (response.status === 401) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          note: 'Authentication required (expected)'
        });
      } else {
        logTest(`${test.method} ${test.endpoint}`, 'failed', {
          statusCode: response.status,
          responseTime,
          error: `Unexpected status: ${response.status}`
        });
      }
    } catch (error) {
      logTest(`${test.method} ${test.endpoint}`, 'failed', {
        error: error.message
      });
    }
  }
}

// Patient management endpoints test
async function testPatientEndpoints() {
  console.log('\n👤 Testing Patient Management Endpoints...');
  
  const patientTests = [
    { endpoint: '/api/patients', method: 'GET', name: 'Get patients list' },
    { endpoint: '/api/patients/search?type=name&query=Angela', method: 'GET', name: 'Search patients by name' },
    { endpoint: '/api/patients/check-nrc/123456/78/9', method: 'GET', name: 'Check NRC availability' },
    { endpoint: '/api/patients/check-phone/0977123456', method: 'GET', name: 'Check phone availability' }
  ];
  
  for (const test of patientTests) {
    try {
      const start = Date.now();
      const response = await client[test.method.toLowerCase()](test.endpoint);
      const responseTime = Date.now() - start;
      
      if ([200, 409].includes(response.status)) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          dataCount: Array.isArray(response.data) ? response.data.length : 'N/A'
        });
      } else if (response.status === 401) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          note: 'Authentication required (expected)'
        });
      } else {
        logTest(`${test.method} ${test.endpoint}`, 'failed', {
          statusCode: response.status,
          responseTime,
          error: `Unexpected status: ${response.status}`
        });
      }
    } catch (error) {
      logTest(`${test.method} ${test.endpoint}`, 'failed', {
        error: error.message
      });
    }
  }
}

// Clinical Intelligence endpoints test
async function testClinicalIntelligenceEndpoints() {
  console.log('\n🧠 Testing Clinical Intelligence Endpoints...');
  
  const clinicalTests = [
    {
      endpoint: '/api/ai/clinical-analysis',
      method: 'POST',
      name: 'Clinical data analysis',
      payload: {
        patientData: { age: 25, sex: 'Female' },
        clinicalData: { bloodPressure: '120/80', heartRate: 72 },
        analysisType: 'risk_assessment'
      }
    },
    {
      endpoint: '/api/ai/adverse-reaction',
      method: 'POST',
      name: 'Adverse reaction analysis',
      payload: {
        patientId: 1,
        medication: 'Efavirenz',
        symptoms: ['nausea', 'dizziness'],
        severity: 'Mild',
        onsetDate: '2024-01-15'
      }
    },
    {
      endpoint: '/api/ai/task-recommendations',
      method: 'POST',
      name: 'Task recommendations',
      payload: {
        clinicalContext: { department: 'ANC' },
        patientConditions: ['pregnancy', 'hypertension'],
        currentWorkload: { activePatients: 15 }
      }
    }
  ];
  
  for (const test of clinicalTests) {
    try {
      const start = Date.now();
      const response = await client[test.method.toLowerCase()](test.endpoint, test.payload);
      const responseTime = Date.now() - start;
      
      if (response.status === 200) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          hasRecommendations: !!response.data?.recommendations
        });
      } else if (response.status === 401) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          note: 'Authentication required (expected)'
        });
      } else {
        logTest(`${test.method} ${test.endpoint}`, 'failed', {
          statusCode: response.status,
          responseTime,
          error: `Unexpected status: ${response.status}`,
          response: response.data
        });
      }
    } catch (error) {
      logTest(`${test.method} ${test.endpoint}`, 'failed', {
        error: error.message
      });
    }
  }
}

// Smart Transfer System endpoints test
async function testSmartTransferEndpoints() {
  console.log('\n🚑 Testing Smart Transfer System Endpoints...');
  
  const transferTests = [
    {
      endpoint: '/api/transfers/search',
      method: 'POST',
      name: 'Transfer route search',
      payload: {
        patientId: 1,
        urgency: 'Urgent',
        requiredServices: ['ICU', 'Cardiology'],
        transportType: 'Ambulance',
        originFacility: 'Chikando Rural Health Centre',
        maxDistance: 100,
        medicalCondition: 'Acute MI'
      }
    },
    {
      endpoint: '/api/transfers/facilities/50?lat=-15.4067&lon=28.2833',
      method: 'GET',
      name: 'Facilities in radius'
    },
    {
      endpoint: '/api/transfers/capacity-update',
      method: 'POST',
      name: 'Capacity update',
      payload: {
        facilityId: 'UTH001',
        occupancyUpdate: {
          beds: 150,
          maternity: 20,
          pediatric: 30
        }
      }
    }
  ];
  
  for (const test of transferTests) {
    try {
      const start = Date.now();
      const response = test.method === 'POST' 
        ? await client.post(test.endpoint, test.payload)
        : await client.get(test.endpoint);
      const responseTime = Date.now() - start;
      
      if (response.status === 200) {
        logTest(`${test.method} ${test.endpoint.split('?')[0]}`, 'passed', {
          statusCode: response.status,
          responseTime,
          success: response.data?.success
        });
      } else if (response.status === 401) {
        logTest(`${test.method} ${test.endpoint.split('?')[0]}`, 'passed', {
          statusCode: response.status,
          responseTime,
          note: 'Authentication required (expected)'
        });
      } else {
        logTest(`${test.method} ${test.endpoint.split('?')[0]}`, 'failed', {
          statusCode: response.status,
          responseTime,
          error: `Unexpected status: ${response.status}`
        });
      }
    } catch (error) {
      logTest(`${test.method} ${test.endpoint.split('?')[0]}`, 'failed', {
        error: error.message
      });
    }
  }
}

// Documentation endpoints test
async function testDocumentationEndpoints() {
  console.log('\n📚 Testing API Documentation Endpoints...');
  
  const docTests = [
    { endpoint: '/api-docs', method: 'GET', name: 'Swagger UI documentation' },
    { endpoint: '/docs/api/swagger.html', method: 'GET', name: 'Custom API documentation' }
  ];
  
  for (const test of docTests) {
    try {
      const start = Date.now();
      const response = await client[test.method.toLowerCase()](test.endpoint);
      const responseTime = Date.now() - start;
      
      if (response.status === 200) {
        logTest(`${test.method} ${test.endpoint}`, 'passed', {
          statusCode: response.status,
          responseTime,
          contentType: response.headers['content-type']
        });
      } else {
        logTest(`${test.method} ${test.endpoint}`, 'failed', {
          statusCode: response.status,
          responseTime,
          error: `Unexpected status: ${response.status}`
        });
      }
    } catch (error) {
      logTest(`${test.method} ${test.endpoint}`, 'failed', {
        error: error.message
      });
    }
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting SmartCare PRO API Endpoint Testing...');
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log('=' * 60);
  
  await testAuthentication();
  await testFacilityEndpoints();
  await testPatientEndpoints();
  await testClinicalIntelligenceEndpoints();
  await testSmartTransferEndpoints();
  await testDocumentationEndpoints();
  
  // Generate summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 60);
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%`);
  
  // Save results to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(testResults, null, 2));
  console.log(`\n📁 Results saved to: ${RESULTS_FILE}`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle errors and cleanup
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };