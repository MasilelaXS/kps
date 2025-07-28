import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';

// PCO User Interface
export interface PcoUser {
  id: number;
  pco_number: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

// Assigned Client Interface
export interface PcoClient {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  contact?: Array<{
    name: string;
    number: string;
  }>;
  status: string;
  last_service_date: string | null;
  total_reports: number;
  pending_reports: number;
}

// Report Interface
export interface PcoReport {
  id: number;
  client_id: number;
  pco_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  status: 'draft' | 'pending' | 'approved' | 'declined';
  date_of_service: string;
  client_name: string;
  created_at: string;
  updated_at: string;
  overall_remarks?: string;
  recommendations?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  next_service_date?: string;
  client_signature?: string;
}

// Inspection Station Interface
export interface PcoInspectionStation {
  id?: number;
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  access_reason?: string;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_type_other?: string;
  activity_description?: string;
  station_condition?: string[];
  bait_status: 'untouched' | 'eaten' | 'partially_eaten' | 'moldy';
  rodent_box_replaced: boolean;
  poison_used_id?: number;
  poison_quantity?: number;
  batch_number?: string;
  batch_number_note?: string;
  station_remarks?: string;
}

// Fumigation Treatment Interface
export interface PcoFumigationTreatment {
  id?: number;
  treated_areas: string[];
  treated_for: string[];
  general_remarks?: string;
  chemicals: Array<{
    chemical_id: number;
    quantity: number;
    batch_number: string;
    application_notes?: string;
  }>;
}

// Create Report Data Interface
export interface PcoCreateReportData {
  client_id: number;
  pco_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  status: 'draft' | 'pending';
  date_of_service: string;
  overall_remarks?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  recommendations?: string;
  next_service_date?: string;
  client_name?: string;
  client_signature?: string;
  stations?: PcoInspectionStation[];
  fumigation?: PcoFumigationTreatment;
}

// Dashboard Data Interface
export interface PcoDashboardData {
  profile: PcoUser;
  statistics: {
    total_reports: number;
    draft_reports: number;
    pending_reports: number;
    approved_reports: number;
    declined_reports: number;
    reports_this_week: number;
    reports_this_month: number;
    assigned_clients: number;
  };
  assigned_clients: PcoClient[];
  recent_reports: PcoReport[];
  upcoming_tasks: Array<{
    id: number;
    client_name: string;
    task_type: string;
    due_date: string;
  }>;
  monthly_performance: Array<{
    month: string;
    reports_completed: number;
    clients_serviced: number;
    avg_completion_time: number;
  }>;
}

// Client Note Interface
export interface PcoClientNote {
  id: number;
  client_id: number;
  user_id: number;
  note_text: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  created_by_role: string;
}

// Chemical Interface
export interface PcoChemical {
  id: number;
  l_number: string;
  name: string;
  type?: string;
  category: 'inspection' | 'fumigation' | 'both';
  quantity_unit: string;
  is_active: number;
  created_at: string;
}

class PcoService {
  // Authentication
  async login(pco_number: string, password: string): Promise<ApiResponse<{ user: PcoUser }>> {
    try {
      const response = await apiClient.post<{ user: PcoUser }>('/auth/login', {
        pco_number,
        password
      });
      return response;
    } catch (error) {
      console.error('PCO login error:', error);
      throw error;
    }
  }

  // Dashboard
  async getDashboard(pcoId: number): Promise<ApiResponse<PcoDashboardData>> {
    try {
      const response = await apiClient.get<PcoDashboardData>(`/dashboard/pco/${pcoId}`);
      return response;
    } catch (error) {
      console.error('PCO dashboard error:', error);
      throw error;
    }
  }

  // Clients
  async getAssignedClients(pcoId: number): Promise<ApiResponse<PcoClient[]>> {
    try {
      const response = await apiClient.get<PcoClient[]>(`/assignments/pco/${pcoId}`);
      return response;
    } catch (error) {
      console.error('Get assigned clients error:', error);
      throw error;
    }
  }

  async getClientDetails(clientId: number): Promise<ApiResponse<PcoClient>> {
    try {
      const response = await apiClient.get<PcoClient>(`/clients/${clientId}`);
      return response;
    } catch (error) {
      console.error('Get client details error:', error);
      throw error;
    }
  }

  async getClientNotes(clientId: number): Promise<ApiResponse<PcoClientNote[]>> {
    try {
      const response = await apiClient.get<PcoClientNote[]>(`/notes?client_id=${clientId}&user_role=pco`);
      return response;
    } catch (error) {
      console.error('Get client notes error:', error);
      throw error;
    }
  }

  // Reports
  async getReports(params?: {
    status?: string;
    client_id?: number;
    report_type?: string;
  }): Promise<ApiResponse<PcoReport[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
      if (params?.report_type) queryParams.append('report_type', params.report_type);

      const url = `/pco/reports${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<PcoReport[]>(url);
      return response;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }

  async getReportDetails(reportId: number): Promise<ApiResponse<PcoReport & { stations?: PcoInspectionStation[]; fumigation_treatments?: PcoFumigationTreatment[] }>> {
    try {
      const response = await apiClient.get<PcoReport & { stations?: PcoInspectionStation[]; fumigation_treatments?: PcoFumigationTreatment[] }>(`/pco/reports/${reportId}`);
      return response;
    } catch (error) {
      console.error('Get report details error:', error);
      throw error;
    }
  }

  async createReport(data: PcoCreateReportData): Promise<ApiResponse<PcoReport>> {
    try {
      const response = await apiClient.post<PcoReport>('/pco/reports', data);
      return response;
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  }

  async updateReport(reportId: number, data: Partial<PcoCreateReportData>): Promise<ApiResponse<PcoReport>> {
    try {
      const response = await apiClient.put<PcoReport>(`/pco/reports/${reportId}`, data);
      return response;
    } catch (error) {
      console.error('Update report error:', error);
      throw error;
    }
  }

  async submitReport(reportId: number): Promise<ApiResponse<{ id: number; status: string }>> {
    try {
      const response = await apiClient.put<{ id: number; status: string }>(`/pco/reports/${reportId}/submit`);
      return response;
    } catch (error) {
      console.error('Submit report error:', error);
      throw error;
    }
  }

  // Chemicals
  async getChemicals(): Promise<ApiResponse<PcoChemical[]>> {
    try {
      const response = await apiClient.get<PcoChemical[]>('/chemicals');
      return response;
    } catch (error) {
      console.error('Get chemicals error:', error);
      throw error;
    }
  }
}

export const pcoService = new PcoService();
