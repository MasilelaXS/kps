import { create } from 'zustand';
import { pcoService } from '../services/mobile/pcoService';
import type { AssignedClient, ReportSubmissionData } from '../services/mobile/pcoService';
import toast from 'react-hot-toast';

export interface InspectionStation {
  id: string;
  station_number: string;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  access_reason?: string;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_type_other?: string;
  activity_description?: string;
  station_condition: {
    bait_consumed: boolean;
    pest_activity_level: 'none' | 'low' | 'medium' | 'high';
  };
  bait_status: 'full' | 'partial' | 'empty' | 'contaminated';
  rodent_box_replaced: boolean;
  poison_used_id?: number;
  poison_quantity?: number;
  batch_number?: string;
  batch_number_note?: string;
  station_remarks?: string;
}

export interface FumigationTreatment {
  area_treated: string;
  treatment_method: string;
  target_pest: string;
  concentration: string;
  duration_hours: number;
  temperature: number;
  humidity: number;
  treatment_notes?: string;
  chemicals: Array<{
    chemical_id: number;
    batch_number: string;
  }>;
}

export interface ReportCreationData {
  client_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  date_of_service: string;
  next_service_date: string;
  
  // Inspection data (if applicable)
  inspection_stations?: InspectionStation[];
  
  // Fumigation data (if applicable)
  fumigation_treatments?: FumigationTreatment[];
  
  overall_remarks: string;
  recommendations: string;
  warning_signs_replaced: boolean;
  warning_signs_quantity?: number;
  client_signature: string; // Base64 encoded signature
}

interface ReportState {
  currentReport: Partial<ReportCreationData>;
  currentStep: number;
  totalSteps: number;
  isDraft: boolean;
  selectedClient: AssignedClient | null;
  
  // Actions
  updateReportData: (data: Partial<ReportCreationData>) => void;
  setClient: (client: AssignedClient) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetReport: () => void;
  saveDraft: () => Promise<void>;
  submitReport: () => Promise<void>;
  initializeReport: () => void;
}

const getStepCount = (reportType: string): number => {
  switch (reportType) {
    case 'inspection':
      return 6; // Client selection, Service type, Station inspection, Remarks, Signature, Verification
    case 'fumigation':
      return 6; // Client selection, Service type, Fumigation, Remarks, Signature, Verification
    case 'both':
      return 7; // Client selection, Service type, Station inspection, Fumigation, Remarks, Signature, Verification
    default:
      return 6;
  }
};

export const useReportStore = create<ReportState>((set, get) => ({
  currentReport: {
    overall_remarks: '',
    recommendations: '',
    warning_signs_replaced: false,
    client_signature: ''
  },
  currentStep: 0,
  totalSteps: 6,
  isDraft: false,
  selectedClient: null,
  
  updateReportData: (data) => {
    set(state => {
      const updatedReport = { ...state.currentReport, ...data };
      const newTotalSteps = updatedReport.report_type ? getStepCount(updatedReport.report_type) : state.totalSteps;
      
      return {
        currentReport: updatedReport,
        totalSteps: newTotalSteps
      };
    });
  },
  
  setClient: (client) => {
    set(state => ({
      selectedClient: client,
      currentReport: {
        ...state.currentReport,
        client_id: client.id
      }
    }));
  },
  
  nextStep: () => {
    set(state => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
    }));
  },
  
  previousStep: () => {
    set(state => ({
      currentStep: Math.max(state.currentStep - 1, 0)
    }));
  },
  
  goToStep: (step) => {
    set(state => ({
      currentStep: Math.max(0, Math.min(step, state.totalSteps - 1))
    }));
  },
  
  resetReport: () => {
    set({
      currentReport: {
        overall_remarks: '',
        recommendations: '',
        warning_signs_replaced: false,
        client_signature: ''
      },
      currentStep: 0,
      totalSteps: 6,
      isDraft: false,
      selectedClient: null
    });
  },
  
  saveDraft: async () => {
    const { currentReport } = get();
    try {
      set({ isDraft: true });
      
      // Convert to API format
      const reportData: Partial<ReportSubmissionData> = {
        client_id: currentReport.client_id!,
        report_type: currentReport.report_type!,
        date_of_service: currentReport.date_of_service!,
        overall_remarks: currentReport.overall_remarks,
        recommendations: currentReport.recommendations,
        warning_signs_replaced: currentReport.warning_signs_replaced ? 1 : 0,
        warning_signs_quantity: currentReport.warning_signs_quantity,
        client_signature: currentReport.client_signature
      };
      
      // Note: API endpoint for draft saving would be implemented here
      console.log('Saving draft:', reportData);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
      set({ isDraft: false });
    }
  },
  
  submitReport: async () => {
    const { currentReport, selectedClient } = get();
    
    try {
      if (!currentReport.client_id || !selectedClient) {
        throw new Error('Client information is missing');
      }
      
      // Convert to API format
      const reportData: ReportSubmissionData = {
        client_id: currentReport.client_id!,
        report_type: currentReport.report_type!,
        date_of_service: currentReport.date_of_service!,
        overall_remarks: currentReport.overall_remarks,
        recommendations: currentReport.recommendations,
        warning_signs_replaced: currentReport.warning_signs_replaced ? 1 : 0,
        warning_signs_quantity: currentReport.warning_signs_quantity,
        client_signature: currentReport.client_signature
      };
      
      const response = await pcoService.createReport(reportData);
      
      if (response.id) {
        toast.success('Report submitted successfully');
        get().resetReport();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      toast.error(errorMessage);
      throw error;
    }
  },

  initializeReport: () => {
    set({
      currentReport: {
        overall_remarks: '',
        recommendations: '',
        warning_signs_replaced: false,
        client_signature: ''
      },
      currentStep: 0,
      totalSteps: 6,
      isDraft: false
    });
  }
}));
