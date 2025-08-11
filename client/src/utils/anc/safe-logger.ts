/**
 * Safe Logging Utility with PHI Redaction
 * Ensures sensitive patient data is not logged
 */

export interface LogRedactionConfig {
  fields: string[];           // Fields to completely redact
  hashFields?: string[];       // Fields to hash instead of redact
  contextualRedaction?: boolean; // Smart redaction based on context
}

// Default PHI fields to redact
const DEFAULT_PHI_FIELDS = [
  'nrc',
  'nationalId',
  'ssn',
  'patientNumber',
  'phoneNumber',
  'phone',
  'mobile',
  'email',
  'address',
  'streetAddress',
  'dateOfBirth',
  'dob',
  'firstName',
  'lastName',
  'middleName',
  'fullName',
  'name',
  'mothersName',
  'fathersName',
  'nextOfKin',
  'emergencyContact',
  'insuranceNumber',
  'medicalRecordNumber',
  'mrn'
];

// Fields that should be hashed rather than completely redacted
const DEFAULT_HASH_FIELDS = [
  'patientId',
  'encounterId',
  'userId',
  'providerId',
  'facilityId'
];

/**
 * Redact PHI from an object
 */
export const redactPHI = (
  data: any,
  config: LogRedactionConfig = { fields: DEFAULT_PHI_FIELDS }
): any => {
  if (!data) return data;
  
  // Handle primitives
  if (typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => redactPHI(item, config));
  }
  
  // Handle objects
  const redacted: any = {};
  const fieldsToRedact = config.fields || DEFAULT_PHI_FIELDS;
  const fieldsToHash = config.hashFields || DEFAULT_HASH_FIELDS;
  
  for (const key in data) {
    const lowerKey = key.toLowerCase();
    
    // Check if field should be completely redacted
    if (fieldsToRedact.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
      continue;
    }
    
    // Check if field should be hashed
    if (fieldsToHash.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = hashValue(data[key]);
      continue;
    }
    
    // Contextual redaction for specific patterns
    if (config.contextualRedaction) {
      const value = data[key];
      
      // Phone number pattern
      if (typeof value === 'string' && /^\+?\d{10,15}$/.test(value)) {
        redacted[key] = '[PHONE_REDACTED]';
        continue;
      }
      
      // Email pattern
      if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        redacted[key] = '[EMAIL_REDACTED]';
        continue;
      }
      
      // Date pattern (ISO format)
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        // Keep year and month, redact day for dates
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          redacted[key] = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-XX`;
          continue;
        }
      }
    }
    
    // Recursively redact nested objects
    if (typeof data[key] === 'object' && data[key] !== null) {
      redacted[key] = redactPHI(data[key], config);
    } else {
      redacted[key] = data[key];
    }
  }
  
  return redacted;
};

/**
 * Hash a value for logging (one-way, non-reversible)
 */
const hashValue = (value: any): string => {
  if (!value) return '[NULL]';
  
  const str = String(value);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `[HASH:${Math.abs(hash).toString(16).toUpperCase()}]`;
};

/**
 * Mask NRC (National Registration Card) number
 */
export const maskNRC = (nrc: string): string => {
  if (!nrc) return '';
  
  // Keep first 2 and last 2 characters, mask the rest
  if (nrc.length <= 4) {
    return '*'.repeat(nrc.length);
  }
  
  const first = nrc.substring(0, 2);
  const last = nrc.substring(nrc.length - 2);
  const masked = '*'.repeat(Math.max(0, nrc.length - 4));
  
  return `${first}${masked}${last}`;
};

/**
 * Mask patient name (show initials only)
 */
export const maskName = (name: string): string => {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  return parts.map(part => `${part[0]}.`).join(' ');
};

/**
 * Safe logger with automatic PHI redaction
 */
export const createSafeLogger = (config?: LogRedactionConfig) => {
  const redactionConfig = config || { 
    fields: DEFAULT_PHI_FIELDS,
    hashFields: DEFAULT_HASH_FIELDS,
    contextualRedaction: true
  };
  
  return {
    info: (message: string, data?: any) => {
      const redacted = data ? redactPHI(data, redactionConfig) : undefined;
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, redacted);
    },
    
    warn: (message: string, data?: any) => {
      const redacted = data ? redactPHI(data, redactionConfig) : undefined;
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, redacted);
    },
    
    error: (message: string, error?: any, data?: any) => {
      const redactedData = data ? redactPHI(data, redactionConfig) : undefined;
      const redactedError = error ? redactPHI({
        message: error.message,
        stack: error.stack,
        code: error.code
      }, redactionConfig) : undefined;
      
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, redactedError, redactedData);
    },
    
    clinical: (action: string, data?: any) => {
      const redacted = data ? redactPHI(data, redactionConfig) : undefined;
      console.log(`[CLINICAL] ${new Date().toISOString()} - ${action}`, redacted);
    },
    
    audit: (event: string, userId: string, data?: any) => {
      const redacted = data ? redactPHI(data, redactionConfig) : undefined;
      console.log(`[AUDIT] ${new Date().toISOString()} - Event: ${event}, User: ${hashValue(userId)}`, redacted);
    }
  };
};

// Create default safe logger instance
export const safeLog = createSafeLogger();

/**
 * Log clinical decision with automatic redaction
 */
export const logClinicalDecision = (
  decision: string,
  patientId: string,
  details?: any
) => {
  safeLog.clinical(`Decision: ${decision}`, {
    patientId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log error with context
 */
export const logError = (
  context: string,
  error: Error,
  additionalData?: any
) => {
  safeLog.error(`Error in ${context}`, error, additionalData);
};

/**
 * Create audit log entry
 */
export const createAuditLog = (
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  details?: any
) => {
  safeLog.audit(action, userId, {
    resourceType,
    resourceId,
    details
  });
};