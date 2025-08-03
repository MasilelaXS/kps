import { apiClient } from '../apiClient';

// Local interfaces for this service
export interface ReportData {
  id: number;
  client_id: number;
  client_name: string;
  report_type: 'inspection' | 'fumigation' | 'both';
  status: 'draft' | 'submitted' | 'approved' | 'declined';
  date_of_service: string;
  created_at: string;
  updated_at: string;
  overall_remarks?: string;
  recommendations?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  stations?: StationData[];
  fumigation?: FumigationData;
}

export interface StationData {
  station_number: string;
  location: 'inside' | 'outside';
  is_accessible: number;
  access_reason?: string;
  has_activity: number;
  activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_description: string;
  station_condition: string[];
  bait_status: string;
  rodent_box_replaced: number;
  poison_used_id: number;
  poison_quantity: number;
  batch_number: string;
  batch_number_note?: string;
  station_remarks: string;
}

export interface FumigationData {
  treated_areas: string[];
  treated_for: string[];
  insect_monitor_replaced: number;
  general_remarks: string;
  chemicals: {
    chemical_id: number;
    quantity: number;
    batch_number: string;
    batch_number_note?: string;
  }[];
}

export interface PCODashboardStats {
  draft_reports: number;
  assigned_clients: number;
  reports_today: number;
  pending_reports: number;
}

export interface AssignedClient {
  id: number;
  client_name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  contract_type: string;
  last_service_date: string | null;
  next_service_date: string | null;
}

export interface PCOReport {
  id: number;
  client_id: number;
  client_name: string;
  report_type: 'inspection' | 'fumigation' | 'both';
  status: 'draft' | 'submitted' | 'approved' | 'declined';
  date_of_service: string;
  created_at: string;
  updated_at: string;
  overall_remarks?: string;
  recommendations?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  stations?: StationData[];
  fumigation?: FumigationData;
}

export interface Chemical {
  id: number;
  name: string;
  active_ingredient: string;
  registration_number: string;
  category: 'inspection' | 'fumigation' | 'both';
  unit: string;
}

export interface ReportSubmissionData {
  client_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  date_of_service: string;
  overall_remarks?: string;
  recommendations?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  stations?: StationData[];
  fumigation?: FumigationData;
  client_signature?: string;
  pco_signature?: string;
}

class PCOService {
  private basePath = '/api/pco';

  async getDashboard(): Promise<PCODashboardStats> {
    const response = await apiClient.get(`${this.basePath}/dashboard`);
    return response.data as PCODashboardStats;
  }

  async getAssignedClients(): Promise<AssignedClient[]> {
    const response = await apiClient.get(`${this.basePath}/clients`);
    return response.data as AssignedClient[];
  }

  async getReports(filters?: { status?: string; date_from?: string; date_to?: string }): Promise<PCOReport[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const response = await apiClient.get(`${this.basePath}/reports?${params.toString()}`);
    return response.data as PCOReport[];
  }

  async getReport(id: number): Promise<PCOReport> {
    const response = await apiClient.get(`${this.basePath}/reports/${id}`);
    return response.data as PCOReport;
  }

  async createReport(data: ReportSubmissionData): Promise<{ id: number }> {
    const response = await apiClient.post(`${this.basePath}/reports`, data);
    return response.data as { id: number };
  }

  async updateReport(id: number, data: Partial<ReportSubmissionData>): Promise<void> {
    await apiClient.put(`${this.basePath}/reports/${id}`, data);
  }

  async submitReport(id: number, data: { client_signature: string; pco_signature: string }): Promise<void> {
    await apiClient.post(`${this.basePath}/reports/${id}/submit`, data);
  }

  async getChemicals(): Promise<Chemical[]> {
    const response = await apiClient.get(`${this.basePath}/chemicals`);
    return response.data as Chemical[];
  }

  async updatePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    await apiClient.post(`${this.basePath}/update-password`, data);
  }
}

export const pcoService = new PCOService();
