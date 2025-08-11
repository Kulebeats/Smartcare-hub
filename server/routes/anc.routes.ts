/**
 * ANC Module API Routes
 * Handles all ANC-related backend operations
 * Using in-memory storage for development
 */

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for development
const ancStorage = {
  encounters: new Map<string, any>(),
  vitals: new Map<string, any>(),
  labs: new Map<string, any>(),
  alerts: new Map<string, any>(),
  referrals: new Map<string, any>()
};

// Helper to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============= ENCOUNTER ENDPOINTS =============

/**
 * GET /api/anc/encounters/:patientId
 * Get all ANC encounters for a patient
 */
router.get('/encounters/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const encounters = Array.from(ancStorage.encounters.values())
      .filter(e => e.patientId === patientId)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    
    res.json(encounters);
  } catch (error) {
    console.error('Error fetching ANC encounters:', error);
    res.status(500).json({ error: 'Failed to fetch encounters' });
  }
});

/**
 * GET /api/anc/encounter/:encounterId
 * Get a specific ANC encounter
 */
router.get('/encounter/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    const encounter = ancStorage.encounters.get(encounterId);
    
    if (!encounter) {
      return res.status(404).json({ error: 'Encounter not found' });
    }
    
    res.json(encounter);
  } catch (error) {
    console.error('Error fetching encounter:', error);
    res.status(500).json({ error: 'Failed to fetch encounter' });
  }
});

/**
 * POST /api/anc/encounter
 * Create a new ANC encounter
 */
router.post('/encounter', async (req: Request, res: Response) => {
  try {
    const encounterData = req.body;
    
    if (!encounterData.patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }
    
    const encounterId = generateId();
    const newEncounter = {
      id: encounterId,
      ...encounterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ancStorage.encounters.set(encounterId, newEncounter);
    res.status(201).json(newEncounter);
  } catch (error) {
    console.error('Error creating encounter:', error);
    res.status(500).json({ error: 'Failed to create encounter' });
  }
});

/**
 * PATCH /api/anc/encounter/:encounterId
 * Update an existing ANC encounter
 */
router.patch('/encounter/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    const updates = req.body;
    
    const encounter = ancStorage.encounters.get(encounterId);
    if (!encounter) {
      return res.status(404).json({ error: 'Encounter not found' });
    }
    
    const updated = {
      ...encounter,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    ancStorage.encounters.set(encounterId, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating encounter:', error);
    res.status(500).json({ error: 'Failed to update encounter' });
  }
});

// ============= VITAL SIGNS ENDPOINTS =============

/**
 * GET /api/anc/vitals/:encounterId
 * Get vital signs for an encounter
 */
router.get('/vitals/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    
    const vitals = Array.from(ancStorage.vitals.values())
      .filter(v => v.encounterId === encounterId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    
    res.json(vitals);
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    res.status(500).json({ error: 'Failed to fetch vital signs' });
  }
});

/**
 * POST /api/anc/vitals/:encounterId
 * Record vital signs for an encounter
 */
router.post('/vitals/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    const vitalsData = req.body;
    
    const vitalsId = generateId();
    const newVitals = {
      id: vitalsId,
      encounterId,
      ...vitalsData,
      recordedAt: new Date().toISOString()
    };
    
    ancStorage.vitals.set(vitalsId, newVitals);
    res.status(201).json(newVitals);
  } catch (error) {
    console.error('Error recording vital signs:', error);
    res.status(500).json({ error: 'Failed to record vital signs' });
  }
});

// ============= LAB RESULTS ENDPOINTS =============

/**
 * GET /api/anc/labs/:encounterId
 * Get lab results for an encounter
 */
router.get('/labs/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    
    const labs = Array.from(ancStorage.labs.values())
      .filter(l => l.encounterId === encounterId)
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
    
    res.json(labs);
  } catch (error) {
    console.error('Error fetching lab results:', error);
    res.status(500).json({ error: 'Failed to fetch lab results' });
  }
});

/**
 * POST /api/anc/labs/:encounterId
 * Record lab results for an encounter
 */
router.post('/labs/:encounterId', async (req: Request, res: Response) => {
  try {
    const { encounterId } = req.params;
    const labData = req.body;
    
    const labId = generateId();
    const newLab = {
      id: labId,
      encounterId,
      ...labData,
      enteredAt: new Date().toISOString()
    };
    
    ancStorage.labs.set(labId, newLab);
    res.status(201).json(newLab);
  } catch (error) {
    console.error('Error recording lab results:', error);
    res.status(500).json({ error: 'Failed to record lab results' });
  }
});

// ============= CLINICAL ALERTS ENDPOINTS =============

/**
 * GET /api/anc/alerts/:patientId
 * Get clinical alerts for a patient
 */
router.get('/alerts/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const alerts = Array.from(ancStorage.alerts.values())
      .filter(a => a.patientId === patientId && a.status === 'active')
      .sort((a, b) => {
        // Sort by severity first, then by date
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const severityCompare = (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999);
        if (severityCompare !== 0) return severityCompare;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching clinical alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * POST /api/anc/alerts
 * Create a clinical alert
 */
router.post('/alerts', async (req: Request, res: Response) => {
  try {
    const alertData = req.body;
    
    const alertId = generateId();
    const newAlert = {
      id: alertId,
      ...alertData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    ancStorage.alerts.set(alertId, newAlert);
    res.status(201).json(newAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * PATCH /api/anc/alerts/:alertId/acknowledge
 * Acknowledge a clinical alert
 */
router.patch('/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    
    const alert = ancStorage.alerts.get(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    const updated = {
      ...alert,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    };
    
    ancStorage.alerts.set(alertId, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// ============= REFERRAL ENDPOINTS =============

/**
 * GET /api/anc/referrals/:patientId
 * Get referrals for a patient
 */
router.get('/referrals/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const referrals = Array.from(ancStorage.referrals.values())
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.referralDate).getTime() - new Date(a.referralDate).getTime());
    
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

/**
 * POST /api/anc/referral
 * Create a new referral
 */
router.post('/referral', async (req: Request, res: Response) => {
  try {
    const referralData = req.body;
    
    const referralId = generateId();
    const newReferral = {
      id: referralId,
      ...referralData,
      status: 'initiated',
      createdAt: new Date().toISOString()
    };
    
    ancStorage.referrals.set(referralId, newReferral);
    res.status(201).json(newReferral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

/**
 * PATCH /api/anc/referral/:referralId
 * Update referral status
 */
router.patch('/referral/:referralId', async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;
    const updates = req.body;
    
    const referral = ancStorage.referrals.get(referralId);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }
    
    const updated = {
      ...referral,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    ancStorage.referrals.set(referralId, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

// ============= STATISTICS ENDPOINTS =============

/**
 * GET /api/anc/statistics/:facilityId
 * Get ANC statistics for a facility
 */
router.get('/statistics/:facilityId', async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.params;
    const { start, end } = req.query;
    
    let encounters = Array.from(ancStorage.encounters.values())
      .filter(e => e.facilityId === facilityId);
    
    // Apply date filter if provided
    if (start) {
      const startDate = new Date(start as string);
      encounters = encounters.filter(e => new Date(e.visitDate) >= startDate);
    }
    if (end) {
      const endDate = new Date(end as string);
      encounters = encounters.filter(e => new Date(e.visitDate) <= endDate);
    }
    
    // Calculate statistics
    const stats = {
      totalEncounters: encounters.length,
      uniquePatients: new Set(encounters.map(e => e.patientId)).size,
      byVisitNumber: {} as Record<number, number>,
      byTrimester: { first: 0, second: 0, third: 0 },
      highRiskCases: 0,
      referralsOut: 0
    };
    
    // Process encounters for detailed stats
    encounters.forEach(encounter => {
      // Visit number distribution
      const visitNum = encounter.visitNumber || 0;
      stats.byVisitNumber[visitNum] = (stats.byVisitNumber[visitNum] || 0) + 1;
      
      // Trimester distribution
      const ga = encounter.gestationalAgeWeeks;
      if (ga) {
        if (ga < 14) stats.byTrimester.first++;
        else if (ga < 28) stats.byTrimester.second++;
        else stats.byTrimester.third++;
      }
      
      // High risk cases
      if (encounter.riskCategory === 'high') {
        stats.highRiskCases++;
      }
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;