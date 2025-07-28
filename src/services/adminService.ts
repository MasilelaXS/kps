import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';

// Types based on the actual API response
export interface DashboardSummary {
  total_clients: number;
  active_pcos: number;
  pending_reports: number;
  completed_reports: number;
}

export interface ClientNeedingAttention {
  id: number;
  name: string;
  email: string;
  phone: string;
  last_report_date: string | null;
  days_since_last_report: number | null;
  assigned_pco: string | null;
  pco_number: string | null;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

export interface TopPCO {
  id: number;
  name: string;
  pco_number: string;
  total_reports: number;
  reports_this_month: number;
  avg_reports_per_week: number;
  assigned_clients: number;
}

export interface MonthlyTrend {
  month: string;
  report_count: number;
  new_clients: number;
}

export interface AdminDashboardData {
  summary: DashboardSummary;
  recent_reports?: unknown[];
  chemical_usage?: unknown[];
}

export interface Client {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  contact?: Array<{
    name: string;
    number: string;
  }>;
  contact_person?: string; // Keep for backward compatibility
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_pco_name?: string | null;
  assigned_pco_number?: string | null;
  assigned_at?: string | null;
  total_reports: number;
  last_service_date: string | null;
  pending_reports: number;
  // For backward compatibility with UI components
  assigned_pco?: {
    id: number;
    name: string;
    pco_number: string;
  } | null;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_records: number;
  per_page: number;
}

export interface AdminClientsResponse {
  clients: Client[];
  pagination: PaginationInfo;
}

export interface Report {
  id: number;
  client: {
    id: number;
    name: string;
  };
  pco: {
    id: number;
    name: string;
    pco_number: string;
  };
  report_type: string;
  status: string;
  created_at: string;
  has_missing_batch_numbers: boolean;
  station_count: number;
  chemicals_used: number;
}

export interface DetailedReport {
  id: number;
  client_id: number;
  pco_id: number;
  report_type: string;
  status: string;
  overall_remarks: string;
  warning_signs_replaced: boolean;
  warning_signs_quantity: number;
  recommendations: string;
  next_service_date: string;
  created_at: string;
  updated_at: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
  client: {
    id: number;
    name: string;
    address: string;
  };
  pco: {
    id: number;
    name: string;
    pco_number: string;
  };
  // API returns 'stations' for regular endpoints, 'inspection_stations' for admin endpoints
  stations?: Array<{
    id: number;
    station_number: string;
    location: string;
    is_accessible: boolean;
    has_activity: boolean;
    activity_type: string | null;
    station_condition: string[];
    bait_status: string;
    rodent_box_replaced: boolean;
    poison_used_id: number;
    poison_quantity: number;
    batch_number: string;
    station_remarks: string;
  }>;
  // Admin API returns inspection_stations
  inspection_stations?: Array<{
    id: number;
    station_number: number;
    location: 'inside' | 'outside';
    is_accessible: boolean;
    has_activity: boolean;
    activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other' | null;
    activity_description?: string;
    bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
    poison_used_id: number;
    poison_quantity: number;
    batch_number: string;
    station_remarks: string;
    chemical_name?: string;
    l_number?: string;
  }>;
  fumigation_treatments: Array<{
    id?: number;
    treated_areas: string[];
    treated_for: string[];
    insect_monitor_replaced: boolean;
    general_remarks: string;
    chemicals: Array<{
      id?: number;
      chemical_id: number;
      quantity: number;
      batch_number: string;
      batch_number_note?: string | null;
      chemical_name?: string;
      l_number?: string;
    }>;
  }>;
}

export interface ReportsSummary {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  archived: number;
}

export interface AdminReportsResponse {
  reports: Report[];
  summary: ReportsSummary;
}

export interface ClientNote {
  id: number;
  client_id: number;
  user_id: number;
  note_text: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string;
  created_by_name: string;
  created_by_role: string;
}

export interface Assignment {
  id: number;
  client_id: number;
  pco_id: number;
  assigned_by: number;
  assigned_at: string;
  client_name: string;
  client_address: string;
  pco_name: string;
  pco_number: string;
  assigned_by_name: string;
}

export interface User {
  id: number;
  pco_number: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Chemical {
  id: number;
  l_number: string;
  name: string;
  type?: string;
  category: 'inspection' | 'fumigation' | 'both';
  quantity_unit: string;
  is_active: number;
  created_at: string;
  usage_stats?: {
    inspection_usage_count: number;
    fumigation_usage_count: number;
    total_inspection_quantity: number | null;
    total_fumigation_quantity: number | null;
  };
}

export interface ChemicalStats {
  summary: {
    total_chemicals: number;
    active_chemicals: number;
    inspection_chemicals: number;
    fumigation_chemicals: number;
    both_chemicals: number;
  };
  top_used_chemicals: Array<{
    id: number;
    name: string;
    l_number: string;
    total_usage: number;
    inspection_usage: number;
    fumigation_usage: number;
    last_used: string;
  }>;
}

class AdminService {
  async getDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    try {
      console.log('Fetching admin dashboard data...');
      const response = await apiClient.get<AdminDashboardData>('/dashboard/admin');
      console.log('Admin dashboard response:', response);
      return response;
    } catch (error) {
      console.error('Admin dashboard error:', error);
      throw error;
    }
  }

  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<AdminClientsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);

      const url = `/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching clients:', url);
      
      const response = await apiClient.get<Client[]>(url);
      console.log('Clients response:', response);
      
      // The API returns a simple array, so we need to wrap it in our expected format
      if (response.success && Array.isArray(response.data)) {
        // Transform API response to match UI expectations
        const transformedClients = response.data.map(client => ({
          ...client,
          // Transform flat PCO fields into nested object for UI compatibility
          assigned_pco: client.assigned_pco_name ? {
            id: 0, // API doesn't provide PCO ID, using 0 as placeholder
            name: client.assigned_pco_name,
            pco_number: client.assigned_pco_number || ''
          } : null,
          // Set default values for missing fields
          pending_reports: 0 // API doesn't provide this, default to 0
        }));
        
        // Apply client-side pagination since API doesn't support it
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedClients = transformedClients.slice(startIndex, endIndex);
        
        const wrappedResponse: ApiResponse<AdminClientsResponse> = {
          ...response,
          data: {
            clients: paginatedClients,
            pagination: {
              current_page: page,
              total_pages: Math.ceil(transformedClients.length / limit),
              total_records: transformedClients.length,
              per_page: limit
            }
          }
        };
        return wrappedResponse;
      }
      
      // Fallback if API format changes
      return {
        success: false,
        message: 'Invalid response format'
      } as ApiResponse<AdminClientsResponse>;
    } catch (error) {
      console.error('Clients error:', error);
      throw error;
    }
  }

  async getReports(params?: {
    status?: string;
    pco_id?: number;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    report_type?: string;
  }): Promise<ApiResponse<AdminReportsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.pco_id) queryParams.append('pco_id', params.pco_id.toString());
      if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      if (params?.report_type) queryParams.append('report_type', params.report_type);

      // Use the correct admin reports endpoint from API documentation
      const url = `/admin/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching admin reports:', url);
      
      const response = await apiClient.get<AdminReportsResponse>(url);
      console.log('Admin reports response:', response);
      return response;
    } catch (error) {
      console.error('Admin reports error:', error);
      throw error;
    }
  }

  async editReport(reportId: number, data: {
    overall_remarks?: string;
    recommendations?: string;
    next_service_date?: string;
    warning_signs_replaced?: boolean;
    warning_signs_quantity?: number;
    station_operations?: Array<{
      action: 'add' | 'update' | 'delete';
      station_id?: number;
      data?: {
        station_number?: number;
        location?: 'inside' | 'outside';
        is_accessible?: boolean;
        has_activity?: boolean;
        activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
        activity_description?: string;
        station_condition?: string[];
        bait_status?: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
        rodent_box_replaced?: boolean;
        poison_used_id?: number;
        poison_quantity?: number;
        batch_number?: string;
        station_remarks?: string;
      };
    }>;
    treatment_operations?: Array<{
      action: 'add' | 'update' | 'delete';
      treatment_id?: number;
      data?: {
        treated_areas?: string[];
        treated_for?: string[];
        insect_monitor_replaced?: boolean;
        general_remarks?: string;
        chemicals?: Array<{
          chemical_id: number;
          quantity: number;
          batch_number: string;
          batch_number_note?: string;
        }>;
      };
    }>;
  }): Promise<ApiResponse<{ message: string; report_id: string }>> {
    try {
      console.log('🚀 EDIT REPORT API CALL:');
      console.log('📋 Report ID:', reportId);
      console.log('📊 Request Data:', JSON.stringify(data, null, 2));
      console.log('🔗 Endpoint: PUT /admin/reports/' + reportId);
      
      const response = await apiClient.put<{ message: string; report_id: string }>(`/admin/reports/${reportId}`, data);
      
      console.log('✅ EDIT REPORT RESPONSE:');
      console.log('📈 Response Status:', response.success ? 'SUCCESS' : 'FAILED');
      console.log('📋 Response Data:', JSON.stringify(response, null, 2));
      console.log('💬 Response Message:', response.message);
      
      if (response.errors) {
        console.log('❌ Response Errors:', JSON.stringify(response.errors, null, 2));
      }
      
      return response;
    } catch (error) {
      console.log('💥 EDIT REPORT ERROR:');
      console.log('❌ Error Details:', error);
      console.log('🔍 Error Message:', error instanceof Error ? error.message : 'Unknown error');
      if (error && typeof error === 'object' && 'response' in error) {
        console.log('🌐 HTTP Response:', (error as { response: unknown }).response);
      }
      throw error;
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const endpoint = '/users';
      console.log('📡 GET USERS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<User[]>(endpoint);
      
      console.log('✅ Users response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data && Array.isArray(response.data)) {
        console.log('👥 Number of users returned:', response.data.length);
        console.log('📄 Users data preview:', response.data.slice(0, 2)); // Show first 2 users
      }
      
      return response;
    } catch (error) {
      console.error('❌ Users fetch error:', error);
      throw error;
    }
  }

  async createUser(data: {
    pco_number: string;
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    status?: string;
  }): Promise<ApiResponse<{ id: number; message: string }>> {
    try {
      const endpoint = '/users';
      console.log('📡 CREATE USER API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Data being sent:', JSON.stringify(data, null, 2));
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.post<{ id: number; message: string }>(endpoint, data);
      
      console.log('✅ Create user response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: number, data: {
    pco_number?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    status?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    try {
      const endpoint = `/users/${userId}`;
      console.log('📡 UPDATE USER API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 User ID:', userId);
      console.log('📦 Data being sent:', JSON.stringify(data, null, 2));
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.put<{ message: string }>(endpoint, data);
      
      console.log('✅ Update user response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const endpoint = `/users/${userId}`;
      console.log('📡 DELETE USER API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 User ID:', userId);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.delete<{ message: string }>(endpoint);
      
      console.log('✅ Delete user response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw error;
    }
  }

  async assignClientsToPC0(data: {
    client_ids: number[];
    action: 'assign' | 'unassign';
    pco_id?: number;
    assigned_by?: number;
  }): Promise<ApiResponse<{ assigned_count?: number; unassigned_count?: number }>> {
    try {
      const endpoint = '/admin/clients/assign';
      
      // Prepare the request data according to API requirements
      const requestData: {
        client_ids: number[];
        action: 'assign' | 'unassign';
        pco_id?: number;
        assigned_by?: number;
      } = {
        client_ids: data.client_ids,
        action: data.action
      };

      if (data.action === 'assign') {
        if (!data.pco_id) {
          throw new Error('pco_id is required for assign action');
        }
        if (!data.assigned_by) {
          throw new Error('assigned_by is required for assign action');
        }
        requestData.pco_id = data.pco_id;
        requestData.assigned_by = data.assigned_by;
      } else if (data.action === 'unassign') {
        // For unassign, we still need pco_id to identify which assignments to remove
        if (!data.pco_id) {
          throw new Error('pco_id is required for unassign action');
        }
        requestData.pco_id = data.pco_id;
      }

      console.log('📡 ASSIGN CLIENTS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Data being sent:', JSON.stringify(requestData, null, 2));
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.post<{ assigned_count?: number; unassigned_count?: number }>(endpoint, requestData);
      
      console.log('✅ Assign clients response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Assign clients error:', error);
      throw error;
    }
  }

  // Notes Management
  async getClientNotes(
    clientId?: number,
    userRole: 'admin' | 'pco' = 'admin',
    isPrivate?: boolean
  ): Promise<ApiResponse<ClientNote[]>> {
    try {
      const params = new URLSearchParams();
      if (clientId) params.append('client_id', clientId.toString());
      params.append('user_role', userRole);
      if (isPrivate !== undefined) params.append('private', isPrivate.toString());
      
      console.log('Getting client notes with params:', Object.fromEntries(params));
      const response = await apiClient.get<ClientNote[]>(`/notes?${params}`);
      console.log('Get client notes response:', response);
      return response;
    } catch (error) {
      console.error('Get client notes error:', error);
      throw error;
    }
  }

  async createClientNote(data: {
    client_id: number;
    user_id: number;
    note_text: string;
    is_private?: boolean;
  }): Promise<ApiResponse<{ id: string; message: string }>> {
    try {
      console.log('Creating client note:', data);
      const response = await apiClient.post<{ id: string; message: string }>('/notes', data);
      console.log('Create client note response:', response);
      return response;
    } catch (error) {
      console.error('Create client note error:', error);
      throw error;
    }
  }

  async updateClientNote(
    noteId: number,
    data: {
      note_text?: string;
      is_private?: boolean;
    }
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Updating client note:', noteId, data);
      const response = await apiClient.put<{ message: string }>(`/notes/${noteId}`, data);
      console.log('Update client note response:', response);
      return response;
    } catch (error) {
      console.error('Update client note error:', error);
      throw error;
    }
  }

  async deleteClientNote(noteId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Deleting client note:', noteId);
      const response = await apiClient.delete<{ message: string }>(`/notes/${noteId}`);
      console.log('Delete client note response:', response);
      return response;
    } catch (error) {
      console.error('Delete client note error:', error);
      throw error;
    }
  }

  // Assignments Management
  async getAllAssignments(): Promise<ApiResponse<Assignment[]>> {
    try {
      console.log('Getting all assignments');
      const response = await apiClient.get<Assignment[]>('/assignments');
      console.log('Get all assignments response:', response);
      return response;
    } catch (error) {
      console.error('Get all assignments error:', error);
      throw error;
    }
  }

  async getPCOAssignments(pcoId: number): Promise<ApiResponse<Assignment[]>> {
    try {
      console.log('Getting PCO assignments for:', pcoId);
      const response = await apiClient.get<Assignment[]>(`/assignments/pco/${pcoId}`);
      console.log('Get PCO assignments response:', response);
      return response;
    } catch (error) {
      console.error('Get PCO assignments error:', error);
      throw error;
    }
  }

  async createAssignment(data: {
    client_id: number;
    pco_id: number;
    assigned_by: number;
  }): Promise<ApiResponse<{ id: number; message: string }>> {
    try {
      console.log('Creating assignment:', data);
      const response = await apiClient.post<{ id: number; message: string }>('/assignments', data);
      console.log('Create assignment response:', response);
      return response;
    } catch (error) {
      console.error('Create assignment error:', error);
      throw error;
    }
  }

  async deleteAssignment(assignmentId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Deleting assignment:', assignmentId);
      const response = await apiClient.delete<{ message: string }>(`/assignments/${assignmentId}`);
      console.log('Delete assignment response:', response);
      return response;
    } catch (error) {
      console.error('Delete assignment error:', error);
      throw error;
    }
  }

  async updateReportStatus(reportId: number, data: {
    status: string;
    admin_notes?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Updating report status:', { reportId, data });
      const response = await apiClient.put<{ message: string }>(`/admin/reports/${reportId}/status`, data);
      console.log('Update report status response:', response);
      return response;
    } catch (error) {
      console.error('Update report status error:', error);
      throw error;
    }
  }

  async getReport(reportId: number): Promise<ApiResponse<DetailedReport>> {
    try {
      console.log('📊 Admin Service: Getting report details (admin)', reportId);
      // Use the admin-specific endpoint which includes more detailed data for editing
      const response = await apiClient.get<{
        report: DetailedReport;
        inspection_stations: DetailedReport['inspection_stations'];
        fumigation_treatments: DetailedReport['fumigation_treatments'];
      }>(`/admin/reports/${reportId}`);
      
      console.log('✅ Admin Service: Report details loaded successfully (admin)', response);
      
      // Transform the admin API response to match our DetailedReport interface
      if (response.success && response.data) {
        const transformedReport: DetailedReport = {
          ...response.data.report,
          inspection_stations: response.data.inspection_stations || [],
          fumigation_treatments: response.data.fumigation_treatments || [],
          // Also set stations for backward compatibility
          stations: response.data.inspection_stations?.map(station => ({
            ...station,
            station_number: station.station_number.toString(),
            station_condition: [], // Not provided in admin API
            rodent_box_replaced: false // Not provided in admin API
          })) || []
        };
        
        const transformedResponse: ApiResponse<DetailedReport> = {
          ...response,
          data: transformedReport
        };
        
        return transformedResponse;
      }
      
      return response as unknown as ApiResponse<DetailedReport>;
    } catch (error) {
      console.error('❌ Admin Service: Failed to load report details (admin)', error);
      throw error;
    }
  }

  async downloadReport(reportId: number): Promise<Blob> {
    try {
      console.log('📄 Admin Service: Downloading report', reportId);
      const response = await apiClient.post(`/reports/${reportId}/download`, {}, {
        responseType: 'blob'
      });
      console.log('✅ Admin Service: Report downloaded successfully');
      return response.data as Blob;
    } catch (error) {
      console.error('❌ Admin Service: Failed to download report', error);
      throw error;
    }
  }

  async createClient(data: {
    name: string;
    address: string;
    email: string;
    phone: string;
    contact_person?: string;
    status?: string;
  }): Promise<ApiResponse<{ id: number; message: string }>> {
    try {
      console.log('Creating client:', data);
      const response = await apiClient.post<{ id: number; message: string }>('/clients', data);
      console.log('Create client response:', response);
      return response;
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  }

  async updateClient(clientId: number, data: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    contact_person?: string;
    status?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Updating client:', { clientId, data });
      const response = await apiClient.put<{ message: string }>(`/clients/${clientId}`, data);
      console.log('Update client response:', response);
      return response;
    } catch (error) {
      console.error('Update client error:', error);
      throw error;
    }
  }

  async deleteClient(clientId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Deleting client:', clientId);
      const response = await apiClient.delete<{ message: string }>(`/clients/${clientId}`);
      console.log('Delete client response:', response);
      return response;
    } catch (error) {
      console.error('Delete client error:', error);
      throw error;
    }
  }

  // Chemical Management Methods
  async getChemicals(category?: 'inspection' | 'fumigation' | 'both'): Promise<ApiResponse<Chemical[]>> {
    try {
      const queryParams = category ? `?category=${category}` : '';
      const endpoint = `/chemicals${queryParams}`;
      console.log('📡 GET CHEMICALS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Category filter:', category || 'all');
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<Chemical[]>(endpoint);
      
      console.log('✅ Chemicals response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data && Array.isArray(response.data)) {
        console.log('🧪 Number of chemicals returned:', response.data.length);
        console.log('📄 Chemicals data preview:', response.data.slice(0, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get chemicals error:', error);
      throw error;
    }
  }

  async getAdminChemicals(): Promise<ApiResponse<Chemical[]>> {
    try {
      const endpoint = '/admin/chemicals';
      console.log('📡 GET ADMIN CHEMICALS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<Chemical[]>(endpoint);
      
      console.log('✅ Admin chemicals response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data && Array.isArray(response.data)) {
        console.log('🧪 Number of chemicals with usage stats returned:', response.data.length);
        console.log('📄 Admin chemicals data preview:', response.data.slice(0, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get admin chemicals error:', error);
      throw error;
    }
  }

  async getChemical(id: number): Promise<ApiResponse<Chemical>> {
    try {
      const endpoint = `/chemicals/${id}`;
      console.log('📡 GET CHEMICAL BY ID API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Chemical ID:', id);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<Chemical>(endpoint);
      
      console.log('✅ Chemical response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Chemical data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get chemical error:', error);
      throw error;
    }
  }

  async createChemical(data: {
    l_number: string;
    name: string;
    type?: string;
    category: 'inspection' | 'fumigation' | 'both';
    quantity_unit: string;
  }): Promise<ApiResponse<{ id: string; message: string }>> {
    try {
      const endpoint = '/chemicals';
      console.log('📡 CREATE CHEMICAL API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Data being sent:', JSON.stringify(data, null, 2));
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.post<{ id: string; message: string }>(endpoint, data);
      
      console.log('✅ Create chemical response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Create chemical error:', error);
      throw error;
    }
  }

  async updateChemical(id: number, data: {
    l_number?: string;
    name?: string;
    type?: string;
    category?: 'inspection' | 'fumigation' | 'both';
    quantity_unit?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    try {
      const endpoint = `/chemicals/${id}`;
      console.log('📡 UPDATE CHEMICAL API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Chemical ID:', id);
      console.log('📦 Data being sent:', JSON.stringify(data, null, 2));
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.put<{ message: string }>(endpoint, data);
      
      console.log('✅ Update chemical response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Update chemical error:', error);
      throw error;
    }
  }

  async deleteChemical(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const endpoint = `/chemicals/${id}`;
      console.log('📡 DELETE CHEMICAL API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Chemical ID:', id);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.delete<{ message: string }>(endpoint);
      
      console.log('✅ Delete chemical response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Delete chemical error:', error);
      throw error;
    }
  }

  async getChemicalStats(): Promise<ApiResponse<ChemicalStats>> {
    try {
      const endpoint = '/chemicals/stats';
      console.log('📡 GET CHEMICAL STATS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<ChemicalStats>(endpoint);
      
      console.log('✅ Chemical stats response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Stats data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get chemical stats error:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
