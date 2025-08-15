/**
 * Dynamic Emergency Referral Checklist Component
 * Prioritizes checklist items based on danger signs
 */
import React, { useState, useEffect } from 'react';
import { EmergencyChecklistPrioritizer, ChecklistItem } from '../../../../shared/emergency-checklist-mapping';

interface DynamicEmergencyChecklistProps {
  dangerSigns: string[];
  onChecklistChange?: (completedItems: string[], totalItems: number) => void;
  className?: string;
  showClinicalFocus?: boolean;
}

export const DynamicEmergencyChecklist: React.FC<DynamicEmergencyChecklistProps> = ({
  dangerSigns,
  onChecklistChange,
  className = '',
  showClinicalFocus = true
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  // Organize items based on danger signs
  const organizedItems = EmergencyChecklistPrioritizer.organizeChecklistItems(dangerSigns);
  
  useEffect(() => {
    // Notify parent of checklist completion status
    const totalItems = organizedItems.critical.length + organizedItems.secondary.length + organizedItems.standard.length;
    onChecklistChange?.(Array.from(checkedItems), totalItems);
  }, [checkedItems, organizedItems, onChecklistChange]);

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const renderChecklistSection = (
    title: string, 
    items: ChecklistItem[], 
    priority: 'critical' | 'secondary' | 'standard'
  ) => {
    if (items.length === 0) return null;

    const priorityStyles = {
      critical: {
        containerClass: 'border-red-300 bg-red-50',
        headerClass: 'text-red-800 bg-red-100',
        iconColor: 'text-red-600',
        badgeClass: 'bg-red-600 text-white'
      },
      secondary: {
        containerClass: 'border-orange-300 bg-orange-50',
        headerClass: 'text-orange-800 bg-orange-100', 
        iconColor: 'text-orange-600',
        badgeClass: 'bg-orange-600 text-white'
      },
      standard: {
        containerClass: 'border-blue-300 bg-blue-50',
        headerClass: 'text-blue-800 bg-blue-100',
        iconColor: 'text-blue-600',
        badgeClass: 'bg-blue-600 text-white'
      }
    };

    const styles = priorityStyles[priority];
    const completedCount = items.filter(item => checkedItems.has(item.id)).length;

    return (
      <div className={`border rounded-lg p-3 space-y-2 ${styles.containerClass}`}>
        <div className={`flex items-center justify-between p-2 rounded ${styles.headerClass}`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{title}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${styles.badgeClass}`}>
            {completedCount}/{items.length}
          </span>
        </div>
        
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`checklist-${item.id}`}
                checked={checkedItems.has(item.id)}
                onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`checklist-${item.id}`}
                className={`text-sm cursor-pointer flex-1 ${
                  checkedItems.has(item.id) 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-800'
                }`}
              >
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalItems = organizedItems.critical.length + organizedItems.secondary.length + organizedItems.standard.length;
  const completedItems = checkedItems.size;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clinical Focus Banner */}
      {showClinicalFocus && organizedItems.clinicalFocus && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">🎯</span>
            <span className="font-medium text-blue-800 text-sm">Clinical Focus:</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">{organizedItems.clinicalFocus}</p>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Checklist Progress</span>
          <span className="text-sm font-bold text-gray-800">{completedItems}/{totalItems} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Checklist Sections */}
      {renderChecklistSection('Critical Actions', organizedItems.critical, 'critical')}
      {renderChecklistSection('Secondary Actions', organizedItems.secondary, 'secondary')}
      {renderChecklistSection('Standard Procedures', organizedItems.standard, 'standard')}

      {/* Emergency Action Summary */}
      {dangerSigns.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-600">
            <strong>Active Emergency Protocols:</strong> {dangerSigns.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicEmergencyChecklist;