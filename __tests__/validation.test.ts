// Patient and ANC validation tests
import { patientSchema, ancRecordSchema } from '../server/validation/patient';
import { validate } from '../server/validation/middleware';
import { Request, Response } from 'express';

describe('Patient Validation', () => {
  describe('patientSchema', () => {
    test('should accept valid patient data', () => {
      const validPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male' as const,
        nrc: '123456/12/1',
        cellphoneNumber: '0977123456',
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      expect(() => patientSchema.parse(validPatient)).not.toThrow();
    });

    test('should reject invalid NRC format', () => {
      const invalidPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male' as const,
        nrc: '12345/12/1', // Missing digit
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();
    });

    test('should reject invalid phone number format', () => {
      const invalidPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Male' as const,
        cellphoneNumber: '123456789', // Invalid format
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();
    });

    test('should accept female patient with valid data', () => {
      const validFemalePatient = {
        firstName: 'Jane',
        surname: 'Smith',
        dateOfBirth: '1990-01-01',
        sex: 'Female' as const,
        nrc: '900101/15/1',
        cellphoneNumber: '0977654321',
        facility: 'Chamakubi Health Post',
        mothersName: 'Alice',
        mothersSurname: 'Smith'
      };

      expect(() => patientSchema.parse(validFemalePatient)).not.toThrow();
    });

    test('should reject invalid sex value', () => {
      const invalidPatient = {
        firstName: 'John',
        surname: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: 'Unknown' as any, // Invalid sex
        facility: 'Chamakubi Health Post',
        mothersName: 'Mary',
        mothersSurname: 'Doe'
      };

      expect(() => patientSchema.parse(invalidPatient)).toThrow();
    });
  });

  describe('ancRecordSchema', () => {
    test('should accept valid ANC record', () => {
      const validANC = {
        patientId: 1,
        visitType: 'routine' as const,
        gestationalAge: 20,
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80,
        temperatureFirst: 370, // 37.0°C
        pulseRateFirst: 72,
        respiratoryRateFirst: 18
      };

      expect(() => ancRecordSchema.parse(validANC)).not.toThrow();
    });

    test('should reject extremely high blood pressure', () => {
      const invalidANC = {
        patientId: 1,
        visitType: 'routine' as const,
        gestationalAge: 20,
        bloodPressureSystolic1: 300, // Too high
        bloodPressureDiastolic1: 80,
        temperatureFirst: 370
      };

      expect(() => ancRecordSchema.parse(invalidANC)).toThrow();
    });

    test('should reject invalid gestational age', () => {
      const invalidANC = {
        patientId: 1,
        visitType: 'routine' as const,
        gestationalAge: 50, // Too high for human pregnancy
        bloodPressureSystolic1: 120,
        bloodPressureDiastolic1: 80
      };

      expect(() => ancRecordSchema.parse(invalidANC)).toThrow();
    });

    test('should accept initial visit type', () => {
      const validInitialANC = {
        patientId: 1,
        visitType: 'initial' as const,
        gestationalAge: 12,
        bloodPressureSystolic1: 110,
        bloodPressureDiastolic1: 70,
        temperatureFirst: 365
      };

      expect(() => ancRecordSchema.parse(validInitialANC)).not.toThrow();
    });

    test('should reject invalid visit type', () => {
      const invalidANC = {
        patientId: 1,
        visitType: 'emergency' as any, // Invalid visit type
        gestationalAge: 20,
        bloodPressureSystolic1: 120
      };

      expect(() => ancRecordSchema.parse(invalidANC)).toThrow();
    });
  });
});