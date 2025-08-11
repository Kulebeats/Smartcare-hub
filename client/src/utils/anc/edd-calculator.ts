/**
 * EDD (Expected Date of Delivery) Calculator Utilities
 * Based on standard obstetric calculations and Zambian ANC Guidelines
 */

import { GestationalAge, EDDCalculation } from '@/types/anc';

/**
 * Calculate EDD from Last Menstrual Period (LMP) using Naegele's Rule
 * EDD = LMP + 280 days (40 weeks)
 */
export const eddFromLMP = (lmpDate: Date): EDDCalculation => {
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280); // Add 280 days (40 weeks)
  
  const today = new Date();
  const gestationalDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(gestationalDays / 7);
  const days = gestationalDays % 7;
  
  return {
    edd,
    method: 'lmp',
    gestationalAge: {
      weeks,
      days,
      confidence: 'high',
      method: 'lmp',
      calculatedDate: today,
    },
    trimester: getTrimester(weeks),
    daysToEDD: Math.floor((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    isOverdue: today > edd
  };
};

/**
 * Calculate EDD from Ultrasound measurements
 * Most accurate in first trimester
 */
export const eddFromUltrasound = (
  ultrasoundDate: Date, 
  gestationalWeeks: number, 
  gestationalDays: number
): EDDCalculation => {
  const totalDays = (gestationalWeeks * 7) + gestationalDays;
  const conceptionDate = new Date(ultrasoundDate);
  conceptionDate.setDate(conceptionDate.getDate() - totalDays);
  
  const edd = new Date(conceptionDate);
  edd.setDate(edd.getDate() + 280);
  
  const today = new Date();
  const currentGestationalDays = Math.floor((today.getTime() - conceptionDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeeks = Math.floor(currentGestationalDays / 7);
  const currentDays = currentGestationalDays % 7;
  
  // Confidence decreases with later ultrasounds
  const confidence: 'high' | 'medium' | 'low' = 
    gestationalWeeks < 14 ? 'high' :
    gestationalWeeks < 28 ? 'medium' : 'low';
  
  return {
    edd,
    method: 'ultrasound',
    gestationalAge: {
      weeks: currentWeeks,
      days: currentDays,
      confidence,
      method: 'ultrasound',
      calculatedDate: today,
    },
    trimester: getTrimester(currentWeeks),
    daysToEDD: Math.floor((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    isOverdue: today > edd
  };
};

/**
 * Calculate gestational age from Symphysis-Fundal Height (SFH)
 * Approximate: SFH in cm ≈ gestational weeks (after 20 weeks)
 */
export const gaFromSFH = (sfhCm: number): GestationalAge => {
  // SFH is most accurate between 20-36 weeks
  const estimatedWeeks = sfhCm;
  const confidence: 'high' | 'medium' | 'low' = 
    sfhCm >= 20 && sfhCm <= 36 ? 'medium' : 'low';
  
  return {
    weeks: Math.floor(estimatedWeeks),
    days: Math.round((estimatedWeeks % 1) * 7),
    confidence,
    method: 'sfh',
    calculatedDate: new Date(),
  };
};

/**
 * Calculate EDD from clinical assessment (fundal height)
 */
export const eddFromClinical = (sfhCm: number): EDDCalculation => {
  const ga = gaFromSFH(sfhCm);
  const remainingWeeks = 40 - ga.weeks;
  const remainingDays = -ga.days; // Subtract current days from remaining
  
  const edd = new Date();
  edd.setDate(edd.getDate() + (remainingWeeks * 7) + remainingDays);
  
  return {
    edd,
    method: 'clinical',
    gestationalAge: ga,
    trimester: getTrimester(ga.weeks),
    daysToEDD: (remainingWeeks * 7) + remainingDays,
    isOverdue: ga.weeks >= 40
  };
};

/**
 * Determine trimester from gestational weeks
 */
export const getTrimester = (weeks: number): 1 | 2 | 3 => {
  if (weeks < 14) return 1;
  if (weeks < 28) return 2;
  return 3;
};

// Export calculateEDD and calculateEDDFromLMP as aliases for eddFromLMP for backward compatibility
export const calculateEDD = eddFromLMP;
export const calculateEDDFromLMP = eddFromLMP;

/**
 * Get trimester label
 */
export const getTrimesterLabel = (trimester: 1 | 2 | 3): string => {
  const labels = {
    1: 'First Trimester (0-13 weeks)',
    2: 'Second Trimester (14-27 weeks)',
    3: 'Third Trimester (28+ weeks)'
  };
  return labels[trimester];
};

/**
 * Format gestational age for display
 */
export const formatGestationalAge = (ga: GestationalAge): string => {
  return `${ga.weeks} weeks, ${ga.days} days`;
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

/**
 * Validate LMP date
 */
export const isValidLMP = (lmpDate: Date): boolean => {
  const today = new Date();
  const maxDaysPregnant = 44 * 7; // 44 weeks max
  const daysSinceLMP = daysBetween(lmpDate, today);
  
  return lmpDate <= today && daysSinceLMP <= maxDaysPregnant;
};

/**
 * Compare EDDs from different methods and flag discrepancies
 */
export const compareEDDs = (
  edd1: EDDCalculation, 
  edd2: EDDCalculation
): { discrepancyDays: number; significant: boolean } => {
  const discrepancyDays = Math.abs(daysBetween(edd1.edd, edd2.edd));
  
  // Significant if > 7 days in first trimester, > 14 days in second/third
  const significant = edd1.trimester === 1 ? 
    discrepancyDays > 7 : 
    discrepancyDays > 14;
  
  return { discrepancyDays, significant };
};

/**
 * Get pregnancy status label
 */
export const getPregnancyStatus = (ga: GestationalAge): string => {
  if (ga.weeks < 37) return 'Preterm';
  if (ga.weeks >= 37 && ga.weeks < 42) return 'Term';
  return 'Post-term';
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/**
 * Get BMI category for pregnancy
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Generate Safe Motherhood Number (Zambia specific)
 */
export const generateSafeMotherhoodNumber = (
  facilityCode: string,
  year: number = new Date().getFullYear()
): string => {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${facilityCode}/${year}/${randomNum}`;
};

/**
 * Calculate next ANC visit date based on gestational age
 * Based on WHO/Zambian ANC visit schedule
 */
export const calculateNextVisitDate = (ga: GestationalAge): Date => {
  const nextVisit = new Date();
  
  if (ga.weeks < 20) {
    // Monthly visits until 20 weeks
    nextVisit.setDate(nextVisit.getDate() + 28);
  } else if (ga.weeks < 36) {
    // Bi-weekly visits from 20-36 weeks
    nextVisit.setDate(nextVisit.getDate() + 14);
  } else {
    // Weekly visits after 36 weeks
    nextVisit.setDate(nextVisit.getDate() + 7);
  }
  
  return nextVisit;
};