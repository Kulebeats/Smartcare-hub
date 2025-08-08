import React from "react";
import { AlertTriangle } from "lucide-react";

interface ClientHealthHistorySectionProps {
  context?: 'referral' | 'standard';
  onUpdateData?: (data: any) => void;
}

export function ClientHealthHistorySection({ 
  context = 'standard', 
  onUpdateData 
}: ClientHealthHistorySectionProps) {
  return (
    <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-blue-700">Client Health History Information</h4>
        {context === 'referral' && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Required for all referrals</span>
        )}
      </div>
      
      {/* Current Pregnancy Information */}
      <div className="space-y-3 border border-blue-300 rounded p-3 bg-white">
        <h5 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1">Current Pregnancy Information</h5>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Gestational age (weeks) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              id={`${context}_ga_weeks`}
              min="4" 
              max="42" 
              className="w-full border rounded p-2"
              required
              onChange={(e) => {
                const gaWeeks = parseInt(e.target.value);
                const trimesterInfo = document.getElementById(`${context}-trimester-info`);
                const riskAssessment = document.getElementById(`${context}-ga-risk-assessment`);
                
                let trimester = '';
                let riskLevel = '';
                let riskColor = '';
                
                if (gaWeeks >= 4 && gaWeeks <= 13) {
                  trimester = 'First Trimester (4-13 weeks)';
                  riskLevel = 'Standard monitoring required';
                  riskColor = 'text-green-600';
                } else if (gaWeeks >= 14 && gaWeeks <= 27) {
                  trimester = 'Second Trimester (14-27 weeks)';
                  riskLevel = 'Standard monitoring required';
                  riskColor = 'text-green-600';
                } else if (gaWeeks >= 28 && gaWeeks <= 36) {
                  trimester = 'Third Trimester (28-36 weeks)';
                  riskLevel = 'Enhanced monitoring required';
                  riskColor = 'text-orange-600';
                } else if (gaWeeks >= 37) {
                  trimester = 'Term Pregnancy (37+ weeks)';
                  riskLevel = 'Delivery preparation required';
                  riskColor = 'text-red-600';
                }
                
                if (trimesterInfo && riskAssessment) {
                  trimesterInfo.textContent = trimester;
                  riskAssessment.textContent = riskLevel;
                  riskAssessment.className = `text-xs font-medium ${riskColor}`;
                }
                
                // Notify parent component of data changes
                if (onUpdateData) {
                  onUpdateData({ gestationalAge: gaWeeks, trimester, riskLevel });
                }
              }}
            />
            <div id={`${context}-trimester-info`} className="text-xs text-gray-600"></div>
            <div id={`${context}-ga-risk-assessment`} className="text-xs font-medium"></div>
          </div>
        </div>
      </div>

      {/* Obstetric Assessment Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium">Para (Live births)</label>
          <input 
            type="number" 
            id={`${context}_para`}
            min="0" 
            max="20"
            className="w-full border rounded p-2 text-sm" 
            onChange={(e) => {
              const para = parseInt(e.target.value) || 0;
              const gravida = parseInt((document.getElementById(`${context}_gravida`) as HTMLInputElement)?.value || '0');
              const abortions = parseInt((document.getElementById(`${context}_abortions`) as HTMLInputElement)?.value || '0');
              const validationMessage = document.getElementById(`${context}-obstetric-validation`);
              
              // Clinical Business Rules: Para validation
              if (validationMessage) {
                if (para > 15) {
                  validationMessage.innerHTML = '<div class="text-red-600 text-xs font-medium flex items-center gap-1"><div class="w-2 h-2 bg-red-600 rounded-full"></div>Para > 15: Very high-risk pregnancy. Immediate specialist consultation required.</div>';
                  validationMessage.style.display = 'block';
                } else if (para >= 5) {
                  validationMessage.innerHTML = '<div class="text-amber-600 text-xs font-medium flex items-center gap-1"><div class="w-2 h-2 bg-amber-600 rounded-full"></div>Para ≥ 5: High parity risk. Enhanced monitoring recommended.</div>';
                  validationMessage.style.display = 'block';
                } else {
                  validationMessage.style.display = 'none';
                }
              }
              
              // Show high parity warning
              const highParityWarning = document.getElementById(`${context}-high-parity-warning`);
              if (highParityWarning) {
                highParityWarning.style.display = para >= 5 ? 'block' : 'none';
              }
              
              if (onUpdateData) {
                onUpdateData({ para, gravida, abortions });
              }
            }}
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-xs font-medium">Gravida (Total pregnancies)</label>
          <input 
            type="number" 
            id={`${context}_gravida`}
            min="0" 
            max="20"
            className="w-full border rounded p-2 text-sm" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-xs font-medium">Abortions</label>
          <input 
            type="number" 
            id={`${context}_abortions`}
            min="0" 
            max="10"
            className="w-full border rounded p-2 text-sm" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-xs font-medium">Living children</label>
          <input 
            type="number" 
            id={`${context}_living_children`}
            min="0" 
            max="20"
            className="w-full border rounded p-2 text-sm" 
          />
        </div>
      </div>

      {/* Validation Messages */}
      <div id={`${context}-obstetric-validation`} className="p-2 bg-red-50 border border-red-200 rounded" style={{ display: 'none' }}></div>
      
      {/* High Parity Warning */}
      <div id={`${context}-high-parity-warning`} className="p-3 bg-amber-50 border border-amber-200 rounded" style={{ display: 'none' }}>
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">High Parity Risk Assessment</p>
            <p className="text-xs text-amber-700">Client has 5+ live births. Monitor for increased risk of complications and hemorrhage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}