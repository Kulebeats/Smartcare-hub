/**
 * ANC API Layer
 * Thin wrappers around HTTP for ANC-related resources
 */

import { ANCEncounter, PatientData, VitalSigns, MaternalAssessment, FetalAssessment, LabResult } from '@/types/anc';

const API_BASE = '/api';

/**
 * Handle API responses
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Patient API
 */
export const patientApi = {
  fetchPatient: async (id: string): Promise<PatientData> => {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      credentials: 'include'
    });
    return handleResponse<PatientData>(response);
  },

  updatePatient: async (id: string, updates: Partial<PatientData>): Promise<PatientData> => {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include'
    });
    return handleResponse<PatientData>(response);
  },

  searchPatients: async (query: string): Promise<PatientData[]> => {
    const response = await fetch(`${API_BASE}/patients/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    return handleResponse<PatientData[]>(response);
  }
};

/**
 * ANC Encounter API
 */
export const encounterApi = {
  fetchEncounter: async (id: string): Promise<ANCEncounter> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${id}`, {
      credentials: 'include'
    });
    return handleResponse<ANCEncounter>(response);
  },

  fetchPatientEncounters: async (patientId: string): Promise<ANCEncounter[]> => {
    const response = await fetch(`${API_BASE}/anc/patients/${patientId}/encounters`, {
      credentials: 'include'
    });
    return handleResponse<ANCEncounter[]>(response);
  },

  createEncounter: async (encounter: Omit<ANCEncounter, 'id'>): Promise<ANCEncounter> => {
    const response = await fetch(`${API_BASE}/anc/encounters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encounter),
      credentials: 'include'
    });
    return handleResponse<ANCEncounter>(response);
  },

  updateEncounter: async (id: string, updates: Partial<ANCEncounter>): Promise<ANCEncounter> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include'
    });
    return handleResponse<ANCEncounter>(response);
  },

  deleteEncounter: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete encounter: ${response.status}`);
    }
  }
};

/**
 * Vital Signs API
 */
export const vitalSignsApi = {
  saveVitalSigns: async (vitalSigns: Omit<VitalSigns, 'id'>): Promise<VitalSigns> => {
    const response = await fetch(`${API_BASE}/anc/vital-signs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitalSigns),
      credentials: 'include'
    });
    return handleResponse<VitalSigns>(response);
  },

  fetchVitalSigns: async (encounterId: string): Promise<VitalSigns | null> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${encounterId}/vital-signs`, {
      credentials: 'include'
    });
    if (response.status === 404) return null;
    return handleResponse<VitalSigns>(response);
  }
};

/**
 * Assessment API
 */
export const assessmentApi = {
  saveMaternalAssessment: async (assessment: Omit<MaternalAssessment, 'id'>): Promise<MaternalAssessment> => {
    const response = await fetch(`${API_BASE}/anc/maternal-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
      credentials: 'include'
    });
    return handleResponse<MaternalAssessment>(response);
  },

  saveFetalAssessment: async (assessment: Omit<FetalAssessment, 'id'>): Promise<FetalAssessment> => {
    const response = await fetch(`${API_BASE}/anc/fetal-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
      credentials: 'include'
    });
    return handleResponse<FetalAssessment>(response);
  }
};

/**
 * Laboratory API
 */
export const laboratoryApi = {
  saveLabResults: async (results: Omit<LabResult, 'id'>[]): Promise<LabResult[]> => {
    const response = await fetch(`${API_BASE}/anc/lab-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results),
      credentials: 'include'
    });
    return handleResponse<LabResult[]>(response);
  },

  fetchLabResults: async (encounterId: string): Promise<LabResult[]> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${encounterId}/lab-results`, {
      credentials: 'include'
    });
    return handleResponse<LabResult[]>(response);
  }
};

/**
 * Danger Signs API
 */
export const dangerSignsApi = {
  saveDangerSigns: async (encounterId: string, signs: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE}/anc/encounters/${encounterId}/danger-signs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dangerSigns: signs }),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to save danger signs: ${response.status}`);
    }
  }
};