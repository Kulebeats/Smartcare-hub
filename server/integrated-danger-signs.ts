/**
 * Integrated Danger Signs Service for SmartCare PRO
 * Enhanced clinical decision support directly within the ANC system
 */

// WHO-compliant danger signs evaluation
const evaluateDangerSigns = (facts: Record<string, any>) => {
  const alerts = [];

  // Severe Hypertension Check
  if (facts.systolicBP >= 160 || facts.diastolicBP >= 110) {
    alerts.push({
      type: 'severe-hypertension',
      severity: 'Red',
      category: 'Cardiovascular',
      message: 'Severe hypertension detected - immediate medical attention required',
      urgency: 'Critical',
      referralRequired: true,
      riskScore: 10
    });
  }

  // Pre-eclampsia Check
  if (facts.systolicBP >= 140 && ['2+', '3+', '4+'].includes(facts.urineProtein)) {
    alerts.push({
      type: 'preeclampsia',
      severity: 'Orange',
      category: 'Maternal',
      message: 'Pre-eclampsia risk detected - monitor closely and consider referral',
      urgency: 'High',
      referralRequired: true,
      riskScore: 8
    });
  }

  // Severe Anemia Check
  if (facts.hemoglobin && facts.hemoglobin < 7) {
    alerts.push({
      type: 'severe-anemia',
      severity: 'Red',
      category: 'Hematological',
      message: 'Severe anemia detected - immediate treatment required',
      urgency: 'Critical',
      referralRequired: true,
      riskScore: 9
    });
  }

  // Respiratory Distress Check
  if (facts.oxygenSaturation < 90 || facts.respiratoryRate > 30) {
    alerts.push({
      type: 'respiratory-distress',
      severity: 'Red',
      category: 'Respiratory',
      message: 'Respiratory distress detected - immediate intervention required',
      urgency: 'Critical',
      referralRequired: true,
      riskScore: 10
    });
  }

  // Fetal Distress Check
  if (facts.fetalHeartRate && (facts.fetalHeartRate < 110 || facts.fetalHeartRate > 160)) {
    alerts.push({
      type: 'fetal-distress',
      severity: 'Orange',
      category: 'Fetal',
      message: 'Fetal heart rate abnormality detected - assess fetal wellbeing',
      urgency: 'High',
      referralRequired: true,
      riskScore: 7
    });
  }

  // Moderate Anemia Check
  if (facts.hemoglobin && facts.hemoglobin >= 7 && facts.hemoglobin < 10) {
    alerts.push({
      type: 'moderate-anemia',
      severity: 'Yellow',
      category: 'Hematological',
      message: 'Moderate anemia detected - iron supplementation recommended',
      urgency: 'Medium',
      referralRequired: false,
      riskScore: 3
    });
  }

  // Hypertension (not severe) Check
  if (facts.systolicBP >= 140 && facts.systolicBP < 160 && 
      facts.diastolicBP >= 90 && facts.diastolicBP < 110) {
    alerts.push({
      type: 'hypertension',
      severity: 'Yellow',
      category: 'Cardiovascular',
      message: 'Elevated blood pressure - monitor and repeat measurement',
      urgency: 'Medium',
      referralRequired: false,
      riskScore: 4
    });
  }

  return alerts;
};

export const integratedDangerSignsService = {
  async evaluateSingleField(data: {
    patientId: string;
    field: string;
    value: any;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    const facts = {
      [data.field]: data.value,
      ...data.context
    };

    const alertResults = evaluateDangerSigns(facts);
    
    const alerts = alertResults.map(alert => ({
      id: `${Date.now()}-${Math.random()}`,
      severity: alert.severity,
      category: alert.category,
      message: alert.message,
      urgency: alert.urgency,
      referralRequired: alert.referralRequired,
      riskScore: alert.riskScore,
      timestamp: new Date().toISOString(),
      patientId: data.patientId,
      triggerField: data.field,
      triggerValue: data.value
    }));

    return {
      alertCount: alerts.length,
      alerts,
      riskScore: alerts.reduce((sum, alert) => sum + alert.riskScore, 0),
      summary: {
        red: alerts.filter(a => a.severity === 'Red').length,
        orange: alerts.filter(a => a.severity === 'Orange').length,
        yellow: alerts.filter(a => a.severity === 'Yellow').length
      }
    };
  },

  async evaluateBulkSymptoms(data: {
    patientId: string;
    symptoms: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    const alertResults = evaluateDangerSigns(data.symptoms);
    
    const alerts = alertResults.map(alert => ({
      id: `${Date.now()}-${Math.random()}`,
      severity: alert.severity,
      category: alert.category,
      message: alert.message,
      urgency: alert.urgency,
      referralRequired: alert.referralRequired,
      riskScore: alert.riskScore,
      timestamp: new Date().toISOString(),
      patientId: data.patientId,
      triggerData: data.symptoms
    }));

    return {
      alertCount: alerts.length,
      alerts,
      riskScore: alerts.reduce((sum, alert) => sum + alert.riskScore, 0),
      summary: {
        red: alerts.filter(a => a.severity === 'Red').length,
        orange: alerts.filter(a => a.severity === 'Orange').length,
        yellow: alerts.filter(a => a.severity === 'Yellow').length
      }
    };
  },

  async getAvailableCategories() {
    return {
      categories: ['Cardiovascular', 'Maternal', 'Hematological', 'Respiratory', 'Fetal'],
      counts: {
        total: 7,
        red: 3,
        orange: 2,
        yellow: 2
      }
    };
  },

  async getServiceHealth() {
    return {
      status: 'healthy',
      rulesLoaded: 7,
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      integrated: true
    };
  }
};