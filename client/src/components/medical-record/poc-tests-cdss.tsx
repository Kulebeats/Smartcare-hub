import React from 'react';
import { CDSSCondition } from './clinical-decision-support-modal';

/**
 * POC Tests Clinical Decision Support System
 * Migrated from Laboratory Tests module for better clinical workflow
 */

// Hemoglobin evaluation function - migrated from Laboratory Tests
export function evaluateHemoglobin(hemoglobin: number): CDSSCondition | null {
  if (hemoglobin < 7.0) {
    return {
      diagnosis: 'CRITICAL: Severe Anemia Detected',
      severity: 'critical',
      treatments: [
        {
          type: 'Blood Transfusion',
          details: 'URGENT: Consider blood transfusion for severe anemia',
          dosing: 'Packed RBC as clinically indicated',
          duration: 'Immediate'
        },
        {
          type: 'High-Dose Iron Supplementation',
          details: 'Start iron 120mg + folic acid 5mg daily',
          dosing: 'Iron 120mg + Folic acid 5mg daily',
          duration: 'Until Hb >10g/dL'
        }
      ],
      counseling: [
        'Explain severe anemia risks to mother and baby',
        'Discuss importance of immediate treatment',
        'Provide information about blood transfusion if needed',
        'Emphasize compliance with iron supplementation'
      ],
      actions: [
        'URGENT: Consider blood transfusion',
        'Refer to specialist immediately',
        'Start iron 120mg + folic acid 5mg daily',
        'Monitor for signs of heart failure',
        'Daily hemoglobin monitoring required'
      ],
      followUp: [
        'Daily hemoglobin monitoring',
        'Monitor for cardiac complications',
        'Specialist follow-up within 24 hours',
        'Reassess treatment response'
      ],
      whoReference: 'WHO Guidelines on Anemia in Pregnancy - Section 7.2'
    };
  } else if (hemoglobin < 9.0) {
    return {
      diagnosis: 'Moderate Anemia Alert',
      severity: 'warning',
      treatments: [
        {
          type: 'Iron Supplementation',
          details: 'Start iron 120mg + folic acid 5mg daily',
          dosing: 'Iron 120mg + Folic acid 5mg daily',
          duration: '8-12 weeks or until Hb >11g/dL'
        }
      ],
      counseling: [
        'Explain moderate anemia and its implications',
        'Discuss iron-rich foods and dietary modifications',
        'Emphasize importance of compliance with treatment',
        'Address any concerns about iron supplements'
      ],
      actions: [
        'Start iron 120mg + folic acid 5mg daily',
        'Monitor weekly hemoglobin levels',
        'Consider specialist referral',
        'Nutritional counseling required',
        'Investigate underlying causes'
      ],
      followUp: [
        'Weekly hemoglobin monitoring',
        'Nutritional assessment',
        'Monitor for improvement',
        'Reassess after 4 weeks'
      ],
      whoReference: 'WHO Guidelines on Anemia in Pregnancy - Section 7.1'
    };
  } else if (hemoglobin < 11.0) {
    return {
      diagnosis: 'Mild Anemia Alert',
      severity: 'info',
      treatments: [
        {
          type: 'Iron Supplementation',
          details: 'Iron supplementation 60mg daily',
          dosing: 'Iron 60mg daily',
          duration: 'Throughout pregnancy'
        }
      ],
      counseling: [
        'Explain mild anemia and prevention strategies',
        'Nutritional counseling on iron-rich foods',
        'Discuss importance of regular monitoring',
        'Address dietary modifications'
      ],
      actions: [
        'Iron supplementation 60mg daily',
        'Nutritional counseling on iron-rich foods',
        'Recheck hemoglobin in 4 weeks',
        'Monitor for worsening symptoms'
      ],
      followUp: [
        'Hemoglobin recheck in 4 weeks',
        'Monitor for symptoms',
        'Routine antenatal care',
        'Dietary assessment'
      ],
      whoReference: 'WHO Guidelines on Anemia Prevention in Pregnancy'
    };
  }
  return null;
}

// Hepatitis B evaluation function - migrated from Laboratory Tests
export function evaluateHepatitisB(testResult: string): CDSSCondition | null {
  if (testResult === 'positive') {
    return {
      diagnosis: 'Hepatitis B Positive',
      severity: 'critical',
      treatments: [
        {
          type: 'Confirmatory Testing',
          details: 'Request Nucleic Acid Testing (NAT) to confirm diagnosis',
          dosing: 'Laboratory NAT test',
          duration: 'Immediate'
        }
      ],
      counseling: [
        'Provide post-testing counselling',
        'Explain significance of positive result and transmission risks',
        'Discuss prevention strategies for family members',
        'Address questions and concerns about pregnancy outcomes'
      ],
      actions: [
        'Request confirmatory Nucleic Acid Testing (NAT)',
        'Refer to hospital for specialized care',
        'Contact infectious disease specialist',
        'Initiate partner testing and counseling'
      ],
      partnerCare: [
        'Test partner for Hepatitis B',
        'Provide partner counseling',
        'Consider partner vaccination if negative'
      ],
      followUp: [
        'Monitor liver function tests',
        'Plan delivery management',
        'Arrange pediatric Hepatitis B vaccination schedule',
        'Schedule follow-up with hepatology specialist'
      ],
      whoReference: 'WHO Guidelines on Hepatitis B and C Testing - Section 16.7'
    };
  } else if (testResult === 'negative') {
    return {
      diagnosis: 'Hepatitis B Negative',
      severity: 'info',
      treatments: [
        {
          type: 'Immunization',
          details: 'Hepatitis B vaccination recommended',
          dosing: 'Standard vaccination schedule',
          duration: '3-dose series'
        }
      ],
      counseling: [
        'Provide post-testing counselling',
        'Advise retesting if ongoing risk or known exposure',
        'Discuss vaccination benefits and schedule'
      ],
      actions: [
        'Offer Hepatitis B vaccination',
        'Provide risk reduction counseling',
        'Schedule vaccination series'
      ],
      whoReference: 'WHO Guidelines on Hepatitis B and C Testing - Section 16.6'
    };
  }
  return null;
}

// Helper function to evaluate POC test results
export function evaluatePOCTestResult(testType: string, result: any): CDSSCondition | null {
  switch (testType) {
    case 'hemoglobin_level':
      if (typeof result === 'number') {
        return evaluateHemoglobin(result);
      }
      break;
    case 'hepatitis_b_core_ab':
    case 'hepatitis_b_surface_antigen':
      if (typeof result === 'string') {
        return evaluateHepatitisB(result);
      }
      break;
    default:
      return null;
  }
  return null;
}