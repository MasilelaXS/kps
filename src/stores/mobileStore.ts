import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  DashboardData, 
  AssignedClient, 
  ClientDetails, 
  ReportData, 
  ReportDraft,
  ReportSubmission,
  InspectionStation,
  FumigationChemical,
  Chemical
} from '../types/mobile';
import { mobileService } from '../services/mobileService';
import { useAuthStore } from './authStore';

// Store interface
interface MobileStoreState {
  // Dashboard data
  dashboardData: DashboardData | null;
  isDashboardLoading: boolean;
  
  // Client data
  assignedClients: AssignedClient[];
  selectedClient: ClientDetails | null;
  isClientsLoading: boolean;
  
  // Report creation state
  currentReport: Partial<ReportData> | null;
  reportInProgress: boolean;
  currentStep: string;
  hasUnsavedChanges: boolean;
  
  // Chemical data
  chemicals: Chemical[];
  
  // Draft management
  drafts: ReportDraft[];
  
  // UI state
  error: string | null;
  isLoading: boolean;
}

interface MobileStoreActions {
  // Dashboard actions
  loadDashboard: () => Promise<void>;
  
  // Client actions
  loadClients: (search?: string) => Promise<void>;
  selectClient: (clientId: number) => Promise<void>;
  clearSelectedClient: () => void;
  
  // Report actions
  startReport: (clientId: number, reportType: 'inspection' | 'fumigation' | 'both', callback?: () => void) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  setCurrentStep: (step: string) => void;
  clearCurrentReport: () => void;
  
  // Station management
  addStation: (station: InspectionStation) => void;
  updateStation: (index: number, station: InspectionStation) => void;
  removeStation: (index: number) => void;
  
  // Chemical management
  loadChemicals: () => Promise<void>;
  addChemical: (chemical: FumigationChemical) => void;
  removeChemical: (index: number) => void;
  addFumigationChemical: (chemical: FumigationChemical) => void;
  updateFumigationChemical: (index: number, chemical: FumigationChemical) => void;
  removeFumigationChemical: (index: number) => void;
  
  // Report submission
  submitReport: () => Promise<{ success: boolean; message: string; reportId?: number }>;
  
  // Draft management
  saveDraft: () => Promise<void>;
  loadDraft: (draftId: string) => void;
  clearDraft: () => void;
  getDrafts: () => ReportDraft[];
  
  // Utility actions
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

type MobileStore = MobileStoreState & MobileStoreActions;

const initialState: MobileStoreState = {
  dashboardData: null,
  isDashboardLoading: false,
  assignedClients: [],
  selectedClient: null,
  isClientsLoading: false,
  currentReport: null,
  reportInProgress: false,
  currentStep: 'basic-info',
  hasUnsavedChanges: false,
  chemicals: [],
  drafts: [],
  error: null,
  isLoading: false,
};

export const useMobileStore = create<MobileStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Dashboard actions
      loadDashboard: async () => {
        set({ isDashboardLoading: true, error: null });
        try {
          // Get the current user's pco_id from auth store
          const authState = useAuthStore.getState();
          const pcoId = authState.user?.id;
          
          const dashboardData = await mobileService.getDashboard(pcoId);
          set({ dashboardData, isDashboardLoading: false });
        } catch (error) {
          console.error('Failed to load dashboard:', error);
          set({ 
            error: 'Failed to load dashboard data',
            isDashboardLoading: false 
          });
        }
      },

      // Client actions
      loadClients: async (search?: string) => {
        set({ isClientsLoading: true, error: null });
        try {
          // Get the current user's pco_id from auth store
          const authState = useAuthStore.getState();
          const pcoId = authState.user?.id;
          
          const clients = await mobileService.getAssignedClients(search, pcoId);
          set({ assignedClients: clients, isClientsLoading: false });
        } catch (error) {
          console.error('Failed to load clients:', error);
          set({ 
            error: 'Failed to load clients',
            isClientsLoading: false 
          });
        }
      },

      selectClient: async (clientId: number) => {
        set({ isLoading: true, error: null });
        try {
          const client = await mobileService.getClientDetails(clientId);
          set({ selectedClient: client, isLoading: false });
        } catch (error) {
          console.error('Failed to load client details:', error);
          set({ 
            error: 'Failed to load client details',
            isLoading: false 
          });
        }
      },

      clearSelectedClient: () => {
        set({ selectedClient: null });
      },

      // Report actions
      startReport: (clientId: number, reportType: 'inspection' | 'fumigation' | 'both', callback?: () => void) => {
        const currentState = get();
        
        if (!clientId) {
          console.error('No client ID provided for report creation');
          return;
        }

        // Find the client from assignedClients using the provided clientId
        const client = currentState.assignedClients.find(c => c.id === clientId);
        
        if (!client) {
          console.error('Client not found in assigned clients', { 
            clientId, 
            availableClients: currentState.assignedClients.map(c => ({ id: c.id, name: c.name }))
          });
          return;
        }

        console.log('startReport debug:', { 
          clientId, 
          client,
          reportType
        });

        // Convert single report type to array format
        const reportTypes: ('inspection' | 'fumigation')[] = 
          reportType === 'both' ? ['inspection', 'fumigation'] : [reportType];

        const newReport: Partial<ReportData> = {
          id: `draft_${Date.now()}`, // Add a temporary ID for the draft
          client_id: clientId,
          client: client, // Use the found client data
          assigned_pco: 'Current PCO', // Will be set from auth context
          report_type: reportType,
          report_types: reportTypes,
          service_date: new Date().toISOString().split('T')[0],
          date_of_service: new Date().toISOString().split('T')[0],
          inspection_stations: [],
          fumigation_chemicals: [],
          inspection_remarks: {
            warning_signs_replaced: false,
            warning_signs_qty: 0,
            inspection_notes: '',
          },
          fumigation: {
            treated_areas: [],
            target_pests: [],
            chemicals_used: [],
            application_method: '',
            fumigation_notes: '',
          },
          overall_remarks: '',
          next_service_date: '',
          client_signature: {
            client_name: '',
            signature_data: '',
            signed_at: ''
          }
        };

        console.log('Starting new report:', newReport);

        set({ 
          currentReport: newReport,
          reportInProgress: true,
          currentStep: 'basic-info',
          hasUnsavedChanges: false 
        });

        // Execute callback after state is set
        if (callback) {
          callback();
        }
      },

      updateReportData: (data: Partial<ReportData>) => {
        const current = get().currentReport;
        if (current) {
          set({ 
            currentReport: { ...current, ...data },
            hasUnsavedChanges: true 
          });
        }
      },

      setCurrentStep: (step: string) => {
        set({ currentStep: step });
      },

      clearCurrentReport: () => {
        set({ 
          currentReport: null,
          reportInProgress: false,
          currentStep: '',
          hasUnsavedChanges: false
        });
      },

      // Station management
      addStation: (station: InspectionStation) => {
        const current = get().currentReport;
        if (current && current.inspection_stations) {
          const updatedStations = [...current.inspection_stations, station];
          set({ 
            currentReport: { 
              ...current, 
              inspection_stations: updatedStations 
            },
            hasUnsavedChanges: true 
          });
        }
      },

      updateStation: (index: number, station: InspectionStation) => {
        const current = get().currentReport;
        if (current && current.inspection_stations) {
          const updatedStations = [...current.inspection_stations];
          updatedStations[index] = station;
          set({ 
            currentReport: { 
              ...current, 
              inspection_stations: updatedStations 
            },
            hasUnsavedChanges: true 
          });
        }
      },

      removeStation: (index: number) => {
        const current = get().currentReport;
        if (current && current.inspection_stations) {
          const updatedStations = current.inspection_stations.filter((_, i) => i !== index);
          set({ 
            currentReport: { 
              ...current, 
              inspection_stations: updatedStations 
            },
            hasUnsavedChanges: true 
          });
        }
      },

      // Chemical management
      loadChemicals: async () => {
        try {
          const chemicals = await mobileService.getChemicals();
          set({ chemicals });
        } catch (error) {
          console.error('Failed to load chemicals:', error);
        }
      },

      addChemical: (chemical: FumigationChemical) => {
        const current = get().currentReport;
        if (current) {
          const currentChemicals = current.fumigation?.chemicals_used || [];
          const updatedChemicals = [...currentChemicals, chemical];
          set({ 
            currentReport: { 
              ...current, 
              fumigation: {
                ...current.fumigation,
                treated_areas: current.fumigation?.treated_areas || [],
                target_pests: current.fumigation?.target_pests || [],
                chemicals_used: updatedChemicals,
                application_method: current.fumigation?.application_method || '',
                fumigation_notes: current.fumigation?.fumigation_notes || ''
              }
            },
            hasUnsavedChanges: true 
          });
        }
      },

      removeChemical: (index: number) => {
        const current = get().currentReport;
        if (current && current.fumigation?.chemicals_used) {
          const updatedChemicals = current.fumigation.chemicals_used.filter((_, i) => i !== index);
          set({ 
            currentReport: { 
              ...current, 
              fumigation: {
                ...current.fumigation,
                chemicals_used: updatedChemicals
              }
            },
            hasUnsavedChanges: true 
          });
        }
      },

      addFumigationChemical: (chemical: FumigationChemical) => {
        const current = get().currentReport;
        if (current) {
          const updatedChemicals = [...(current.fumigation_chemicals || []), chemical];
          set({ 
            currentReport: { 
              ...current, 
              fumigation_chemicals: updatedChemicals
            },
            hasUnsavedChanges: true 
          });
        }
      },

      updateFumigationChemical: (index: number, chemical: FumigationChemical) => {
        const current = get().currentReport;
        if (current && current.fumigation_chemicals) {
          const updatedChemicals = [...current.fumigation_chemicals];
          updatedChemicals[index] = chemical;
          set({ 
            currentReport: { 
              ...current, 
              fumigation_chemicals: updatedChemicals
            },
            hasUnsavedChanges: true 
          });
        }
      },

      removeFumigationChemical: (index: number) => {
        const current = get().currentReport;
        if (current && current.fumigation_chemicals) {
          const updatedChemicals = current.fumigation_chemicals.filter((_, i) => i !== index);
          set({ 
            currentReport: { 
              ...current, 
              fumigation_chemicals: updatedChemicals
            },
            hasUnsavedChanges: true 
          });
        }
      },

      // Report submission
      submitReport: async () => {
        const current = get().currentReport;
        if (!current || !current.client_id) {
          throw new Error('No report data to submit');
        }

        set({ isLoading: true, error: null });
        
        try {
          // Validate required fields
          if (!current.report_type) {
            throw new Error('Report type is required');
          }
          if (!current.date_of_service) {
            throw new Error('Date of service is required');
          }

          // Helper function to format date to YYYY-MM-DD
          const formatDateForMySQL = (dateString: string, useToday: boolean = false): string => {
            if (!dateString || dateString.trim() === '') {
              if (useToday) {
                // Return today's date in YYYY-MM-DD format
                const today = new Date();
                return today.toISOString().split('T')[0];
              }
              return '';
            }
            
            try {
              const date = new Date(dateString);
              if (isNaN(date.getTime())) {
                if (useToday) {
                  const today = new Date();
                  return today.toISOString().split('T')[0];
                }
                return '';
              }
              
              // Format as YYYY-MM-DD
              return date.toISOString().split('T')[0];
            } catch {
              if (useToday) {
                const today = new Date();
                return today.toISOString().split('T')[0];
              }
              return '';
            }
          };

          // Generate a 6-digit report ID
          const generateReportId = (): number => {
            return Math.floor(100000 + Math.random() * 900000); // Generates 6-digit number between 100000-999999
          };

          const generatedReportId = generateReportId();

          // Map our ReportData to the backend ReportSubmission format
          const submissionData: ReportSubmission = {
            report_id: generatedReportId,
            client_id: current.client_id,
            report_type: current.report_type,
            date_of_service: formatDateForMySQL(current.date_of_service),
            overall_remarks: current.overall_remarks || '',
            warning_signs_replaced: current.inspection_remarks?.warning_signs_replaced ? 1 : 0,
            warning_signs_quantity: current.inspection_remarks?.warning_signs_qty || 0,
            recommendations: current.recommendations || current.inspection_remarks?.inspection_notes || '',
            next_service_date: formatDateForMySQL(current.next_service_date || '', true), // Use today as default
            client_name: current.client_signature?.client_name || '',
            client_signature: current.client_signature?.signature_data || '',
            
            // Map inspection stations to backend format
            stations: (current.inspection_stations || []).map(station => ({
              station_number: station.station_number, // Keep as number per API spec
              location: station.location,
              is_accessible: station.is_accessible ? 1 : 0,
              access_reason: station.access_reason || '',
              has_activity: station.has_activity ? 1 : 0,
              activity_type: station.has_activity && station.activity_type ? station.activity_type : 'droppings', // Default to 'droppings' instead of null
              activity_type_other: station.activity_type_other || '',
              activity_description: station.activity_description || '',
              station_condition: station.station_condition || ['good'], // Use from station or default
              bait_status: station.bait_status || 'eaten',
              rodent_box_replaced: station.rodent_box_replaced ? 1 : 0,
              poison_used_id: station.poison_used_id || 0,
              poison_quantity: station.poison_quantity || 0,
              batch_number: station.batch_number || '',
              batch_number_note: station.batch_number_note || '',
              station_remarks: station.station_remarks || ''
            })),
            
            // Map fumigation data to backend format
            fumigation: {
              treated_areas: current.fumigation?.treated_areas || [],
              treated_for: current.fumigation?.target_pests || [],
              insect_monitor_replaced: 0, // Default value, should be configurable in UI
              general_remarks: current.fumigation?.fumigation_notes || '',
              chemicals: (current.fumigation?.chemicals_used || current.fumigation_chemicals || []).map(chemical => ({
                chemical_id: chemical.chemical_id || chemical.id || 0,
                quantity: parseFloat(chemical.quantity?.toString() || '0'),
                batch_number: chemical.batch_number || '',
                batch_number_note: '' // Should be configurable in UI
              }))
            }
          };

          console.log('=== BACKEND SUBMISSION DEBUG ===');
          console.log('Submitting report with backend format:', JSON.stringify(submissionData, null, 2));
          console.log('Station activity types:', submissionData.stations.map(s => ({ 
            station: s.station_number, 
            activity_type: s.activity_type,
            activity_type_length: s.activity_type?.length,
            activity_type_other: s.activity_type_other 
          })));
          console.log('=== END BACKEND DEBUG ===');

          const result = await mobileService.createReport(submissionData);
          
          if (result.success) {
            // Store the generated report ID in the current report
            set({ 
              currentReport: {
                ...current,
                report_id: generatedReportId.toString()
              },
              isLoading: false
            });
            
            // Clear any saved draft
            await get().clearDraft();
          }
          
          return result;
        } catch (error) {
          console.error('Failed to submit report:', error);
          set({ 
            error: 'Failed to submit report. Please try again.',
            isLoading: false 
          });
          throw error;
        }
      },

      // Draft management
      saveDraft: async () => {
        const current = get().currentReport;
        const step = get().currentStep;
        
        if (current && current.client_id) {
          const draftId = `draft_${current.client_id}_${Date.now()}`;
          await mobileService.saveDraft(draftId, {
            ...current,
            client_id: current.client_id,
            current_step: step,
          });
        }
      },

      loadDraft: (draftId: string) => {
        const drafts = mobileService.getDrafts();
        const draft = drafts.find(d => d.id === draftId);
        
        if (draft) {
          set({ 
            currentReport: draft.data,
            reportInProgress: true,
            currentStep: draft.current_step || 'basic-info',
            hasUnsavedChanges: true 
          });
        }
      },

      clearDraft: async () => {
        const current = get().currentReport;
        if (current && current.client_id) {
          // Clear drafts for this client
          const drafts = mobileService.getDrafts();
          const clientDrafts = drafts.filter(d => 
            d.data.client_id === current.client_id
          );
          
          for (const draft of clientDrafts) {
            await mobileService.deleteDraft(draft.id);
          }
        }
        
        set({ 
          currentReport: null,
          reportInProgress: false,
          hasUnsavedChanges: false,
          currentStep: 'basic-info' 
        });
      },

      getDrafts: () => {
        return mobileService.getDrafts();
      },

      // Utility actions
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'mobile-store',
      partialize: (state) => ({
        // Only persist essential data, not loading states
        assignedClients: state.assignedClients,
        selectedClient: state.selectedClient,
        currentReport: state.currentReport,
        reportInProgress: state.reportInProgress,
        currentStep: state.currentStep,
        chemicals: state.chemicals,
        drafts: state.drafts,
      }),
    }
  )
);
