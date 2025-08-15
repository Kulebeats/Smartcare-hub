/**
 * Unified Obstetric History Component
 * Provides consistent UI and validation across all three implementations
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ObstetricRiskCalculator, ObstetricHistory, RiskAssessment, OBSTETRIC_FIELD_CONFIG, OBSTETRIC_INPUT_STYLES } from '../../../shared/obstetric-validation';

interface UnifiedObstetricHistoryProps {
  initialData?: Partial<ObstetricHistory>;
  onDataChange?: (data: ObstetricHistory, assessment: RiskAssessment) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  variant?: 'client-profile' | 'obstetric-assessment' | 'emergency-referral';
  showRiskAssessment?: boolean;
  showPreviousPregnancies?: boolean;
  className?: string;
}

export const UnifiedObstetricHistory: React.FC<UnifiedObstetricHistoryProps> = ({
  initialData = {},
  onDataChange,
  onValidationChange,
  variant = 'client-profile',
  showRiskAssessment = true,
  showPreviousPregnancies = false,
  className = ''
}) => {
  const [data, setData] = useState<Partial<ObstetricHistory>>({
    gravida: initialData.gravida || 0,
    para: initialData.para || 0,
    abortions: initialData.abortions || 0,
    livingChildren: initialData.livingChildren || 0,
    previousPregnancies: initialData.previousPregnancies || 0,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [fieldWarnings, setFieldWarnings] = useState<{ [key: string]: string[] }>({});
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Validate and calculate risk assessment
  const validateAndAssess = useCallback(() => {
    const validation = ObstetricRiskCalculator.validateObstetricData(data);
    setErrors(validation.errors);

    if (validation.isValid && data.gravida && data.para !== undefined && data.abortions !== undefined && data.livingChildren !== undefined) {
      const completeData = data as ObstetricHistory;
      const assessment = ObstetricRiskCalculator.calculateRiskLevel(completeData);
      setRiskAssessment(assessment);
      
      // Call parent handlers
      onDataChange?.(completeData, assessment);
      onValidationChange?.(true, []);
    } else {
      setRiskAssessment(null);
      onValidationChange?.(false, validation.errors);
    }

    // Update field warnings
    const newFieldWarnings: { [key: string]: string[] } = {};
    Object.entries(data).forEach(([field, value]) => {
      if (typeof value === 'number' && value > 0) {
        newFieldWarnings[field] = ObstetricRiskCalculator.getFieldWarnings(field as keyof ObstetricHistory, value);
      }
    });
    setFieldWarnings(newFieldWarnings);
  }, [data, onDataChange, onValidationChange]);

  useEffect(() => {
    validateAndAssess();
  }, [validateAndAssess]);

  const handleFieldChange = (field: keyof ObstetricHistory, value: string) => {
    const numValue = parseInt(value) || 0;
    setData(prev => ({ ...prev, [field]: numValue }));
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';  
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getParityCategoryDisplay = (category: string) => {
    switch (category) {
      case 'nullipara': return 'Nullipara (No previous births)';
      case 'primipara': return 'Primipara (One previous birth)';
      case 'multipara': return 'Multipara (2-4 previous births)';
      case 'grand_multipara': return 'Grand Multipara (5+ previous births)';
      default: return category;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-4 gap-3">
        {/* Gravida */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">
            {OBSTETRIC_FIELD_CONFIG.gravida.label}
            {OBSTETRIC_FIELD_CONFIG.gravida.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            min={OBSTETRIC_FIELD_CONFIG.gravida.min}
            max={OBSTETRIC_FIELD_CONFIG.gravida.max}
            value={data.gravida || ''}
            onChange={(e) => handleFieldChange('gravida', e.target.value)}
            className={OBSTETRIC_INPUT_STYLES}
            title={OBSTETRIC_FIELD_CONFIG.gravida.helpText}
          />
          {fieldWarnings.gravida?.map((warning, idx) => (
            <div key={idx} className="text-xs text-amber-600 font-medium">{warning}</div>
          ))}
        </div>

        {/* Para */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">
            {OBSTETRIC_FIELD_CONFIG.para.label}
            {OBSTETRIC_FIELD_CONFIG.para.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            min={OBSTETRIC_FIELD_CONFIG.para.min}
            max={OBSTETRIC_FIELD_CONFIG.para.max}
            value={data.para || ''}
            onChange={(e) => handleFieldChange('para', e.target.value)}
            className={OBSTETRIC_INPUT_STYLES}
            title={OBSTETRIC_FIELD_CONFIG.para.helpText}
          />
          {fieldWarnings.para?.map((warning, idx) => (
            <div key={idx} className="text-xs text-amber-600 font-medium">{warning}</div>
          ))}
        </div>

        {/* Abortions */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">
            {OBSTETRIC_FIELD_CONFIG.abortions.label}
            {OBSTETRIC_FIELD_CONFIG.abortions.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            min={OBSTETRIC_FIELD_CONFIG.abortions.min}
            max={OBSTETRIC_FIELD_CONFIG.abortions.max}
            value={data.abortions || ''}
            onChange={(e) => handleFieldChange('abortions', e.target.value)}
            className={OBSTETRIC_INPUT_STYLES}
            title={OBSTETRIC_FIELD_CONFIG.abortions.helpText}
          />
          {fieldWarnings.abortions?.map((warning, idx) => (
            <div key={idx} className="text-xs text-amber-600 font-medium">{warning}</div>
          ))}
        </div>

        {/* Living Children */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">
            {OBSTETRIC_FIELD_CONFIG.livingChildren.label}
            {OBSTETRIC_FIELD_CONFIG.livingChildren.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            min={OBSTETRIC_FIELD_CONFIG.livingChildren.min}
            max={OBSTETRIC_FIELD_CONFIG.livingChildren.max}
            value={data.livingChildren || ''}
            onChange={(e) => handleFieldChange('livingChildren', e.target.value)}
            className={OBSTETRIC_INPUT_STYLES}
            title={OBSTETRIC_FIELD_CONFIG.livingChildren.helpText}
          />
          {fieldWarnings.livingChildren?.map((warning, idx) => (
            <div key={idx} className="text-xs text-amber-600 font-medium">{warning}</div>
          ))}
        </div>
      </div>

      {/* Previous Pregnancies (conditional) */}
      {showPreviousPregnancies && (
        <div className="space-y-1">
          <label className="block text-xs font-medium">
            {OBSTETRIC_FIELD_CONFIG.previousPregnancies.label}
          </label>
          <input
            type="number"
            min={OBSTETRIC_FIELD_CONFIG.previousPregnancies.min}
            max={OBSTETRIC_FIELD_CONFIG.previousPregnancies.max}
            value={data.previousPregnancies || ''}
            onChange={(e) => handleFieldChange('previousPregnancies', e.target.value)}
            className={`w-20 ${OBSTETRIC_INPUT_STYLES}`}
            title={OBSTETRIC_FIELD_CONFIG.previousPregnancies.helpText}
          />
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="p-2 bg-red-50 border border-red-200 rounded">
          <div className="text-xs font-medium text-red-700 mb-1">Validation Errors:</div>
          {errors.map((error, idx) => (
            <div key={idx} className="text-xs text-red-600">{error}</div>
          ))}
        </div>
      )}

      {/* Risk Assessment Display */}
      {showRiskAssessment && riskAssessment && (
        <div className="p-3 border rounded bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h6 className="text-sm font-semibold text-gray-800">Obstetric Risk Assessment</h6>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
              {riskAssessment.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          <div className="text-sm text-gray-700">
            <strong>Parity Classification:</strong> {getParityCategoryDisplay(riskAssessment.parityCategory)}
          </div>

          {riskAssessment.warnings.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-amber-700">Clinical Alerts:</div>
              {riskAssessment.warnings.map((warning, idx) => (
                <div key={idx} className="text-xs text-amber-600 bg-amber-50 p-1 rounded">{warning}</div>
              ))}
            </div>
          )}

          {riskAssessment.recommendations.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-blue-700">Clinical Recommendations:</div>
              {riskAssessment.recommendations.map((rec, idx) => (
                <div key={idx} className="text-xs text-blue-600 bg-blue-50 p-1 rounded">{rec}</div>
              ))}
            </div>
          )}

          {riskAssessment.requiresSpecialistConsultation && (
            <div className="text-xs font-medium text-red-700 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ Specialist obstetric consultation required
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedObstetricHistory;