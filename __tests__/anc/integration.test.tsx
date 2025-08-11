/**
 * ANC Module Integration Tests
 * Tests for integrated functionality across all ANC components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ANCTabsPage } from '../../client/src/pages/anc/ANCTabsPage';

// Mock the router
jest.mock('wouter', () => ({
  useParams: () => ({ patientId: 'test-patient-123' }),
  useLocation: () => ['/anc/test-patient-123', jest.fn()],
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

// Mock API calls
global.fetch = jest.fn();

describe('ANC Module Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Tab Navigation', () => {
    it('should render all tab buttons', () => {
      renderWithProviders(<ANCTabsPage />);
      
      expect(screen.getByText('Rapid Assessment')).toBeInTheDocument();
      expect(screen.getByText('Client Profile')).toBeInTheDocument();
      expect(screen.getByText('Examination')).toBeInTheDocument();
      expect(screen.getByText('Labs & Tests')).toBeInTheDocument();
      expect(screen.getByText('Counseling')).toBeInTheDocument();
      expect(screen.getByText('Referral')).toBeInTheDocument();
      expect(screen.getByText('PMTCT')).toBeInTheDocument();
    });

    it('should switch between tabs when clicked', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Initially on Rapid Assessment tab
      expect(screen.getByText('Rapid Assessment')).toHaveClass('bg-blue-600');
      
      // Click on Client Profile tab
      fireEvent.click(screen.getByText('Client Profile'));
      
      await waitFor(() => {
        expect(screen.getByText('Client Profile')).toHaveClass('bg-blue-600');
      });
    });

    it('should maintain tab state during navigation', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Navigate to Examination tab
      fireEvent.click(screen.getByText('Examination'));
      
      // Fill in some data (mock)
      const input = screen.getByLabelText('Blood Pressure Systolic');
      fireEvent.change(input, { target: { value: '120' } });
      
      // Navigate to another tab
      fireEvent.click(screen.getByText('Labs & Tests'));
      
      // Come back to Examination
      fireEvent.click(screen.getByText('Examination'));
      
      // Data should be preserved
      await waitFor(() => {
        const savedInput = screen.getByLabelText('Blood Pressure Systolic');
        expect(savedInput).toHaveValue('120');
      });
    });
  });

  describe('Clinical Decision Support Integration', () => {
    it('should trigger danger sign alerts when critical values are entered', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alerts: [] })
      });

      renderWithProviders(<ANCTabsPage />);
      
      // Navigate to Examination tab
      fireEvent.click(screen.getByText('Examination'));
      
      // Enter critical blood pressure
      const systolicInput = screen.getByLabelText('Systolic');
      const diastolicInput = screen.getByLabelText('Diastolic');
      
      fireEvent.change(systolicInput, { target: { value: '170' } });
      fireEvent.change(diastolicInput, { target: { value: '115' } });
      
      // Alert should appear
      await waitFor(() => {
        expect(screen.getByText(/Severe hypertension detected/i)).toBeInTheDocument();
      });
    });

    it('should show immediate referral recommendation for danger signs', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Check danger signs in Rapid Assessment
      const vaginalBleedingCheckbox = screen.getByLabelText('Vaginal bleeding');
      fireEvent.click(vaginalBleedingCheckbox);
      
      // Immediate referral alert should appear
      await waitFor(() => {
        expect(screen.getByText(/IMMEDIATE REFERRAL REQUIRED/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Between Tabs', () => {
    it('should pass vital signs data from Examination to Referral tab', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Enter vital signs in Examination tab
      fireEvent.click(screen.getByText('Examination'));
      
      const bpSystolic = screen.getByLabelText('Systolic');
      fireEvent.change(bpSystolic, { target: { value: '140' } });
      
      // Navigate to Referral tab
      fireEvent.click(screen.getByText('Referral'));
      
      // Vital signs should be available in referral summary
      await waitFor(() => {
        expect(screen.getByText(/Blood Pressure: 140/i)).toBeInTheDocument();
      });
    });

    it('should calculate gestational age across all tabs', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Enter LMP in Client Profile
      fireEvent.click(screen.getByText('Client Profile'));
      
      const lmpInput = screen.getByLabelText('Last Menstrual Period');
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      fireEvent.change(lmpInput, { 
        target: { value: threeMonthsAgo.toISOString().split('T')[0] } 
      });
      
      // Check gestational age is calculated
      await waitFor(() => {
        expect(screen.getByText(/Gestational Age: 12 weeks/i)).toBeInTheDocument();
      });
      
      // Navigate to other tabs and verify GA is available
      fireEvent.click(screen.getByText('Examination'));
      expect(screen.getByText(/Second Trimester/i)).toBeInTheDocument();
    });
  });

  describe('PMTCT Integration', () => {
    it('should show ART management only for HIV positive patients', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Navigate to PMTCT tab
      fireEvent.click(screen.getByText('PMTCT'));
      
      // Initially ART section should not be visible
      expect(screen.queryByText('ART Management')).not.toBeInTheDocument();
      
      // Select HIV positive
      const hivStatusSelect = screen.getByLabelText('HIV Test Result');
      fireEvent.change(hivStatusSelect, { target: { value: 'positive' } });
      
      // ART Management section should appear
      await waitFor(() => {
        expect(screen.getByText('ART Management')).toBeInTheDocument();
      });
    });

    it('should calculate transmission risk based on viral load', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      fireEvent.click(screen.getByText('PMTCT'));
      
      // Set HIV positive
      const hivStatusSelect = screen.getByLabelText('HIV Test Result');
      fireEvent.change(hivStatusSelect, { target: { value: 'positive' } });
      
      // Check on ART
      const onARTCheckbox = screen.getByLabelText('Currently on ART');
      fireEvent.click(onARTCheckbox);
      
      // Enter viral load
      const viralLoadInput = screen.getByLabelText('Last Viral Load');
      fireEvent.change(viralLoadInput, { target: { value: '40' } });
      
      // Risk should be calculated
      await waitFor(() => {
        expect(screen.getByText(/Transmission Risk: VERY LOW/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields before saving', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      // Try to save without required fields
      const saveButton = screen.getByText('Save & Continue');
      fireEvent.click(saveButton);
      
      // Validation errors should appear
      await waitFor(() => {
        expect(screen.getByText(/Required fields missing/i)).toBeInTheDocument();
      });
    });

    it('should validate date ranges', async () => {
      renderWithProviders(<ANCTabsPage />);
      
      fireEvent.click(screen.getByText('Client Profile'));
      
      // Enter future LMP date
      const lmpInput = screen.getByLabelText('Last Menstrual Period');
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      
      fireEvent.change(lmpInput, { 
        target: { value: futureDate.toISOString().split('T')[0] } 
      });
      
      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/LMP cannot be in the future/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should save encounter data to backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'encounter-123',
          status: 'saved' 
        })
      });

      renderWithProviders(<ANCTabsPage />);
      
      // Fill some data
      const gravida = screen.getByLabelText('Gravida');
      fireEvent.change(gravida, { target: { value: '2' } });
      
      // Save
      const saveButton = screen.getByText('Save & Continue');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/anc/encounter'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('gravida')
          })
        );
      });
    });

    it('should load existing encounter data', async () => {
      const mockEncounter = {
        id: 'encounter-123',
        patientId: 'test-patient-123',
        gravida: 3,
        para: 2,
        gestationalAgeWeeks: 20
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEncounter
      });

      renderWithProviders(<ANCTabsPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // Gravida
        expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Para
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(<ANCTabsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to load encounter data/i)).toBeInTheDocument();
      });
    });

    it('should show retry option on error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ encounters: [] })
        });

      renderWithProviders(<ANCTabsPage />);
      
      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();
      });
      
      // Click retry
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});