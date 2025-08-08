/**
 * Enhanced Decision Support Service with Caching
 * Provides modular clinical decision support with DAK traceability
 */

import NodeCache from 'node-cache';
import { db } from '../db';
import { clinicalDecisionRules } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Cache configuration
const ruleCache = new NodeCache({
  stdTTL: 3600, // 1 hour cache
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Use references for better performance
});

// Cache statistics tracking
interface CacheStats {
  hits: number;
  misses: number;
  lastUpdated: Date;
}

let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  lastUpdated: new Date()
};

export interface DecisionSupportMessage {
  ruleId: number;
  ruleCode: string;
  message: string;
  severity: string;
  recommendations: string[];
  dakReference?: string;
  guidelineVersion?: string;
  evidenceQuality?: string;
  whoGuidelineReference?: string;
}

/**
 * Get decision support messages for a specific module
 */
export async function getDecisionSupportMessages(
  moduleCode: string,
  activeOnly: boolean = true
): Promise<DecisionSupportMessage[]> {
  const cacheKey = `rules_${moduleCode}_${activeOnly}`;
  
  // Try to get from cache first
  let rules = ruleCache.get<any[]>(cacheKey);
  
  if (rules) {
    cacheStats.hits++;
    console.log(`Cache hit for module: ${moduleCode}`);
  } else {
    cacheStats.misses++;
    console.log(`Cache miss for module: ${moduleCode}, fetching from database`);
    
    // Fetch from database
    const query = db
      .select()
      .from(clinicalDecisionRules)
      .where(eq(clinicalDecisionRules.moduleCode, moduleCode));
    
    if (activeOnly) {
      rules = await query.where(
        and(
          eq(clinicalDecisionRules.moduleCode, moduleCode),
          eq(clinicalDecisionRules.isActive, true)
        )
      );
    } else {
      rules = await query;
    }
    
    // Cache the results
    ruleCache.set(cacheKey, rules);
  }

  // Transform to decision support messages
  return rules.map(rule => ({
    ruleId: rule.id,
    ruleCode: rule.ruleCode,
    message: rule.decisionSupportMessage || rule.alertMessage,
    severity: rule.alertSeverity,
    recommendations: Array.isArray(rule.recommendations) ? rule.recommendations : [],
    dakReference: rule.dakReference,
    guidelineVersion: rule.guidelineVersion,
    evidenceQuality: rule.evidenceQuality,
    whoGuidelineReference: rule.whoGuidelineReference
  }));
}

/**
 * Invalidate cache for specific module or all rules
 */
export function invalidateRuleCache(moduleCode?: string): void {
  if (moduleCode) {
    // Invalidate specific module cache
    const keys = ruleCache.keys().filter(key => 
      key.startsWith(`rules_${moduleCode}_`) || key.startsWith(`rule_`)
    );
    
    keys.forEach(key => ruleCache.del(key));
    console.log(`Invalidated cache for module: ${moduleCode}, keys: ${keys.length}`);
  } else {
    // Invalidate entire cache
    ruleCache.flushAll();
    console.log('Invalidated entire rule cache');
  }
  
  cacheStats.lastUpdated = new Date();
}

/**
 * Warm cache for frequently used modules
 */
export async function warmCache(modules: string[] = ['ANC', 'ART', 'PHARMACOVIGILANCE']): Promise<void> {
  console.log('Warming rule cache for modules:', modules.join(', '));
  
  for (const moduleCode of modules) {
    try {
      await getDecisionSupportMessages(moduleCode, true);
      await getDecisionSupportMessages(moduleCode, false);
      console.log(`Cache warmed for module: ${moduleCode}`);
    } catch (error) {
      console.error(`Failed to warm cache for module ${moduleCode}:`, error);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const keys = ruleCache.keys();
  return {
    ...cacheStats,
    totalKeys: keys.length,
    hitRate: cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%'
      : '0%',
    cacheSize: ruleCache.getStats()
  };
}

export default {
  getDecisionSupportMessages,
  invalidateRuleCache,
  warmCache,
  getCacheStats
};