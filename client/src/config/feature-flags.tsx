/**
 * Feature Flags Configuration
 * Controls incremental rollout of ANC refactoring
 */

import React from 'react';

// Feature flag names
export const FEATURE_FLAGS = {
  NEW_ANC_TABS: 'NEW_ANC_TABS',
  REACT_QUERY_DATA: 'REACT_QUERY_DATA',
  NEW_DANGER_SIGNS_FLOW: 'NEW_DANGER_SIGNS_FLOW',
  NEW_EDD_CALCULATOR: 'NEW_EDD_CALCULATOR',
  NEW_REFERRAL_FLOW: 'NEW_REFERRAL_FLOW',
  CLINICAL_AUDIT_TRAIL: 'CLINICAL_AUDIT_TRAIL',
  ENHANCED_TELEMETRY: 'ENHANCED_TELEMETRY',
  OFFLINE_SYNC: 'OFFLINE_SYNC'
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

// Default flag states (can be overridden by environment variables)
const defaultFlags: Record<FeatureFlagName, boolean> = {
  NEW_ANC_TABS: false,
  REACT_QUERY_DATA: false,
  NEW_DANGER_SIGNS_FLOW: false,
  NEW_EDD_CALCULATOR: false,
  NEW_REFERRAL_FLOW: false,
  CLINICAL_AUDIT_TRAIL: false,
  ENHANCED_TELEMETRY: false,
  OFFLINE_SYNC: false
};

/**
 * Check if a feature flag is enabled
 */
export const useFeatureFlag = (flagName: FeatureFlagName): boolean => {
  // Check environment variable first
  const envKey = `VITE_FEATURE_${flagName}`;
  const envValue = import.meta.env[envKey];
  
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }
  
  // Check localStorage for user-specific overrides
  if (typeof window !== 'undefined') {
    const localOverride = localStorage.getItem(`feature_${flagName}`);
    if (localOverride !== null) {
      return localOverride === 'true';
    }
  }
  
  // Fall back to default
  return defaultFlags[flagName];
};

/**
 * Get all feature flag states
 */
export const getAllFeatureFlags = (): Record<FeatureFlagName, boolean> => {
  const flags: Partial<Record<FeatureFlagName, boolean>> = {};
  
  for (const key in FEATURE_FLAGS) {
    flags[key as FeatureFlagName] = useFeatureFlag(key as FeatureFlagName);
  }
  
  return flags as Record<FeatureFlagName, boolean>;
};

/**
 * Set feature flag override (for testing/development)
 */
export const setFeatureFlagOverride = (
  flagName: FeatureFlagName, 
  enabled: boolean
): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`feature_${flagName}`, enabled.toString());
  }
};

/**
 * Clear all feature flag overrides
 */
export const clearFeatureFlagOverrides = (): void => {
  if (typeof window !== 'undefined') {
    for (const key in FEATURE_FLAGS) {
      localStorage.removeItem(`feature_${key}`);
    }
  }
};

/**
 * Feature flag dependent component wrapper
 */
export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flagName: FeatureFlagName,
  FallbackComponent?: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const isEnabled = useFeatureFlag(flagName);
    
    if (isEnabled) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
};

/**
 * Progressive rollout configuration
 */
export interface RolloutConfig {
  flag: FeatureFlagName;
  percentage: number; // 0-100
  userGroups?: string[];
  facilities?: string[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Check if user is in rollout group
 */
export const isInRollout = (
  config: RolloutConfig,
  userId: string,
  facilityId?: string
): boolean => {
  // Check date range
  const now = new Date();
  if (config.startDate && now < config.startDate) return false;
  if (config.endDate && now > config.endDate) return false;
  
  // Check facility
  if (config.facilities && facilityId) {
    if (!config.facilities.includes(facilityId)) return false;
  }
  
  // Check percentage rollout (hash user ID for consistency)
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const bucket = Math.abs(hash) % 100;
  return bucket < config.percentage;
};

// Export React components
export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};