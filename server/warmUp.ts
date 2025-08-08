/**
 * Startup & Cache Warming Optimization (Replit Sleep/Wake Cycles)
 * Improves initial response times after application startup or wake from sleep
 */

import { staticCache, dynamicCache, clinicalCache, CacheKeys } from './services/cacheManager';
import { db } from './db';
import { facilities, clinicalDecisionRules, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function warmUpApplicationCaches() {
  console.log('[WARM_UP] Starting application cache warm-up...');
  const startTime = Date.now();
  
  try {
    // Warm up facilities cache
    await warmFacilitiesCache();
    
    // Warm up clinical rules cache
    await warmClinicalRulesCache();
    
    // Warm up user roles and permissions cache
    await warmUserRolesCache();
    
    const duration = Date.now() - startTime;
    console.log(`[WARM_UP] Cache warm-up completed in ${duration}ms`);
    
    return {
      success: true,
      duration,
      caches: ['facilities', 'clinical_rules', 'user_roles']
    };
    
  } catch (error) {
    console.error('[WARM_UP] Cache warm-up failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function warmFacilitiesCache() {
  try {
    const facilitiesList = await db.select().from(facilities).orderBy(facilities.name);
    
    if (facilitiesList.length > 0) {
      staticCache.set(CacheKeys.FACILITIES_LIST, facilitiesList);
      
      facilitiesList.forEach(facility => {
        staticCache.set(CacheKeys.FACILITY_BY_ID(facility.id), facility);
        staticCache.set(CacheKeys.FACILITY_BY_NAME(facility.name), facility);
      });
      
      console.log(`[WARM_UP] Cached ${facilitiesList.length} facilities`);
    }
  } catch (error) {
    console.warn('[WARM_UP] Failed to warm facilities cache:', error);
  }
}

async function warmClinicalRulesCache() {
  try {
    const modules = ['ANC', 'ART', 'PHARMACOVIGILANCE', 'PNC'];
    let totalRules = 0;
    
    for (const module of modules) {
      try {
        const rules = await db
          .select()
          .from(clinicalDecisionRules)
          .where(eq(clinicalDecisionRules.moduleCode, module))
          .orderBy(clinicalDecisionRules.alertSeverity, clinicalDecisionRules.ruleName);
        
        if (rules.length > 0) {
          clinicalCache.set(CacheKeys.CLINICAL_RULES(module), rules);
          totalRules += rules.length;
          console.log(`[WARM_UP] Cached ${rules.length} rules for ${module}`);
        }
      } catch (error) {
        console.warn(`[WARM_UP] No clinical rules found for module ${module}`);
      }
    }
    
    console.log(`[WARM_UP] Total clinical rules cached: ${totalRules}`);
  } catch (error) {
    console.warn('[WARM_UP] Failed to warm clinical rules cache:', error);
  }
}

async function warmUserRolesCache() {
  try {
    const userRoles = await db
      .select({
        id: users.id,
        role: users.role,
        permissions: users.permissions,
        isAdmin: users.isAdmin
      })
      .from(users)
      .where(eq(users.active, true));
    
    userRoles.forEach(user => {
      const permissions = Array.isArray(user.permissions) ? user.permissions : [];
      staticCache.set(CacheKeys.USER_PERMISSIONS(user.id), {
        role: user.role,
        permissions,
        isAdmin: user.isAdmin
      });
    });
    
    console.log(`[WARM_UP] Cached permissions for ${userRoles.length} active users`);
  } catch (error) {
    console.warn('[WARM_UP] Failed to warm user roles cache:', error);
  }
}

// Health check function to verify cache effectiveness
export function getCacheWarmupStats() {
  return {
    static: {
      keys: staticCache.keys().length,
      stats: staticCache.getStats()
    },
    dynamic: {
      keys: dynamicCache.keys().length,
      stats: dynamicCache.getStats()
    },
    clinical: {
      keys: clinicalCache.keys().length,
      stats: clinicalCache.getStats()
    }
  };
}