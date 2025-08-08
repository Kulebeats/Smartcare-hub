/**
 * Advanced Clinical Decision Support Engine
 * Implements predictive analytics, treatment protocols, and care pathway intelligence
 * for comprehensive maternal health management in SmartCare PRO
 */

import { db } from "./db";
import { ancRecords, clinicalAlerts, patients } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface RiskScore {
  category: string;
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: string[];
  recommendations: string[];
}

export interface TreatmentProtocol {
  condition: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  contraindications: string[];
  monitoring: string[];
}

export interface CarePathway {
  nextVisit: {
    recommended: Date;
    urgency: 'Routine' | 'Priority' | 'Urgent';
    reason: string;
  };
  requiredTests: string[];
  referrals: {
    specialty: string;
    urgency: 'Routine' | 'Urgent' | 'Emergency';
    reason: string;
  }[];
  followUpActions: string[];
}

export class AdvancedClinicalEngine {
  
  /**
   * 1. PREDICTIVE ANALYTICS & RISK SCORING
   */
  
  async assessPreeclampsiaRisk(patientData: any): Promise<RiskScore> {
    const riskFactors: string[] = [];
    let score = 0;
    
    // Age factors
    if (patientData.age && (patientData.age < 20 || patientData.age > 35)) {
      riskFactors.push(`Maternal age: ${patientData.age} years`);
      score += patientData.age > 40 ? 3 : 2;
    }
    
    // Blood pressure trends
    if (patientData.systolicBP >= 140 || patientData.diastolicBP >= 90) {
      riskFactors.push(`Elevated BP: ${patientData.systolicBP}/${patientData.diastolicBP}`);
      score += patientData.systolicBP >= 160 ? 4 : 2;
    }
    
    // Proteinuria
    if (patientData.urineProtein && patientData.urineProtein !== 'Negative') {
      riskFactors.push(`Proteinuria: ${patientData.urineProtein}`);
      score += patientData.urineProtein === '3+' ? 4 : 2;
    }
    
    // Previous pregnancy history
    if (patientData.previousPreeclampsia) {
      riskFactors.push('History of pre-eclampsia');
      score += 3;
    }
    
    // Multiple pregnancy
    if (patientData.numberOfFetus > 1) {
      riskFactors.push('Multiple pregnancy');
      score += 2;
    }
    
    // First pregnancy
    if (patientData.gravidity === 1) {
      riskFactors.push('First pregnancy (nulliparity)');
      score += 1;
    }
    
    // BMI if available
    if (patientData.bmi && patientData.bmi > 30) {
      riskFactors.push(`High BMI: ${patientData.bmi}`);
      score += 2;
    }
    
    // Determine risk level and recommendations
    let level: 'Low' | 'Moderate' | 'High' | 'Critical';
    let recommendations: string[] = [];
    
    if (score >= 8) {
      level = 'Critical';
      recommendations = [
        'Immediate specialist referral',
        'Daily BP monitoring',
        'Twice weekly protein checks',
        'Consider admission for observation',
        'Fetal surveillance with CTG'
      ];
    } else if (score >= 5) {
      level = 'High';
      recommendations = [
        'Weekly specialist visits',
        'BP monitoring every 2 days',
        'Weekly protein checks',
        'Fetal growth monitoring',
        'Patient education on warning signs'
      ];
    } else if (score >= 2) {
      level = 'Moderate';
      recommendations = [
        'Bi-weekly BP monitoring',
        'Monthly protein checks',
        'Patient education on symptoms',
        'Regular fetal movement counting'
      ];
    } else {
      level = 'Low';
      recommendations = [
        'Routine antenatal care',
        'Standard BP monitoring',
        'Continue normal activities'
      ];
    }
    
    return {
      category: 'Pre-eclampsia Risk',
      score,
      level,
      factors: riskFactors,
      recommendations
    };
  }
  
  async assessPretermLaborRisk(patientData: any): Promise<RiskScore> {
    const riskFactors: string[] = [];
    let score = 0;
    
    // Previous preterm delivery
    if (patientData.previousPretermDelivery) {
      riskFactors.push('Previous preterm delivery');
      score += 4;
    }
    
    // Cervical length if measured
    if (patientData.cervicalLength && patientData.cervicalLength < 25) {
      riskFactors.push(`Short cervix: ${patientData.cervicalLength}mm`);
      score += 3;
    }
    
    // Multiple pregnancy
    if (patientData.numberOfFetus > 1) {
      riskFactors.push('Multiple pregnancy');
      score += 3;
    }
    
    // Maternal age
    if (patientData.age && (patientData.age < 18 || patientData.age > 35)) {
      riskFactors.push(`Maternal age: ${patientData.age} years`);
      score += 1;
    }
    
    // Smoking
    if (patientData.smoking) {
      riskFactors.push('Smoking during pregnancy');
      score += 2;
    }
    
    // UTI/infections
    if (patientData.utiPresent || patientData.vaginalInfection) {
      riskFactors.push('Genitourinary infection');
      score += 2;
    }
    
    // Polyhydramnios/oligohydramnios
    if (patientData.abnormalAmnioticFluid) {
      riskFactors.push('Abnormal amniotic fluid volume');
      score += 2;
    }
    
    let level: 'Low' | 'Moderate' | 'High' | 'Critical';
    let recommendations: string[] = [];
    
    if (score >= 7) {
      level = 'Critical';
      recommendations = [
        'Immediate specialist referral',
        'Consider cervical cerclage',
        'Bed rest consideration',
        'Steroid administration planning',
        'NICU availability confirmation'
      ];
    } else if (score >= 4) {
      level = 'High';
      recommendations = [
        'Specialist consultation',
        'Serial cervical length monitoring',
        'Activity modification',
        'Patient education on warning signs',
        'Consider progesterone therapy'
      ];
    } else if (score >= 2) {
      level = 'Moderate';
      recommendations = [
        'Close monitoring',
        'Patient education',
        'Regular cervical assessment',
        'Infection screening'
      ];
    } else {
      level = 'Low';
      recommendations = [
        'Routine care',
        'Standard monitoring'
      ];
    }
    
    return {
      category: 'Preterm Labor Risk',
      score,
      level,
      factors: riskFactors,
      recommendations
    };
  }
  
  /**
   * 2. TREATMENT PROTOCOL AUTOMATION
   */
  
  getAnemiaProtocol(hemoglobin: number, gestationalAge: number): TreatmentProtocol {
    let protocol: TreatmentProtocol;
    
    if (hemoglobin < 7) {
      // Severe anemia
      protocol = {
        condition: 'Severe Anemia',
        medication: 'Iron Fumarate + Blood Transfusion',
        dosage: '200mg Iron + Packed RBC as needed',
        frequency: 'Iron: Twice daily, Blood: As clinically indicated',
        duration: 'Until Hb >10g/dL',
        contraindications: [
          'Iron overload disorders',
          'Blood transfusion contraindications'
        ],
        monitoring: [
          'Daily Hb monitoring',
          'Weekly reticulocyte count',
          'Monitor for transfusion reactions',
          'Fetal surveillance'
        ]
      };
    } else if (hemoglobin < 10) {
      // Moderate anemia
      protocol = {
        condition: 'Moderate Anemia',
        medication: 'Ferrous Sulfate + Folic Acid',
        dosage: '325mg Iron + 5mg Folic Acid',
        frequency: 'Twice daily with meals',
        duration: '8-12 weeks or until Hb >11g/dL',
        contraindications: [
          'Iron intolerance',
          'Peptic ulcer disease'
        ],
        monitoring: [
          'Hb check every 2 weeks',
          'Monitor GI side effects',
          'Fetal growth monitoring'
        ]
      };
    } else {
      // Mild anemia/prevention
      protocol = {
        condition: 'Iron Deficiency Prevention',
        medication: 'Iron + Folic Acid (Standard ANC)',
        dosage: '60mg Iron + 400mcg Folic Acid',
        frequency: 'Once daily',
        duration: 'Throughout pregnancy',
        contraindications: [
          'Known iron allergy'
        ],
        monitoring: [
          'Monthly Hb monitoring',
          'Standard ANC follow-up'
        ]
      };
    }
    
    return protocol;
  }
  
  getHypertensionProtocol(systolic: number, diastolic: number, gestationalAge: number): TreatmentProtocol {
    if (systolic >= 160 || diastolic >= 110) {
      return {
        condition: 'Severe Hypertension',
        medication: 'Methyldopa + Nifedipine',
        dosage: 'Methyldopa 250mg + Nifedipine 10mg',
        frequency: 'Methyldopa 3x daily, Nifedipine as needed',
        duration: 'Until delivery + postpartum',
        contraindications: [
          'Heart block',
          'Severe heart failure',
          'Known drug allergies'
        ],
        monitoring: [
          'BP monitoring every 4 hours',
          'Daily proteinuria checks',
          'Liver function tests weekly',
          'Fetal surveillance daily'
        ]
      };
    } else if (systolic >= 140 || diastolic >= 90) {
      return {
        condition: 'Mild-Moderate Hypertension',
        medication: 'Methyldopa',
        dosage: '250mg',
        frequency: 'Twice daily',
        duration: 'Until delivery',
        contraindications: [
          'Depression',
          'Heart block'
        ],
        monitoring: [
          'BP monitoring twice daily',
          'Weekly proteinuria checks',
          'Bi-weekly fetal monitoring'
        ]
      };
    } else {
      return {
        condition: 'Normal Blood Pressure',
        medication: 'No medication required',
        dosage: 'N/A',
        frequency: 'N/A',
        duration: 'N/A',
        contraindications: [],
        monitoring: [
          'Routine BP monitoring',
          'Standard ANC care'
        ]
      };
    }
  }
  
  /**
   * 3. CARE PATHWAY INTELLIGENCE
   */
  
  async generateCarePathway(patientId: number, currentData: any): Promise<CarePathway> {
    // Get patient's previous visits and risk factors
    const previousVisits = await db
      .select()
      .from(ancRecords)
      .where(eq(ancRecords.patientId, patientId))
      .orderBy(desc(ancRecords.createdAt))
      .limit(5);
    
    const riskAssessments = await Promise.all([
      this.assessPreeclampsiaRisk(currentData),
      this.assessPretermLaborRisk(currentData)
    ]);
    
    const highestRisk = riskAssessments.reduce((max, current) => 
      current.score > max.score ? current : max
    );
    
    // Determine next visit timing
    let nextVisit: CarePathway['nextVisit'];
    const currentGA = currentData.gestationalAge || 0;
    
    if (highestRisk.level === 'Critical') {
      nextVisit = {
        recommended: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        urgency: 'Urgent',
        reason: `Critical risk: ${highestRisk.category}`
      };
    } else if (highestRisk.level === 'High') {
      nextVisit = {
        recommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        urgency: 'Priority',
        reason: `High risk: ${highestRisk.category}`
      };
    } else if (currentGA >= 36) {
      nextVisit = {
        recommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Weekly after 36 weeks
        urgency: 'Routine',
        reason: 'Term pregnancy - weekly monitoring'
      };
    } else if (currentGA >= 28) {
      nextVisit = {
        recommended: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Bi-weekly
        urgency: 'Routine',
        reason: 'Third trimester monitoring'
      };
    } else {
      nextVisit = {
        recommended: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // Monthly
        urgency: 'Routine',
        reason: 'Standard antenatal care'
      };
    }
    
    // Required tests based on gestational age and risk factors
    const requiredTests: string[] = [];
    
    if (currentGA >= 35 && currentGA <= 37) {
      requiredTests.push('Group B Strep screening');
    }
    
    if (currentGA >= 24 && currentGA <= 28) {
      requiredTests.push('Glucose tolerance test');
    }
    
    if (currentData.hemoglobin < 10) {
      requiredTests.push('Complete blood count');
      requiredTests.push('Iron studies');
    }
    
    if (currentData.systolicBP >= 140 || currentData.urineProtein !== 'Negative') {
      requiredTests.push('24-hour urine protein');
      requiredTests.push('Liver function tests');
      requiredTests.push('Platelet count');
    }
    
    // Referrals based on conditions
    const referrals: CarePathway['referrals'] = [];
    
    if (highestRisk.level === 'Critical' || currentData.systolicBP >= 160) {
      referrals.push({
        specialty: 'Obstetrics & Gynecology',
        urgency: 'Emergency',
        reason: 'High-risk pregnancy management'
      });
    }
    
    if (currentData.hemoglobin < 7) {
      referrals.push({
        specialty: 'Hematology',
        urgency: 'Urgent',
        reason: 'Severe anemia evaluation'
      });
    }
    
    if (currentGA >= 40) {
      referrals.push({
        specialty: 'Obstetrics',
        urgency: 'Priority',
        reason: 'Post-term pregnancy evaluation'
      });
    }
    
    // Follow-up actions
    const followUpActions: string[] = [
      'Review danger signs with patient',
      'Ensure medication compliance',
      'Document fetal movements',
      'Blood pressure monitoring at home if indicated'
    ];
    
    if (highestRisk.level !== 'Low') {
      followUpActions.push('Patient education on warning signs');
      followUpActions.push('Emergency contact information provided');
    }
    
    return {
      nextVisit,
      requiredTests,
      referrals,
      followUpActions
    };
  }
  
  /**
   * COMPREHENSIVE CLINICAL ASSESSMENT
   */
  
  async performComprehensiveAssessment(patientId: number, currentData: any) {
    const [
      preeclampsiaRisk,
      pretermRisk,
      anemiaProtocol,
      hypertensionProtocol,
      carePathway
    ] = await Promise.all([
      this.assessPreeclampsiaRisk(currentData),
      this.assessPretermLaborRisk(currentData),
      Promise.resolve(this.getAnemiaProtocol(currentData.hemoglobin || 12, currentData.gestationalAge || 20)),
      Promise.resolve(this.getHypertensionProtocol(currentData.systolicBP || 120, currentData.diastolicBP || 80, currentData.gestationalAge || 20)),
      this.generateCarePathway(patientId, currentData)
    ]);
    
    return {
      riskAssessments: [preeclampsiaRisk, pretermRisk],
      treatmentProtocols: [anemiaProtocol, hypertensionProtocol].filter(p => p.medication !== 'No medication required'),
      carePathway,
      overallRiskLevel: Math.max(preeclampsiaRisk.score, pretermRisk.score) >= 5 ? 'High Risk' : 'Standard Risk'
    };
  }
}

export const advancedClinicalEngine = new AdvancedClinicalEngine();