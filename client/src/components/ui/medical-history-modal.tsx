import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  saveButtonText?: string;
  closeButtonText?: string;
  isSaving?: boolean;
}

export const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  size = 'lg',
  saveButtonText = 'Save',
  closeButtonText = 'Close',
  isSaving = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Focus trap and scroll lock effects
  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = originalOverflow;
      
      // Restore focus to the previously active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap within modal
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          relative z-10 w-full ${sizeClasses[size]} mx-4 
          bg-white rounded-2xl shadow-2xl 
          flex flex-col max-h-[90vh]
          transform transition-all duration-200 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            id="modal-title" 
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="
              p-2 rounded-lg text-gray-400 hover:text-gray-600 
              hover:bg-gray-100 transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="
                px-4 py-2 text-sm font-medium text-gray-700 
                bg-white border border-gray-300 rounded-lg
                hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              {closeButtonText}
            </button>
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="
                  px-4 py-2 text-sm font-medium text-white 
                  bg-blue-600 border border-transparent rounded-lg
                  hover:bg-blue-700 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150
                  flex items-center space-x-2
                "
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saveButtonText}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render in portal to ensure proper z-index stacking
  return createPortal(modalContent, document.body);
};

export default MedicalHistoryModal;