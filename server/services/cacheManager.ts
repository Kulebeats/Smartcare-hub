/**
 * Smart Caching Strategy (Replit Focus)
 * Memory-efficient in-memory caching with appropriate TTLs and size limits
 */

import NodeCache from 'node-cache';

// Cache for relatively static data (facilities, DAK guidelines, user roles)
const staticCacheConfig = {
  stdTTL: parseInt(process.env.CACHE_STATIC_TTL_SECONDS || '3600'),     // 1 hour
  checkperiod: parseInt(process.env.CACHE_STATIC_CHECKPERIOD_SECONDS || '600'), // Check every 10 minutes
  maxKeys: parseInt(process.env.CACHE_STATIC_MAX_KEYS || '100'),         // Limit memory
  useClones: false // Better performance if cached objects are not modified
};

export const staticCache = new NodeCache(staticCacheConfig);
console.log('[CACHE_MANAGER] Static cache configured:', staticCacheConfig);

// Cache for dynamic, frequently accessed data (patient lookups, session data)
const dynamicCacheConfig = {
  stdTTL: parseInt(process.env.CACHE_DYNAMIC_TTL_SECONDS || '300'),      // 5 minutes
  checkperiod: parseInt(process.env.CACHE_DYNAMIC_CHECKPERIOD_SECONDS || '60'),  // Check every 1 minute
  maxKeys: parseInt(process.env.CACHE_DYNAMIC_MAX_KEYS || '200'),        // Limit memory
  useClones: false
};

export const dynamicCache = new NodeCache(dynamicCacheConfig);
console.log('[CACHE_MANAGER] Dynamic cache configured:', dynamicCacheConfig);

// Cache for clinical decision support rules
const clinicalCacheConfig = {
  stdTTL: parseInt(process.env.CACHE_CLINICAL_TTL_SECONDS || '1800'),    // 30 minutes
  checkperiod: parseInt(process.env.CACHE_CLINICAL_CHECKPERIOD_SECONDS || '300'), // Check every 5 minutes
  maxKeys: parseInt(process.env.CACHE_CLINICAL_MAX_KEYS || '50'),        // Smaller cache for clinical rules
  useClones: false
};

export const clinicalCache = new NodeCache(clinicalCacheConfig);
console.log('[CACHE_MANAGER] Clinical cache configured:', clinicalCacheConfig);

// Cache key generators for consistency
export const CacheKeys = {
  // Static data keys
  FACILITIES_LIST: 'facilities:all',
  FACILITY_BY_ID: (id: number) => `facility:${id}`,
  FACILITY_BY_NAME: (name: string) => `facility:name:${name}`,
  USER_PERMISSIONS: (userId: number) => `user:${userId}:permissions`,
  
  // Dynamic data keys
  PATIENT_BY_ID: (id: number) => `patient:${id}`,
  PATIENT_BY_NRC: (nrc: string) => `patient:nrc:${nrc}`,
  PATIENT_SEARCH: (facility: string, query: string) => `search:${facility}:${query}`,
  USER_SESSION: (userId: number) => `session:${userId}`,
  
  // Clinical data keys
  CLINICAL_RULES: (module: string) => `rules:${module}`,
  DANGER_SIGNS: (category: string) => `danger_signs:${category}`,
  DECISION_SUPPORT: (patientId: number, module: string) => `decision:${patientId}:${module}`,
};

// Cache statistics and monitoring
export function getCacheStats() {
  return {
    static: {
      ...staticCache.getStats(),
      keys: staticCache.keys().length,
      config: staticCacheConfig
    },
    dynamic: {
      ...dynamicCache.getStats(),
      keys: dynamicCache.keys().length,
      config: dynamicCacheConfig
    },
    clinical: {
      ...clinicalCache.getStats(),
      keys: clinicalCache.keys().length,
      config: clinicalCacheConfig
    }
  };
}

// Cache invalidation helpers
export const CacheInvalidation = {
  // Invalidate all facility-related caches
  facilities: () => {
    staticCache.del(CacheKeys.FACILITIES_LIST);
    staticCache.keys().forEach(key => {
      if (key.startsWith('facility:')) {
        staticCache.del(key);
      }
    });
    console.log('[CACHE_INVALIDATION] Facilities cache invalidated');
  },

  // Invalidate patient-related caches
  patient: (patientId: number) => {
    dynamicCache.del(CacheKeys.PATIENT_BY_ID(patientId));
    // Clear search results that might contain this patient
    dynamicCache.keys().forEach(key => {
      if (key.startsWith('search:')) {
        dynamicCache.del(key);
      }
    });
    console.log(`[CACHE_INVALIDATION] Patient ${patientId} cache invalidated`);
  },

  // Invalidate clinical rules cache
  clinicalRules: (module?: string) => {
    if (module) {
      clinicalCache.del(CacheKeys.CLINICAL_RULES(module));
      console.log(`[CACHE_INVALIDATION] Clinical rules for ${module} invalidated`);
    } else {
      clinicalCache.flushAll();
      console.log('[CACHE_INVALIDATION] All clinical rules cache invalidated');
    }
  },

  // Invalidate user-related caches
  user: (userId: number) => {
    staticCache.del(CacheKeys.USER_PERMISSIONS(userId));
    dynamicCache.del(CacheKeys.USER_SESSION(userId));
    console.log(`[CACHE_INVALIDATION] User ${userId} cache invalidated`);
  },

  // Clear all caches (use sparingly)
  all: () => {
    staticCache.flushAll();
    dynamicCache.flushAll();
    clinicalCache.flushAll();
    console.log('[CACHE_INVALIDATION] All caches cleared');
  }
};

// Cache warming functions
export const CacheWarming = {
  // Warm static data caches
  static: async (queryFn: (sql: string) => Promise<any>) => {
    try {
      console.log('[CACHE_WARMING] Starting static cache warm-up...');
      
      // Warm facilities cache
      const facilities = await queryFn('SELECT * FROM facilities ORDER BY name');
      if (facilities?.length > 0) {
        staticCache.set(CacheKeys.FACILITIES_LIST, facilities);
        facilities.forEach((facility: any) => {
          staticCache.set(CacheKeys.FACILITY_BY_ID(facility.id), facility);
          staticCache.set(CacheKeys.FACILITY_BY_NAME(facility.name), facility);
        });
        console.log(`[CACHE_WARMING] Cached ${facilities.length} facilities`);
      }
      
      console.log('[CACHE_WARMING] Static cache warm-up completed');
    } catch (error) {
      console.error('[CACHE_WARMING] Static cache warm-up failed:', error);
    }
  },

  // Warm clinical rules cache
  clinical: async (queryFn: (sql: string) => Promise<any>) => {
    try {
      console.log('[CACHE_WARMING] Starting clinical cache warm-up...');
      
      const modules = ['ANC', 'ART', 'PHARMACOVIGILANCE', 'PNC'];
      for (const module of modules) {
        const rules = await queryFn(`
          SELECT * FROM clinical_decision_rules 
          WHERE module_code = '${module}' AND is_active = true
          ORDER BY alert_severity, rule_name
        `);
        
        if (rules?.length > 0) {
          clinicalCache.set(CacheKeys.CLINICAL_RULES(module), rules);
          console.log(`[CACHE_WARMING] Cached ${rules.length} rules for ${module}`);
        }
      }
      
      console.log('[CACHE_WARMING] Clinical cache warm-up completed');
    } catch (error) {
      console.error('[CACHE_WARMING] Clinical cache warm-up failed:', error);
    }
  }
};

// Periodic cache statistics logging (optional)
if (process.env.CACHE_STATS_INTERVAL) {
  const intervalMs = parseInt(process.env.CACHE_STATS_INTERVAL) * 1000;
  setInterval(() => {
    const stats = getCacheStats();
    console.log('[CACHE_STATS]', {
      static: `${stats.static.keys}/${stats.static.config.maxKeys} keys, ${stats.static.hits} hits, ${stats.static.misses} misses`,
      dynamic: `${stats.dynamic.keys}/${stats.dynamic.config.maxKeys} keys, ${stats.dynamic.hits} hits, ${stats.dynamic.misses} misses`,
      clinical: `${stats.clinical.keys}/${stats.clinical.config.maxKeys} keys, ${stats.clinical.hits} hits, ${stats.clinical.misses} misses`
    });
  }, intervalMs);
}