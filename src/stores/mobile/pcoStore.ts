import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { pcoService } from '../../services/mobile/pcoService';
import type { 
  PCODashboardStats, 
  AssignedClient, 
  PCOReport, 
  Chemical,
  ReportSubmissionData,
  StationData,
  FumigationData
} from '../../services/mobile/pcoService';
import type { ReportFilters, Signatures } from '../../types/mobile';

interface PCOState {
  // Dashboard Data
  dashboardStats: PCODashboardStats | null;
  
  // Clients
  assignedClients: AssignedClient[];
  
  // Reports
  reports: PCOReport[];
  currentReport: PCOReport | null;
  reportFormData: Partial<ReportSubmissionData>;
  
  // Chemicals
  chemicals: Chemical[];
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  fetchAssignedClients: () => Promise<void>;
  fetchReports: (filters?: ReportFilters) => Promise<void>;
  fetchReport: (id: number) => Promise<void>;
  fetchChemicals: () => Promise<void>;
  
  // Report Form Management
  initializeReport: (clientId: number) => void;
  updateReportForm: (updates: Partial<ReportSubmissionData>) => void;
  addStation: (station: Partial<StationData>) => void;
  updateStation: (index: number, station: Partial<StationData>) => void;
  removeStation: (index: number) => void;
  updateFumigation: (fumigation: FumigationData) => void;
  submitReport: (signatures: Signatures) => Promise<number>;
  clearCurrentReport: () => void;
  
  // Utility
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePCOStore = create<PCOState>()(
  immer((set, get) => ({
    // Initial state
    dashboardStats: null,
    assignedClients: [],
    reports: [],
    currentReport: null,
    reportFormData: {},
    chemicals: [],
    isLoading: false,
    error: null,

    // Fetch PCO dashboard
    fetchDashboard: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      
      try {
        const dashboardStats = await pcoService.getDashboard();
        set((state) => {
          state.dashboardStats = dashboardStats;
          state.isLoading = false;
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to fetch dashboard';
          state.isLoading = false;
        });
      }
    },

    // Fetch assigned clients
    fetchAssignedClients: async () => {
      try {
        const clients = await pcoService.getAssignedClients();
        set((state) => {
          state.assignedClients = clients;
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to fetch clients';
        });
      }
    },

    // Fetch reports
    fetchReports: async (filters) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      
      try {
        const reports = await pcoService.getReports(filters);
        set((state) => {
          state.reports = reports;
          state.isLoading = false;
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to fetch reports';
          state.isLoading = false;
        });
      }
    },

    // Fetch single report
    fetchReport: async (id) => {
      try {
        const report = await pcoService.getReport(id);
        set((state) => {
          state.currentReport = report;
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to fetch report';
        });
      }
    },

    // Fetch chemicals
    fetchChemicals: async () => {
      try {
        const chemicals = await pcoService.getChemicals();
        set((state) => {
          state.chemicals = chemicals;
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to fetch chemicals';
        });
      }
    },

    // Initialize new report
    initializeReport: (clientId) => {
      set((state) => {
        state.reportFormData = {
          client_id: clientId,
          report_type: 'both',
          date_of_service: new Date().toISOString().split('T')[0],
          stations: [],
          fumigation: undefined,
          warning_signs_replaced: 0,
          warning_signs_quantity: 0,
        };
      });
    },

    // Update report form data
    updateReportForm: (updates) => {
      set((state) => {
        Object.assign(state.reportFormData, updates);
      });
    },

    // Add station
    addStation: (station) => {
      set((state) => {
        if (!state.reportFormData.stations) {
          state.reportFormData.stations = [];
        }
        const newStation: StationData = {
          station_number: (state.reportFormData.stations.length + 1).toString(), // Convert to string
          location: station.location || 'inside',
          is_accessible: station.is_accessible || 1,
          access_reason: station.access_reason || '',
          has_activity: station.has_activity || 0,
          activity_type: station.activity_type || 'other',
          activity_description: station.activity_description || '',
          station_condition: [], // Required field
          bait_status: station.bait_status || 'eaten',
          rodent_box_replaced: 0, // Required field
          poison_used_id: station.poison_used_id || 0,
          poison_quantity: station.poison_quantity || 0,
          batch_number: station.batch_number || '',
          batch_number_note: station.batch_number_note,
          station_remarks: station.station_remarks || '',
        };
        state.reportFormData.stations.push(newStation);
      });
    },

    // Update station
    updateStation: (index, station) => {
      set((state) => {
        if (state.reportFormData.stations && state.reportFormData.stations[index]) {
          Object.assign(state.reportFormData.stations[index], station);
        }
      });
    },

    // Remove station
    removeStation: (index) => {
      set((state) => {
        if (state.reportFormData.stations) {
          state.reportFormData.stations.splice(index, 1);
          // Renumber remaining stations
          state.reportFormData.stations.forEach((station: StationData, i: number) => {
            station.station_number = (i + 1).toString(); // Convert to string
          });
        }
      });
    },

    // Update fumigation data
    updateFumigation: (fumigation) => {
      set((state) => {
        state.reportFormData.fumigation = fumigation;
      });
    },

    // Submit report
    submitReport: async (signatures) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const reportData = {
          ...get().reportFormData,
          client_signature: signatures.client_signature,
          pco_signature: signatures.pco_signature,
        } as ReportSubmissionData;

        const result = await pcoService.createReport(reportData);
        
        set((state) => {
          state.isLoading = false;
          state.reportFormData = {};
        });

        // Refresh reports list
        await get().fetchReports();
        
        return result.id;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set((state) => {
          state.error = errorMessage || 'Failed to submit report';
          state.isLoading = false;
        });
        throw error;
      }
    },

    // Clear current report
    clearCurrentReport: () => {
      set((state) => {
        state.currentReport = null;
        state.reportFormData = {};
      });
    },

    // Utility functions
    setError: (error) => {
      set((state) => {
        state.error = error;
      });
    },

    setLoading: (loading) => {
      set((state) => {
        state.isLoading = loading;
      });
    },
  }))
);
