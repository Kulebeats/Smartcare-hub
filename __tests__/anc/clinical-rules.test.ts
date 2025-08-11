/**
 * Clinical Rules Service Tests
 * Tests for ANC clinical decision support system
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  evaluateClinicalRules,
  requiresImmediateReferral,
  generateClinicalAlerts,
  getDangerSignsByTrimester
} from '../../client/src/services/anc/clinical-rules.service';

describe('Clinical Rules Service', () => {
  describe('evaluateClinicalRules', () => {
    it('should detect severe hypertension', () => {
      const data = {
        vitalSigns: {
          bloodPressure: { systolic: 165, diastolic: 115 }
        }
      };
      
      const result = evaluateClinicalRules(data);
      
      expect(result).toContainEqual(
        expect.objectContaining({
          id: 'severe_hypertension',
          severity: 'critical',
          triggered: true
        })
      );
    });

    it('should detect severe anemia', () => {
      const data = {
        labResults: {
          hemoglobin: 6.5
        }
      };
      
      const result = evaluateClinicalRules(data);
      
      expect(result).toContainEqual(
        expect.objectContaining({
          id: 'severe_anemia',
          severity: 'high',
          triggered: true
        })
      );
    });

    it('should detect proteinuria warning', () => {
      const data = {
        labResults: {
          urineProtein: '++'
        }
      };
      
      const result = evaluateClinicalRules(data);
      
      expect(result).toContainEqual(
        expect.objectContaining({
          id: 'proteinuria',
          severity: 'medium',
          triggered: true
        })
      );
    });

    it('should not trigger rules when values are normal', () => {
      const data = {
        vitalSigns: {
          bloodPressure: { systolic: 120, diastolic: 80 }
        },
        labResults: {
          hemoglobin: 12.5,
          urineProtein: 'negative'
        }
      };
      
      const result = evaluateClinicalRules(data);
      const triggeredRules = result.filter(r => r.triggered);
      
      expect(triggeredRules).toHaveLength(0);
    });
  });

  describe('requiresImmediateReferral', () => {
    it('should require immediate referral for critical vital signs', () => {
      const data = {
        vitalSigns: {
          bloodPressure: { systolic: 180, diastolic: 120 }
        }
      };
      
      const result = requiresImmediateReferral(data);
      
      expect(result.required).toBe(true);
      expect(result.reasons).toContain('Severe hypertension (BP ≥160/110)');
    });

    it('should require immediate referral for vaginal bleeding', () => {
      const data = {
        dangerSigns: ['vaginalBleeding']
      };
      
      const result = requiresImmediateReferral(data);
      
      expect(result.required).toBe(true);
      expect(result.reasons).toContain('Vaginal bleeding');
    });

    it('should require immediate referral for multiple danger signs', () => {
      const data = {
        dangerSigns: ['severeHeadache', 'blurredVision', 'epigastricPain']
      };
      
      const result = requiresImmediateReferral(data);
      
      expect(result.required).toBe(true);
      expect(result.priority).toBe('emergency');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should not require referral when all parameters are normal', () => {
      const data = {
        vitalSigns: {
          bloodPressure: { systolic: 115, diastolic: 75 },
          temperature: 36.8
        },
        dangerSigns: []
      };
      
      const result = requiresImmediateReferral(data);
      
      expect(result.required).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('generateClinicalAlerts', () => {
    it('should generate critical alert for severe pre-eclampsia indicators', () => {
      const rules = [
        {
          id: 'severe_hypertension',
          triggered: true,
          severity: 'critical',
          message: 'Severe hypertension detected'
        }
      ];
      
      const alerts = generateClinicalAlerts(rules, 'patient-123');
      
      expect(alerts).toContainEqual(
        expect.objectContaining({
          patientId: 'patient-123',
          severity: 'critical',
          type: 'clinical_rule',
          title: 'Severe hypertension'
        })
      );
    });

    it('should prioritize alerts by severity', () => {
      const rules = [
        { id: 'rule1', triggered: true, severity: 'low', message: 'Low priority' },
        { id: 'rule2', triggered: true, severity: 'critical', message: 'Critical' },
        { id: 'rule3', triggered: true, severity: 'medium', message: 'Medium priority' }
      ];
      
      const alerts = generateClinicalAlerts(rules, 'patient-123');
      
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[1].severity).toBe('medium');
      expect(alerts[2].severity).toBe('low');
    });

    it('should not generate alerts for non-triggered rules', () => {
      const rules = [
        { id: 'rule1', triggered: false, severity: 'high', message: 'Not triggered' },
        { id: 'rule2', triggered: true, severity: 'medium', message: 'Triggered' }
      ];
      
      const alerts = generateClinicalAlerts(rules, 'patient-123');
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toBe('Triggered');
    });
  });

  describe('getDangerSignsByTrimester', () => {
    it('should return first trimester danger signs', () => {
      const signs = getDangerSignsByTrimester(1);
      
      expect(signs).toContainEqual(
        expect.objectContaining({
          id: 'vaginalBleeding',
          trimester: [1, 2, 3]
        })
      );
      expect(signs).toContainEqual(
        expect.objectContaining({
          id: 'severeVomiting',
          trimester: [1]
        })
      );
    });

    it('should return second trimester danger signs', () => {
      const signs = getDangerSignsByTrimester(2);
      
      expect(signs).toContainEqual(
        expect.objectContaining({
          id: 'decreasedFetalMovement',
          trimester: [2, 3]
        })
      );
    });

    it('should return third trimester danger signs', () => {
      const signs = getDangerSignsByTrimester(3);
      
      expect(signs).toContainEqual(
        expect.objectContaining({
          id: 'laborPains',
          trimester: [3]
        })
      );
      expect(signs).toContainEqual(
        expect.objectContaining({
          id: 'waterBreaking',
          trimester: [3]
        })
      );
    });

    it('should filter signs correctly by trimester', () => {
      const firstTrimesterSigns = getDangerSignsByTrimester(1);
      const thirdTrimesterSigns = getDangerSignsByTrimester(3);
      
      // Severe vomiting is only in first trimester
      expect(firstTrimesterSigns.some(s => s.id === 'severeVomiting')).toBe(true);
      expect(thirdTrimesterSigns.some(s => s.id === 'severeVomiting')).toBe(false);
      
      // Labor pains only in third trimester
      expect(firstTrimesterSigns.some(s => s.id === 'laborPains')).toBe(false);
      expect(thirdTrimesterSigns.some(s => s.id === 'laborPains')).toBe(true);
    });
  });
});