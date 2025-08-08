import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    facility: string;
    facilityCode?: string;
  };
}

/**
 * Middleware to set RLS context parameters for authenticated users
 * This sets PostgreSQL session variables used by RLS policies
 */
export function setRLSContext() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Only set RLS context if user is authenticated and RLS is enabled
      if (!req.user || process.env.RLS_ENABLED !== 'true') {
        return next();
      }

      const userFacility = req.user.facility;
      const userRole = req.user.role;

      if (!userFacility || !userRole) {
        console.warn('RLS Context: Missing user facility or role data');
        return next();
      }

      // Extract facility ID from facility name/code
      let facilityId: number | null = null;
      
      // If facility is already a number, use it directly
      if (!isNaN(Number(userFacility))) {
        facilityId = Number(userFacility);
      } else {
        // Try to extract facility ID from facility code if available
        if (req.user.facilityCode && !isNaN(Number(req.user.facilityCode))) {
          facilityId = Number(req.user.facilityCode);
        } else {
          // Look up facility ID from database based on facility name
          try {
            const facilityResult = await db.execute(
              sql`SELECT id FROM facilities WHERE name = ${userFacility} OR code = ${userFacility} LIMIT 1`
            );
            
            if (facilityResult.rows && facilityResult.rows.length > 0) {
              facilityId = facilityResult.rows[0].id as number;
            }
          } catch (dbError) {
            console.error('RLS Context: Failed to lookup facility ID:', dbError);
          }
        }
      }

      if (facilityId === null) {
        console.warn(`RLS Context: Could not determine facility ID for user ${req.user.id} with facility: ${userFacility}`);
        return next();
      }

      // Set PostgreSQL session parameters for RLS policies
      await db.execute(sql`SET app.facility_id = ${facilityId.toString()}`);
      await db.execute(sql`SET app.user_role = ${userRole}`);
      await db.execute(sql`SET app.user_id = ${req.user.id}`);

      console.log(`RLS Context set: facility_id=${facilityId}, user_role=${userRole}, user_id=${req.user.id}`);
      
      next();
    } catch (error) {
      console.error('RLS Context middleware error:', error);
      // Don't block request flow for RLS context failures
      // Log the error but continue processing
      next();
    }
  };
}

/**
 * Middleware to clear RLS context (optional, for cleanup)
 */
export function clearRLSContext() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (process.env.RLS_ENABLED === 'true') {
        await db.execute(sql`RESET app.facility_id`);
        await db.execute(sql`RESET app.user_role`);
        await db.execute(sql`RESET app.user_id`);
        console.log('RLS Context cleared');
      }
    } catch (error) {
      console.error('Error clearing RLS context:', error);
    }
    next();
  };
}