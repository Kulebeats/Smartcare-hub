# SmartCare PRO - Clinical Decision Support System (CDSS) Comprehensive Documentation

## Overview

The Clinical Decision Support System (CDSS) in SmartCare PRO provides real-time, evidence-based clinical guidance to healthcare providers throughout the patient care workflow. It integrates WHO guidelines, CDC recommendations, and Zambian healthcare protocols to deliver contextual, actionable clinical recommendations.

**Current Version:** 1.8.3  
**Evidence Base:** WHO Guidelines, CDC Recommendations, Zambian Clinical Guidelines 2023  
**Integration Pattern:** Form trigger-based with completion-based modal alerts  

## CDSS Architecture

### Core Components
```typescript
interface CDSSEngine {
  ruleEngine: CDSSRuleEngine;
  alertSystem: CDSSAlertSystem;
  evidenceBase: EvidenceDatabase;
  userInterface: CDSSUserInterface;
}

interface CDSSRule {
  id: string;
  name: string;
  category: 'emergency' | 'warning' | 'recommendation' | 'info';
  condition: (data: ClinicalData) => boolean;
  recommendation: CDSSRecommendation;
  priority: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
  lastUpdated: string;
}
```

### CDSS Trigger System
- **Form Completion Triggers** - Alerts appear after 80% form completion
- **Real-time Evaluation** - Continuous monitoring of clinical data entry
- **Risk Threshold Triggers** - Automatic alerts for critical values
- **Progressive Disclosure** - Context-aware recommendation display

## CDSS Implementation by Module

### 1. ANC Module CDSS Integration

#### Dynamic Alert Modal System
```typescript
// Real-time clinical decision support
interface ANCCDSSAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recommendations: CDSSRecommendation[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
  priority: number;
}

// React Portal rendering for high-priority alerts
const CDSSAlertPortal: React.FC<{ alert: ANCCDSSAlert }> = ({ alert }) => {
  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className={`border-l-4 p-4 ${getBorderColor(alert.type)}`}>
            <h2 className="text-xl font-bold mb-2 text-red-600">
              {alert.title}
            </h2>
            <p className="text-gray-700 mb-4">{alert.message}</p>
            <div className="space-y-2">
              {alert.recommendations.map((rec, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <ul className="mt-2 text-sm">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {action.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Evidence Level: {alert.evidenceLevel} | 
              References: {alert.references.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

#### Form Trigger-Based CDSS
```typescript
// Completion-based modal triggers for ANC sections
const useANCCDSSTriggering = (formData: ANCFormData, section: ANCSection) => {
  const [showCDSSModal, setShowCDSSModal] = useState(false);
  const [cdssAlert, setCDSSAlert] = useState<ANCCDSSAlert | null>(null);

  useEffect(() => {
    const completionRate = calculateFormCompletion(formData);
    
    if (completionRate >= 0.8) { // 80% completion threshold
      const applicableRules = evaluateCDSSRules(formData, section);
      
      if (applicableRules.length > 0) {
        const highestPriorityRule = applicableRules[0];
        setCDSSAlert({
          type: highestPriorityRule.category,
          title: `Clinical Decision Support - ${section}`,
          message: highestPriorityRule.recommendation.description,
          recommendations: [highestPriorityRule.recommendation],
          evidenceLevel: highestPriorityRule.evidenceLevel,
          references: highestPriorityRule.references,
          priority: highestPriorityRule.priority
        });
        setShowCDSSModal(true);
      }
    }
  }, [formData, section]);

  return { showCDSSModal, cdssAlert, setShowCDSSModal };
};
```

#### ANC-Specific CDSS Rules
```typescript
const ancCDSSRules: CDSSRule[] = [
  {
    id: 'anc_danger_signs_emergency',
    name: 'ANC Danger Signs - Emergency Referral',
    category: 'emergency',
    condition: (data: ANCData) => {
      const dangerSigns = ['severe_headache', 'blurred_vision', 'convulsions', 'severe_abdominal_pain'];
      return dangerSigns.some(sign => data.dangerSigns?.includes(sign));
    },
    recommendation: {
      title: 'EMERGENCY: Immediate Referral Required',
      description: 'Patient presents with danger signs requiring immediate referral to higher-level facility.',
      actions: [
        { type: 'urgent_referral', description: 'Arrange immediate transport to referral facility' },
        { type: 'stabilization', description: 'Provide supportive care during transport' },
        { type: 'communication', description: 'Contact receiving facility to alert them' }
      ]
    },
    priority: 1,
    evidenceLevel: 'A',
    references: ['WHO ANC Guidelines 2016', 'Zambian National ANC Standards'],
    lastUpdated: '2025-07-30'
  },
  {
    id: 'anc_hiv_positive_pmtct',
    name: 'HIV Positive - PMTCT Initiation',
    category: 'warning',
    condition: (data: ANCData) => {
      return data.laboratoryData?.hivTesting?.result === 'reactive' && 
             !data.pmtctData?.artStatus;
    },
    recommendation: {
      title: 'HIV Positive - Initiate PMTCT Protocols',
      description: 'Patient has tested HIV positive and requires immediate PMTCT initiation.',
      actions: [
        { type: 'pmtct_initiation', description: 'Open PMTCT module and complete assessment' },
        { type: 'art_evaluation', description: 'Assess ART eligibility and initiate if appropriate' },
        { type: 'partner_testing', description: 'Counsel on partner testing and disclosure' },
        { type: 'followup_schedule', description: 'Schedule appropriate follow-up visits' }
      ]
    },
    priority: 2,
    evidenceLevel: 'A',
    references: ['WHO PMTCT Guidelines 2021', 'Zambian ART Guidelines'],
    lastUpdated: '2025-07-30'
  },
  {
    id: 'anc_hypertension_monitoring',
    name: 'Hypertension - Enhanced Monitoring',
    category: 'warning',
    condition: (data: ANCData) => {
      const systolic = data.examinationData?.vitalSigns?.bloodPressure?.systolic;
      const diastolic = data.examinationData?.vitalSigns?.bloodPressure?.diastolic;
      return (systolic >= 140 || diastolic >= 90);
    },
    recommendation: {
      title: 'Hypertension Detected - Enhanced Monitoring Required',
      description: 'Elevated blood pressure requires additional monitoring and assessment.',
      actions: [
        { type: 'bp_recheck', description: 'Recheck blood pressure after 15 minutes rest' },
        { type: 'preeclampsia_screen', description: 'Screen for preeclampsia signs and symptoms' },
        { type: 'urine_protein', description: 'Test urine for protein if not already done' },
        { type: 'frequent_visits', description: 'Schedule more frequent ANC visits' }
      ]
    },
    priority: 3,
    evidenceLevel: 'A',
    references: ['WHO Hypertension Guidelines', 'ISSHP Guidelines'],
    lastUpdated: '2025-07-30'
  }
];
```

### 2. PrEP Module CDSS Integration

#### Risk-Based CDSS Alerts
```typescript
// PrEP risk assessment CDSS
const prepCDSSRules: CDSSRule[] = [
  {
    id: 'prep_high_risk_initiation',
    name: 'High Risk PrEP Candidate',
    category: 'recommendation',
    condition: (data: PrEPData) => {
      return calculatePrEPRiskScore(data) >= 10; // High risk threshold
    },
    recommendation: {
      title: 'High Risk - PrEP Initiation Recommended',
      description: 'Patient meets criteria for PrEP initiation based on high HIV acquisition risk.',
      actions: [
        { type: 'prep_counseling', description: 'Provide comprehensive PrEP counseling' },
        { type: 'baseline_tests', description: 'Order baseline laboratory tests' },
        { type: 'prep_prescription', description: 'Consider PrEP prescription if eligible' },
        { type: 'followup_schedule', description: 'Schedule 1-month follow-up visit' }
      ]
    },
    priority: 4,
    evidenceLevel: 'A',
    references: ['WHO PrEP Guidelines 2022', 'CDC PrEP Guidelines', 'Zambian CG 2023'],
    lastUpdated: '2025-07-30'
  },
  {
    id: 'prep_pregnancy_considerations',
    name: 'PrEP in Pregnancy - Special Considerations',
    category: 'info',
    condition: (data: PrEPData) => {
      return data.clientProfile?.isPregnant === true;
    },
    recommendation: {
      title: 'PrEP in Pregnancy - Special Considerations',
      description: 'Pregnant women require special considerations for PrEP initiation.',
      actions: [
        { type: 'tdf_ftc_preferred', description: 'TDF/FTC is preferred regimen in pregnancy' },
        { type: 'frequent_monitoring', description: 'Enhanced monitoring for renal function' },
        { type: 'pmtct_coordination', description: 'Coordinate with PMTCT services if HIV positive partner' },
        { type: 'obstetric_followup', description: 'Ensure regular obstetric follow-up' }
      ]
    },
    priority: 5,
    evidenceLevel: 'B',
    references: ['WHO PrEP Guidelines 2022', 'Zambian CG 2023'],
    lastUpdated: '2025-07-30'
  }
];
```

#### Dynamic Modal Triggering for PrEP
```typescript
// Progressive disclosure and modal triggering
const usePrEPCDSSSystem = (assessmentData: PrEPAssessmentData) => {
  const [showDynamicAlert, setShowDynamicAlert] = useState(false);
  const [alertContent, setAlertContent] = useState<CDSSAlert | null>(null);

  const triggerModalOnce = useRef(false);

  useEffect(() => {
    const completionStatus = validateAssessmentCompletion(assessmentData);
    
    if (completionStatus.isComplete && !triggerModalOnce.current) {
      const riskScore = calculatePrEPRiskScore(assessmentData);
      const applicableRules = prepCDSSRules.filter(rule => 
        rule.condition(assessmentData)
      );

      if (applicableRules.length > 0) {
        const alert = generateDynamicAlert(applicableRules, riskScore);
        setAlertContent(alert);
        setShowDynamicAlert(true);
        triggerModalOnce.current = true;
      }
    }
  }, [assessmentData]);

  return { showDynamicAlert, alertContent, setShowDynamicAlert };
};
```

### 3. PMTCT Module CDSS Integration

#### WHO Stage-Based Recommendations
```typescript
const pmtctCDSSRules: CDSSRule[] = [
  {
    id: 'pmtct_who_stage_3_4',
    name: 'WHO Stage 3/4 - Immediate ART',
    category: 'critical',
    condition: (data: PMTCTData) => {
      return data.whoStaging?.stage >= 3;
    },
    recommendation: {
      title: 'WHO Stage 3/4 - Immediate ART Initiation Required',
      description: 'Patient has WHO Stage 3 or 4 disease requiring immediate ART initiation.',
      actions: [
        { type: 'immediate_art', description: 'Initiate ART immediately regardless of CD4 count' },
        { type: 'oi_treatment', description: 'Treat any opportunistic infections' },
        { type: 'specialist_referral', description: 'Consider referral to HIV specialist' },
        { type: 'close_monitoring', description: 'Schedule weekly visits initially' }
      ]
    },
    priority: 1,
    evidenceLevel: 'A',
    references: ['WHO HIV Guidelines 2021', 'Zambian ART Guidelines'],
    lastUpdated: '2025-07-30'
  },
  {
    id: 'pmtct_tpt_eligible',
    name: 'TPT Eligibility Assessment',
    category: 'recommendation',
    condition: (data: PMTCTData) => {
      return data.tptData?.tbScreening?.screeningResult === 'negative' && 
             !data.tptData?.tptStatus?.status;
    },
    recommendation: {
      title: 'TB Preventive Treatment (TPT) Eligible',
      description: 'Patient has negative TB screening and is eligible for TPT initiation.',
      actions: [
        { type: 'tpt_counseling', description: 'Provide TPT counseling and education' },
        { type: 'regimen_selection', description: 'Select appropriate TPT regimen (3HP preferred)' },
        { type: 'baseline_tests', description: 'Order baseline liver function tests if indicated' },
        { type: 'tpt_initiation', description: 'Initiate TPT if no contraindications' }
      ]
    },
    priority: 3,
    evidenceLevel: 'A',
    references: ['WHO TPT Guidelines 2020', 'Zambian TB Guidelines'],
    lastUpdated: '2025-07-30'
  }
];
```

### 4. Pharmacy Module CDSS Integration

#### Drug Interaction Alerts
```typescript
const pharmacyCDSSRules: CDSSRule[] = [
  {
    id: 'drug_interaction_critical',
    name: 'Critical Drug Interaction',
    category: 'critical',
    condition: (data: PharmacyData) => {
      return checkCriticalInteractions(data.prescriptions);
    },
    recommendation: {
      title: 'CRITICAL: Drug Interaction Detected',
      description: 'Potentially dangerous drug interaction identified in prescription.',
      actions: [
        { type: 'interaction_review', description: 'Review specific drug interactions' },
        { type: 'alternative_therapy', description: 'Consider alternative medications' },
        { type: 'dose_adjustment', description: 'Adjust doses if interaction unavoidable' },
        { type: 'enhanced_monitoring', description: 'Implement enhanced patient monitoring' }
      ]
    },
    priority: 1,
    evidenceLevel: 'A',
    references: ['Drug Interaction Database', 'Clinical Pharmacology Guidelines'],
    lastUpdated: '2025-07-30'
  },
  {
    id: 'pregnancy_category_warning',
    name: 'Pregnancy Safety Warning',
    category: 'warning',
    condition: (data: PharmacyData) => {
      return data.patientProfile?.isPregnant && 
             hasPregnancyRiskMedications(data.prescriptions);
    },
    recommendation: {
      title: 'Pregnancy Safety Consideration',
      description: 'Prescribed medication requires special consideration in pregnancy.',
      actions: [
        { type: 'risk_assessment', description: 'Assess pregnancy risk category' },
        { type: 'benefit_risk', description: 'Evaluate benefit vs. risk' },
        { type: 'alternative_options', description: 'Consider safer alternatives' },
        { type: 'informed_consent', description: 'Obtain informed consent if proceeding' }
      ]
    },
    priority: 2,
    evidenceLevel: 'A',
    references: ['FDA Pregnancy Categories', 'Teratology Guidelines'],
    lastUpdated: '2025-07-30'
  }
];
```

## CDSS Rule Engine Implementation

### Rule Evaluation Engine
```typescript
class CDSSRuleEngine {
  private rules: Map<string, CDSSRule[]> = new Map();
  
  constructor() {
    this.loadRules();
  }

  private loadRules(): void {
    this.rules.set('anc', ancCDSSRules);
    this.rules.set('prep', prepCDSSRules);
    this.rules.set('pmtct', pmtctCDSSRules);
    this.rules.set('pharmacy', pharmacyCDSSRules);
  }

  evaluateRules(module: string, data: ClinicalData): CDSSRecommendation[] {
    const moduleRules = this.rules.get(module) || [];
    
    const applicableRules = moduleRules
      .filter(rule => rule.condition(data))
      .sort((a, b) => a.priority - b.priority); // Higher priority first

    return applicableRules.map(rule => ({
      ...rule.recommendation,
      ruleId: rule.id,
      category: rule.category,
      evidenceLevel: rule.evidenceLevel,
      references: rule.references
    }));
  }

  // Real-time evaluation for form-based triggers
  evaluateOnFormCompletion(
    module: string,
    formData: FormData, 
    completionThreshold: number = 0.8
  ): CDSSRecommendation[] {
    const completionRate = this.calculateCompletionRate(formData);
    
    if (completionRate >= completionThreshold) {
      return this.evaluateRules(module, formData as ClinicalData);
    }

    return [];
  }

  private calculateCompletionRate(formData: FormData): number {
    const totalFields = Object.keys(formData).length;
    const completedFields = Object.values(formData).filter(
      value => value !== null && value !== undefined && value !== ''
    ).length;

    return totalFields > 0 ? completedFields / totalFields : 0;
  }
}
```

### Alert Prioritization System
```typescript
interface AlertPriority {
  category: 'critical' | 'warning' | 'recommendation' | 'info';
  priority: number;
  color: string;
  icon: string;
  action: 'block' | 'warn' | 'inform';
}

const alertPriorities: Record<string, AlertPriority> = {
  critical: {
    category: 'critical',
    priority: 1,
    color: 'red',
    icon: 'AlertTriangle',
    action: 'block'
  },
  warning: {
    category: 'warning',
    priority: 2,
    color: 'yellow',
    icon: 'AlertCircle',
    action: 'warn'
  },
  recommendation: {
    category: 'recommendation',
    priority: 3,
    color: 'blue',
    icon: 'Info',
    action: 'inform'
  },
  info: {
    category: 'info',
    priority: 4,
    color: 'gray',
    icon: 'MessageCircle',
    action: 'inform'
  }
};

const prioritizeAlerts = (alerts: CDSSAlert[]): CDSSAlert[] => {
  return alerts.sort((a, b) => {
    const priorityA = alertPriorities[a.type]?.priority || 999;
    const priorityB = alertPriorities[b.type]?.priority || 999;
    return priorityA - priorityB;
  });
};
```

## Evidence-Based Recommendations

### WHO Guidelines Integration
```typescript
interface WHOGuideline {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  recommendations: WHORecommendation[];
}

interface WHORecommendation {
  id: string;
  title: string;
  description: string;
  strength: 'strong' | 'conditional';
  quality: 'high' | 'moderate' | 'low' | 'very_low';
  population: string;
  intervention: string;
  outcome: string;
}

const whoGuidelines: WHOGuideline[] = [
  {
    id: 'who_anc_2016',
    title: 'WHO recommendations on antenatal care for a positive pregnancy experience',
    version: '2016',
    lastUpdated: '2016-11-01',
    recommendations: [
      {
        id: 'anc_visits_8',
        title: 'Eight contacts model for ANC',
        description: 'A minimum of eight contacts is recommended to reduce perinatal mortality and improve women\'s experience of care.',
        strength: 'strong',
        quality: 'moderate',
        population: 'pregnant_women',
        intervention: 'anc_visits',
        outcome: 'perinatal_mortality'
      }
    ]
  }
];
```

### Zambian Clinical Guidelines Integration
```typescript
const zambianGuidelines = {
  prep_2023: {
    preferredRegimen: 'TDF/FTC 300/200mg',
    alternativeRegimen: 'TDF/3TC 300/300mg',
    contraindications: ['creatinine_clearance_below_60', 'active_hepatitis_b'],
    monitoring: {
      baseline: ['hiv_test', 'creatinine', 'hbsag'],
      followup: ['hiv_test_3months', 'creatinine_6months']
    }
  },
  art_2023: {
    firstLine: 'TLD (TDF/3TC/DTG)',
    pregnancyRegimen: 'TLE (TDF/3TC/EFV)',
    monitoring: {
      baseline: ['cd4', 'viral_load', 'creatinine'],
      followup: ['viral_load_6months', 'cd4_annual']
    }
  }
};
```

## Performance and Optimization

### CDSS Performance Metrics
```typescript
interface CDSSMetrics {
  alertTriggerTime: number; // milliseconds
  ruleEvaluationTime: number; // milliseconds
  userResponseTime: number; // milliseconds
  alertAcceptanceRate: number; // percentage
  overrideRate: number; // percentage
}

const cdssPerformanceMonitoring = {
  measureAlertTriggerTime: (startTime: number, endTime: number) => {
    const triggerTime = endTime - startTime;
    if (triggerTime > 100) { // Alert if over 100ms
      console.warn(`CDSS alert trigger time: ${triggerTime}ms (>100ms threshold)`);
    }
    return triggerTime;
  },

  trackUserResponse: (alertId: string, action: 'accept' | 'override' | 'dismiss') => {
    // Track user responses for system improvement
    analytics.track('cdss_user_response', {
      alertId,
      action,
      timestamp: new Date().toISOString()
    });
  }
};
```

### Caching Strategy for CDSS
```typescript
// Cache frequently accessed CDSS rules and recommendations
const cdssCache = new Map<string, CDSSRecommendation[]>();

const getCachedRecommendations = async (
  cacheKey: string,
  generator: () => Promise<CDSSRecommendation[]>
): Promise<CDSSRecommendation[]> => {
  if (cdssCache.has(cacheKey)) {
    return cdssCache.get(cacheKey)!;
  }

  const recommendations = await generator();
  cdssCache.set(cacheKey, recommendations);
  
  // Cache for 5 minutes
  setTimeout(() => {
    cdssCache.delete(cacheKey);
  }, 5 * 60 * 1000);

  return recommendations;
};
```

## User Interface Integration

### CDSS Modal Components
```typescript
// Main CDSS Alert Modal
const CDSSAlertModal: React.FC<CDSSAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAccept,
  onOverride
}) => {
  const priority = alertPriorities[alert.type];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className={`flex items-center space-x-2 text-${priority.color}-600`}>
            <LucideIcon name={priority.icon} className="w-6 h-6" />
            <DialogTitle>{alert.title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-700">{alert.message}</p>
          
          {alert.recommendations.map((rec, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
              <ul className="space-y-1">
                {rec.actions.map((action, actionIndex) => (
                  <li key={actionIndex} className="flex items-start text-sm">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{action.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>Evidence Level: {alert.evidenceLevel}</p>
            <p>References: {alert.references.join(', ')}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onOverride}>
            Override
          </Button>
          <Button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
            Accept Recommendation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Integration with Clinical Workflows
```typescript
// CDSS Integration Hook
const useCDSSIntegration = (module: string, data: ClinicalData) => {
  const [activeAlerts, setActiveAlerts] = useState<CDSSAlert[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const cdssEngine = useRef(new CDSSRuleEngine());

  useEffect(() => {
    const recommendations = cdssEngine.current.evaluateRules(module, data);
    
    if (recommendations.length > 0) {
      const alerts = recommendations.map(rec => ({
        type: rec.category as 'critical' | 'warning' | 'recommendation' | 'info',
        title: rec.title,
        message: rec.description,
        recommendations: [rec],
        evidenceLevel: rec.evidenceLevel,
        references: rec.references
      }));
      
      setActiveAlerts(prioritizeAlerts(alerts));
      setShowAlert(true);
    }
  }, [module, data]);

  return {
    activeAlerts,
    showAlert,
    setShowAlert,
    hasActiveAlerts: activeAlerts.length > 0
  };
};
```

This comprehensive CDSS documentation provides complete implementation details for evidence-based clinical decision support throughout SmartCare PRO, ensuring healthcare providers receive timely, relevant, and actionable clinical guidance based on international best practices and local guidelines.