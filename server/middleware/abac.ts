import { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../db';
import { patients } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface ABACPolicy {
  id: string;
  subject: string;
  resource_type: string;
  action: string;
  description: string;
  conditions?: {
    match_facility_id?: boolean;
    match_facility_id_on_body?: boolean;
    match_facility_id_via_patient?: boolean;
    role_restrictions?: string[];
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    facility: string;
    facilityCode?: string;
  };
}

// Load policies once at startup
let policies: ABACPolicy[] = [];
try {
  const policiesPath = join(process.cwd(), 'policies', 'abac.json');
  const policiesData = readFileSync(policiesPath, 'utf-8');
  policies = JSON.parse(policiesData);
  console.log(`Loaded ${policies.length} ABAC policies`);
} catch (error) {
  console.error('Failed to load ABAC policies:', error);
  policies = [];
}

/**
 * Maps HTTP methods to ABAC actions
 */
function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'read';
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'read';
  }
}

/**
 * Finds matching policy for user role, resource type, and action
 */
function findMatchingPolicy(userRole: string, resourceType: string, action: string): ABACPolicy | null {
  return policies.find(policy => 
    (policy.subject === userRole || policy.subject === '*') &&
    (policy.resource_type === resourceType || policy.resource_type === '*') &&
    (policy.action === action || policy.action === '*')
  ) || null;
}

/**
 * Validates facility-based conditions
 */
async function validateFacilityConditions(
  policy: ABACPolicy,
  req: AuthenticatedRequest,
  action: string
): Promise<{ allowed: boolean; message?: string }> {
  const userFacility = req.user?.facility;
  
  if (!userFacility) {
    return { allowed: false, message: 'User facility not found' };
  }

  const conditions = policy.conditions;
  if (!conditions) {
    return { allowed: true };
  }

  // Check facility ID in request body (for create operations)
  if (conditions.match_facility_id_on_body && req.body?.facility) {
    if (req.body.facility !== userFacility) {
      return { 
        allowed: false, 
        message: 'Cannot create resource outside your facility' 
      };
    }
  }

  // Check facility ID via patient relationship
  if (conditions.match_facility_id_via_patient) {
    const patientId = req.params.patientId || req.params.id || req.body?.patientId;
    
    if (patientId) {
      try {
        const patient = await db
          .select({ facility: patients.facility })
          .from(patients)
          .where(eq(patients.id, parseInt(patientId)))
          .limit(1);

        if (patient.length === 0) {
          return { allowed: false, message: 'Patient not found' };
        }

        if (patient[0].facility !== userFacility) {
          return { 
            allowed: false, 
            message: 'Cannot access patient from different facility' 
          };
        }
      } catch (error) {
        console.error('Error validating patient facility:', error);
        return { allowed: false, message: 'Database error during validation' };
      }
    }
  }

  // Check direct facility ID match (for patient resources)
  if (conditions.match_facility_id && req.params.id && action === 'read') {
    try {
      const patient = await db
        .select({ facility: patients.facility })
        .from(patients)
        .where(eq(patients.id, parseInt(req.params.id)))
        .limit(1);

      if (patient.length === 0) {
        return { allowed: false, message: 'Patient not found' };
      }

      if (patient[0].facility !== userFacility) {
        return { 
          allowed: false, 
          message: 'Cannot access patient from different facility' 
        };
      }
    } catch (error) {
      console.error('Error validating resource facility:', error);
      return { allowed: false, message: 'Database error during validation' };
    }
  }

  // Check role restrictions for user creation
  if (conditions.role_restrictions && req.body?.role) {
    if (!conditions.role_restrictions.includes(req.body.role)) {
      return { 
        allowed: false, 
        message: `Cannot create user with role: ${req.body.role}` 
      };
    }
  }

  return { allowed: true };
}

/**
 * ABAC middleware factory
 */
export function checkAccess(resourceType: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Skip ABAC if no user context (should be caught by auth middleware first)
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const userRole = req.user.role;
      const action = getActionFromMethod(req.method);

      // Find matching policy
      const matchedPolicy = findMatchingPolicy(userRole, resourceType, action);

      if (!matchedPolicy) {
        console.log(`ABAC: No policy found for ${userRole} -> ${action} on ${resourceType}`);
        return res.status(403).json({ 
          message: 'Forbidden: No matching access policy',
          timestamp: new Date().toISOString()
        });
      }

      // System administrators have unrestricted access
      if (matchedPolicy.subject === 'SystemAdministrator' && 
          matchedPolicy.resource_type === '*' && 
          matchedPolicy.action === '*') {
        console.log(`ABAC: System admin access granted for ${action} on ${resourceType}`);
        return next();
      }

      // Validate facility-based conditions
      const conditionResult = await validateFacilityConditions(matchedPolicy, req, action);
      
      if (!conditionResult.allowed) {
        console.log(`ABAC: Access denied - ${conditionResult.message}`);
        return res.status(403).json({ 
          message: `Forbidden: ${conditionResult.message}`,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`ABAC: Access granted for ${userRole} -> ${action} on ${resourceType}`);
      next();

    } catch (error) {
      console.error('ABAC middleware error:', error);
      res.status(500).json({ 
        message: 'Internal server error during access control',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Utility function to validate access programmatically
 */
export async function validateAccess(
  user: { role: string; facility: string },
  resourceType: string,
  action: string,
  context: { patientId?: number; facility?: string } = {}
): Promise<{ allowed: boolean; message?: string }> {
  const matchedPolicy = findMatchingPolicy(user.role, resourceType, action);
  
  if (!matchedPolicy) {
    return { allowed: false, message: 'No matching access policy' };
  }

  // System administrators have unrestricted access
  if (matchedPolicy.subject === 'SystemAdministrator' && 
      matchedPolicy.resource_type === '*' && 
      matchedPolicy.action === '*') {
    return { allowed: true };
  }

  const conditions = matchedPolicy.conditions;
  if (!conditions) {
    return { allowed: true };
  }

  // Validate facility-based conditions
  if (conditions.match_facility_id_on_body && context.facility) {
    if (context.facility !== user.facility) {
      return { allowed: false, message: 'Cannot create resource outside your facility' };
    }
  }

  if (conditions.match_facility_id_via_patient && context.patientId) {
    try {
      const patient = await db
        .select({ facility: patients.facility })
        .from(patients)
        .where(eq(patients.id, context.patientId))
        .limit(1);

      if (patient.length === 0) {
        return { allowed: false, message: 'Patient not found' };
      }

      if (patient[0].facility !== user.facility) {
        return { allowed: false, message: 'Cannot access patient from different facility' };
      }
    } catch (error) {
      return { allowed: false, message: 'Database error during validation' };
    }
  }

  return { allowed: true };
}