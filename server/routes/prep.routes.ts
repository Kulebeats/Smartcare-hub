/**
 * PrEP API Routes
 * Endpoints for Pre-Exposure Prophylaxis management
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// In-memory storage for PrEP assessments
const prepAssessments = new Map();
const prepPrescriptions = new Map();
const prepFollowUps = new Map();

// Risk factors catalog
const RISK_FACTORS_CATALOG = {
  behavioral: [
    { id: 'inconsistent_condom', label: 'Inconsistent condom use', points: 3 },
    { id: 'multiple_partners', label: 'Multiple sexual partners', points: 3 },
    { id: 'recent_sti', label: 'Recent STI diagnosis', points: 2 },
    { id: 'sex_work', label: 'Transactional sex', points: 4 },
    { id: 'substance_use', label: 'Substance use during sex', points: 2 }
  ],
  partner: [
    { id: 'partner_hiv_positive', label: 'HIV positive partner', points: 5 },
    { id: 'partner_unknown_status', label: 'Partner status unknown', points: 2 },
    { id: 'partner_high_risk', label: 'Partner high-risk behaviors', points: 3 },
    { id: 'partner_not_on_art', label: 'Partner not on ART', points: 4 }
  ],
  pregnancy: [
    { id: 'trying_conceive', label: 'Trying to conceive with HIV+ partner', points: 5 },
    { id: 'pregnant_high_risk', label: 'Pregnant with ongoing risk', points: 4 },
    { id: 'breastfeeding_risk', label: 'Breastfeeding with ongoing risk', points: 3 }
  ]
};

/**
 * GET /api/prep/risk-factors
 * Get available risk factors for assessment
 */
router.get('/risk-factors', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: RISK_FACTORS_CATALOG
  });
});

/**
 * POST /api/prep/assessment
 * Create or update PrEP assessment for a patient
 */
router.post('/assessment', (req: Request, res: Response) => {
  const { patientId, encounterId, assessment } = req.body;
  
  if (!patientId || !assessment) {
    return res.status(400).json({
      success: false,
      error: 'Patient ID and assessment data are required'
    });
  }
  
  // Calculate risk score
  const riskScore = assessment.riskFactors?.reduce((sum: number, factor: any) => {
    if (factor.present) {
      return sum + (factor.points || 0);
    }
    return sum;
  }, 0) || 0;
  
  // Determine risk level
  let riskLevel = 'Low';
  if (riskScore >= 10) riskLevel = 'High';
  else if (riskScore >= 5) riskLevel = 'Moderate';
  
  // Check contraindications
  const contraindications = [];
  if (assessment.hivTestResult === 'positive') {
    contraindications.push('HIV positive - refer for ART');
  }
  if (assessment.acuteHivSymptoms?.length > 0) {
    contraindications.push('Acute HIV symptoms present');
  }
  if (assessment.creatinineClearance && assessment.creatinineClearance < 60) {
    contraindications.push('Renal impairment');
  }
  
  // Determine eligibility
  let eligibility = 'pending';
  if (contraindications.length > 0) {
    eligibility = contraindications.some(c => c.includes('HIV positive')) 
      ? 'ineligible' 
      : 'conditional';
  } else if (riskLevel !== 'Low') {
    eligibility = 'eligible';
  }
  
  // Store assessment
  const assessmentId = `prep-${patientId}-${Date.now()}`;
  const completeAssessment = {
    id: assessmentId,
    patientId,
    encounterId,
    ...assessment,
    riskScore,
    riskLevel,
    contraindications,
    eligibility,
    assessmentDate: new Date().toISOString(),
    recommendations: generateRecommendations(riskLevel, eligibility)
  };
  
  prepAssessments.set(assessmentId, completeAssessment);
  
  res.json({
    success: true,
    data: completeAssessment
  });
});

/**
 * GET /api/prep/assessment/:patientId
 * Get PrEP assessments for a patient
 */
router.get('/assessment/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  
  const assessments = Array.from(prepAssessments.values())
    .filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  
  res.json({
    success: true,
    data: assessments
  });
});

/**
 * POST /api/prep/prescription
 * Create PrEP prescription
 */
router.post('/prescription', (req: Request, res: Response) => {
  const { patientId, assessmentId, prescription } = req.body;
  
  if (!patientId || !prescription) {
    return res.status(400).json({
      success: false,
      error: 'Patient ID and prescription data are required'
    });
  }
  
  // Verify eligibility from assessment
  const assessment = prepAssessments.get(assessmentId);
  if (assessment && assessment.eligibility === 'ineligible') {
    return res.status(400).json({
      success: false,
      error: 'Patient is not eligible for PrEP'
    });
  }
  
  const prescriptionId = `prep-rx-${patientId}-${Date.now()}`;
  const completePrescription = {
    id: prescriptionId,
    patientId,
    assessmentId,
    ...prescription,
    prescribedDate: new Date().toISOString(),
    status: 'active'
  };
  
  prepPrescriptions.set(prescriptionId, completePrescription);
  
  res.json({
    success: true,
    data: completePrescription
  });
});

/**
 * GET /api/prep/prescription/:patientId
 * Get PrEP prescriptions for a patient
 */
router.get('/prescription/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  
  const prescriptions = Array.from(prepPrescriptions.values())
    .filter(p => p.patientId === patientId)
    .sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime());
  
  res.json({
    success: true,
    data: prescriptions
  });
});

/**
 * POST /api/prep/follow-up
 * Record PrEP follow-up visit
 */
router.post('/follow-up', (req: Request, res: Response) => {
  const { patientId, prescriptionId, followUp } = req.body;
  
  if (!patientId || !followUp) {
    return res.status(400).json({
      success: false,
      error: 'Patient ID and follow-up data are required'
    });
  }
  
  const followUpId = `prep-fu-${patientId}-${Date.now()}`;
  const completeFollowUp = {
    id: followUpId,
    patientId,
    prescriptionId,
    ...followUp,
    visitDate: followUp.visitDate || new Date().toISOString(),
    adherenceScore: calculateAdherence(followUp)
  };
  
  prepFollowUps.set(followUpId, completeFollowUp);
  
  res.json({
    success: true,
    data: completeFollowUp
  });
});

/**
 * GET /api/prep/follow-up/:patientId
 * Get PrEP follow-up visits for a patient
 */
router.get('/follow-up/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  
  const followUps = Array.from(prepFollowUps.values())
    .filter(f => f.patientId === patientId)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  
  res.json({
    success: true,
    data: followUps
  });
});

/**
 * GET /api/prep/eligibility/:patientId
 * Quick eligibility check based on latest assessment
 */
router.get('/eligibility/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  
  const assessments = Array.from(prepAssessments.values())
    .filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  
  if (assessments.length === 0) {
    return res.json({
      success: true,
      data: {
        eligible: false,
        reason: 'No assessment found',
        requiresAssessment: true
      }
    });
  }
  
  const latest = assessments[0];
  
  res.json({
    success: true,
    data: {
      eligible: latest.eligibility === 'eligible',
      eligibility: latest.eligibility,
      riskLevel: latest.riskLevel,
      contraindications: latest.contraindications,
      lastAssessmentDate: latest.assessmentDate,
      recommendations: latest.recommendations
    }
  });
});

/**
 * GET /api/prep/statistics
 * Get PrEP program statistics
 */
router.get('/statistics', (req: Request, res: Response) => {
  const allAssessments = Array.from(prepAssessments.values());
  const allPrescriptions = Array.from(prepPrescriptions.values());
  const allFollowUps = Array.from(prepFollowUps.values());
  
  const stats = {
    totalAssessments: allAssessments.length,
    totalPrescriptions: allPrescriptions.length,
    totalFollowUps: allFollowUps.length,
    eligibilityBreakdown: {
      eligible: allAssessments.filter(a => a.eligibility === 'eligible').length,
      ineligible: allAssessments.filter(a => a.eligibility === 'ineligible').length,
      conditional: allAssessments.filter(a => a.eligibility === 'conditional').length,
      pending: allAssessments.filter(a => a.eligibility === 'pending').length
    },
    riskLevelBreakdown: {
      high: allAssessments.filter(a => a.riskLevel === 'High').length,
      moderate: allAssessments.filter(a => a.riskLevel === 'Moderate').length,
      low: allAssessments.filter(a => a.riskLevel === 'Low').length
    },
    activePrescriptions: allPrescriptions.filter(p => p.status === 'active').length,
    averageAdherence: calculateAverageAdherence(allFollowUps)
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Helper functions
function generateRecommendations(riskLevel: string, eligibility: string): string[] {
  const recommendations = [];
  
  if (eligibility === 'eligible') {
    switch (riskLevel) {
      case 'High':
        recommendations.push('Immediate PrEP initiation recommended');
        recommendations.push('Monthly follow-up for first 3 months');
        recommendations.push('Intensive adherence counseling');
        break;
      case 'Moderate':
        recommendations.push('PrEP initiation recommended');
        recommendations.push('Quarterly follow-up visits');
        recommendations.push('Standard adherence counseling');
        break;
      case 'Low':
        recommendations.push('PrEP available based on patient preference');
        recommendations.push('Focus on risk reduction counseling');
        break;
    }
  } else if (eligibility === 'conditional') {
    recommendations.push('Address contraindications before PrEP initiation');
    recommendations.push('Consider specialist consultation');
  } else if (eligibility === 'ineligible') {
    recommendations.push('PrEP not appropriate at this time');
    recommendations.push('Provide alternative prevention strategies');
  }
  
  recommendations.push('Provide condoms and education');
  recommendations.push('Regular HIV testing');
  
  return recommendations;
}

function calculateAdherence(followUp: any): number {
  if (!followUp.pillsMissed || !followUp.pillsDispensed) {
    return 100;
  }
  
  const adherence = ((followUp.pillsDispensed - followUp.pillsMissed) / followUp.pillsDispensed) * 100;
  return Math.round(adherence);
}

function calculateAverageAdherence(followUps: any[]): number {
  if (followUps.length === 0) return 0;
  
  const totalAdherence = followUps.reduce((sum, f) => sum + (f.adherenceScore || 0), 0);
  return Math.round(totalAdherence / followUps.length);
}

export default router;