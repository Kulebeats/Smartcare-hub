/**
 * Unified Obstetric History Validation and Business Rules
 * Used across Client Profile, Obstetric Assessment, and Emergency Referral
 */
import { z } from "zod";

// Unified Obstetric History Schema
export const obstetricHistorySchema = z.object({
  gravida: z.number().min(1, "Gravida must be at least 1").max(20, "Gravida cannot exceed 20"),
  para: z.number().min(0, "Para cannot be negative").max(15, "Para cannot exceed 15"),
  abortions: z.number().min(0, "Abortions cannot be negative").max(10, "Abortions cannot exceed 10"),
  livingChildren: z.number().min(0, "Living children cannot be negative").max(15, "Living children cannot exceed 15"),
  previousPregnancies: z.number().min(0, "Previous pregnancies cannot be negative").max(19, "Previous pregnancies cannot exceed 19"),
}).refine((data) => {
  // Business Rule: Para + Abortions should not exceed Gravida
  return data.para + data.abortions <= data.gravida;
}, {
  message: "Para + Abortions cannot exceed total pregnancies (Gravida)",
  path: ["gravida"]
}).refine((data) => {
  // Business Rule: Living children cannot exceed Para
  return data.livingChildren <= data.para;
}, {
  message: "Living children cannot exceed live births (Para)",
  path: ["livingChildren"]
});

export type ObstetricHistory = z.infer<typeof obstetricHistorySchema>;

// Risk Categories
export type ParityCategory = 'nullipara' | 'primipara' | 'multipara' | 'grand_multipara';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskAssessment {
  parityCategory: ParityCategory;
  riskLevel: RiskLevel;
  warnings: string[];
  recommendations: string[];
  requiresSpecialistConsultation: boolean;
}

// Unified Business Rules
export class ObstetricRiskCalculator {
  
  static calculateParityCategory(gravida: number, para: number): ParityCategory {
    if (para === 0) return 'nullipara';
    if (para === 1) return 'primipara';
    if (para >= 2 && para <= 4) return 'multipara';
    return 'grand_multipara';
  }

  static calculateRiskLevel(obstetricHistory: ObstetricHistory): RiskAssessment {
    const { gravida, para, abortions, livingChildren } = obstetricHistory;
    
    const parityCategory = this.calculateParityCategory(gravida, para);
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: RiskLevel = 'low';
    let requiresSpecialistConsultation = false;

    // Grand Multipara Risk Assessment
    if (gravida >= 5) {
      warnings.push("Grand Multiparity (≥5 pregnancies) identified");
      recommendations.push("Enhanced monitoring required");
      recommendations.push("Delivery planning at tertiary care facility");
      riskLevel = 'moderate';
      requiresSpecialistConsultation = true;
    }

    // High Para Risk
    if (para > 6) {
      warnings.push("High parity (>6 live births) - increased obstetric risks");
      recommendations.push("Specialist obstetric consultation required");
      riskLevel = 'high';
      requiresSpecialistConsultation = true;
    }

    // Recurrent Pregnancy Loss
    if (abortions >= 3) {
      warnings.push("Recurrent pregnancy loss (≥3 losses) identified");
      recommendations.push("Specialist consultation for recurrent loss workup");
      riskLevel = 'high';
      requiresSpecialistConsultation = true;
    }

    // High Infant Mortality Rate
    const infantMortalityRate = para > 0 ? ((para - livingChildren) / para) * 100 : 0;
    if (infantMortalityRate > 20 && para >= 2) {
      warnings.push(`High infant mortality rate (${infantMortalityRate.toFixed(1)}%)`);
      recommendations.push("Detailed perinatal history review required");
      recommendations.push("Enhanced antenatal surveillance");
      if (riskLevel === 'low') riskLevel = 'moderate';
    }

    // Nullipara considerations
    if (parityCategory === 'nullipara') {
      recommendations.push("First pregnancy - standard antenatal care protocol");
      recommendations.push("Patient education on labor signs and danger signs");
    }

    // Primipara considerations  
    if (parityCategory === 'primipara') {
      recommendations.push("Second pregnancy - monitor for complications from first pregnancy");
    }

    return {
      parityCategory,
      riskLevel,
      warnings,
      recommendations,
      requiresSpecialistConsultation
    };
  }

  // Validation helper
  static validateObstetricData(data: Partial<ObstetricHistory>): { isValid: boolean; errors: string[] } {
    try {
      obstetricHistorySchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          errors: error.errors.map(err => err.message) 
        };
      }
      return { isValid: false, errors: ["Unknown validation error"] };
    }
  }

  // Field-specific warnings
  static getFieldWarnings(field: keyof ObstetricHistory, value: number): string[] {
    const warnings: string[] = [];

    switch (field) {
      case 'gravida':
        if (value >= 10) warnings.push("High gravidity - enhanced monitoring recommended");
        if (value >= 15) warnings.push("Extremely high gravidity - specialist consultation required");
        break;
      
      case 'para':
        if (value >= 6) warnings.push("High parity - increased obstetric risks");
        if (value >= 10) warnings.push("Extremely high parity - specialist consultation required");
        break;
      
      case 'abortions':
        if (value >= 2) warnings.push("Multiple pregnancy losses - consider specialist consultation");
        if (value >= 3) warnings.push("Recurrent pregnancy loss - specialist workup required");
        break;
      
      case 'livingChildren':
        // Warnings calculated relative to para in main assessment
        break;
    }

    return warnings;
  }
}

// Standard field configurations for consistent UI
export const OBSTETRIC_FIELD_CONFIG = {
  gravida: {
    label: "Gravida (Total pregnancies)",
    min: 1,
    max: 20,
    required: true,
    helpText: "Total number of pregnancies including current"
  },
  para: {
    label: "Para (Live births)",
    min: 0,
    max: 15,
    required: true,
    helpText: "Number of pregnancies that resulted in live birth"
  },
  abortions: {
    label: "Abortions/Miscarriages",
    min: 0,
    max: 10,
    required: true,
    helpText: "Number of pregnancy losses (spontaneous or induced)"
  },
  livingChildren: {
    label: "Living children",
    min: 0,
    max: 15,
    required: true,
    helpText: "Number of children currently alive"
  },
  previousPregnancies: {
    label: "Previous pregnancies (excluding current)",
    min: 0,
    max: 19,
    required: false,
    helpText: "Number of pregnancies before current pregnancy"
  }
} as const;

// Standard styling for consistency
export const OBSTETRIC_INPUT_STYLES = "w-full border-2 border-gray-300 rounded p-2 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none";