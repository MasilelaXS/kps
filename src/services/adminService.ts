import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';
import type {
  AdminDashboardData,
  Client,
  AdminClientsResponse,
  DetailedReport,
  AdminReportsResponse,
  ClientNote,
  Assignment,
  User,
  Chemical,
  ChemicalStats
} from '../types/admin';

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
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminReportsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.pco_id) queryParams.append('pco_id', params.pco_id.toString());
      if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      if (params?.report_type) queryParams.append('report_type', params.report_type);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

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
    client_id?: number;
    pco_id?: number;
    report_type?: 'inspection' | 'fumigation' | 'both';
    date_of_service?: string;
    overall_remarks?: string;
    recommendations?: string;
    next_service_date?: string;
    fumigation_remarks?: string;
    warning_signs_replaced?: boolean;
    warning_signs_quantity?: number;
    admin_notes?: string;
    // Allow station operations
    stations?: Array<{
      id?: number;
      station_number?: number;
      location?: 'inside' | 'outside';
      is_accessible?: boolean;
      has_activity?: boolean;
      activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other' | null;
      activity_description?: string;
      station_condition?: string[];
      bait_status?: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
      rodent_box_replaced?: boolean;
      poison_used_id?: number;
      poison_quantity?: number;
      batch_number?: string;
      station_remarks?: string;
    }>;
    // Allow treatment operations
    fumigation_treatments?: Array<{
      id?: number;
      treated_areas?: string[];
      treated_for?: string[];
      insect_monitor_replaced?: boolean;
      general_remarks?: string;
      chemicals?: Array<{
        id?: number;
        chemical_id: number;
        quantity: number;
        batch_number: string;
        batch_number_note?: string | null;
      }>;
    }>;
  }): Promise<ApiResponse<{ message: string; report_id?: string }>> {
    try {
      console.log('🚀 SIMPLIFIED EDIT REPORT API CALL:');
      console.log('📋 Report ID:', reportId);
      console.log('📊 Request Data:', JSON.stringify(data, null, 2));
      console.log('🔗 Endpoint: PUT /admin/reports/' + reportId);
      
      // Simplify the data structure - only send what's actually changed
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => {
          if (value === null || value === undefined) return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        })
      );
      
      console.log('🧹 Cleaned data to send:', JSON.stringify(cleanData, null, 2));
      
      const response = await apiClient.put<{ message: string; report_id?: string }>(`/admin/reports/${reportId}`, cleanData);
      
      console.log('✅ SIMPLIFIED EDIT REPORT RESPONSE:');
      console.log('📈 Response Status:', response.success ? 'SUCCESS' : 'FAILED');
      console.log('📋 Response Data:', JSON.stringify(response, null, 2));
      console.log('💬 Response Message:', response.message);
      
      if (response.errors) {
        console.log('❌ Response Errors:', JSON.stringify(response.errors, null, 2));
      }
      
      return response;
    } catch (error) {
      console.log('💥 SIMPLIFIED EDIT REPORT ERROR:');
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

  async assignClientsToPCO(data: {
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

      // Validation according to API documentation
      if (data.action === 'assign') {
        // For assign: pco_id and assigned_by are required
        if (!data.pco_id) {
          throw new Error('pco_id is required for assign action');
        }
        if (!data.assigned_by) {
          throw new Error('assigned_by is required for assign action');
        }
        requestData.pco_id = data.pco_id;
        requestData.assigned_by = data.assigned_by;
      } else if (data.action === 'unassign') {
        // For unassign: pco_id is optional (if omitted, removes all assignments for the client)
        if (data.pco_id) {
          requestData.pco_id = data.pco_id;
        }
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
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ Admin Service: getReport timeout after 15 seconds');
        controller.abort();
      }, 15000);
      
      try {
        // Based on API documentation v3, try the admin endpoint first
        const response = await apiClient.get<DetailedReport>(`/admin/reports/${reportId}`);
        
        clearTimeout(timeoutId);
        console.log('✅ Admin Service: Raw API response received');
        
        if (response.success && response.data) {
          let reportData = response.data;
          let stationsData: any[] = [];
          let fumigationData: any = null;
          
          // Check if the data is wrapped in another structure (as per admin-report.md)
          if ('report' in response.data && response.data.report) {
            console.log('📋 Detected wrapped response structure');
            const rawReportData = response.data.report as any;
            reportData = rawReportData;
            // Get stations and fumigation from separate fields
            stationsData = (response.data as any).inspection_stations || [];
            fumigationData = (response.data as any).fumigation_treatments?.[0] || null;
          } else {
            // Fallback: check if stations/fumigation are directly on reportData
            stationsData = (reportData as any).inspection_stations || (reportData as any).stations || [];
            fumigationData = (reportData as any).fumigation_treatments?.[0] || null;
          }
          
          console.log('📊 Stations found:', stationsData.length);
          console.log('🧪 Fumigation found:', fumigationData ? 'Yes' : 'No');
          
          // Cast to any to access API response fields safely
          const rawData = reportData as any;
          
          // Return simplified processed report - avoid additional API calls for now
          const processedReport: DetailedReport = {
            id: rawData.id || 0,
            client_id: rawData.client_id || 0,
            pco_id: rawData.pco_id || 0,
            report_type: rawData.report_type || 'inspection',
            status: rawData.status || 'pending',
            overall_remarks: rawData.overall_remarks || '',
            warning_signs_replaced: rawData.warning_signs_replaced || false,
            warning_signs_quantity: rawData.warning_signs_quantity || 0,
            recommendations: rawData.recommendations || '',
            next_service_date: rawData.next_service_date || '',
            date_of_service: rawData.date_of_service || '',
            created_at: rawData.created_at || '',
            updated_at: rawData.updated_at || '',
            reviewed_by_name: rawData.reviewed_by_name,
            reviewed_at: rawData.reviewed_at,
            admin_notes: rawData.admin_notes,
            // Build client object from report data or fallback
            client: {
              id: rawData.client_id || 0,
              name: rawData.client_name || 'Unknown Client',
              address: rawData.client_address || ''
            },
            // Build pco object from report data or fallback  
            pco: {
              id: rawData.pco_id || 0,
              name: rawData.pco_name || 'Unknown PCO',
              pco_number: rawData.pco_number || 'N/A'
            },
            // Use the extracted stations and fumigation data
            inspection_stations: stationsData,
            fumigation_treatments: fumigationData ? [fumigationData] : [],
            stations: stationsData
          };
          
          console.log('✅ Admin Service: Returning processed report');
          return {
            ...response,
            data: processedReport
          };
        }
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('❌ Admin Service: Failed to load report details (admin)', error);
      throw error;
    }
  }

  async downloadReport(reportId: number): Promise<Blob> {
    try {
      console.log('📄 Admin Service: Downloading report', reportId);
      const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
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

  async getInactiveChemicals(): Promise<ApiResponse<Chemical[]>> {
    try {
      const endpoint = '/admin/chemicals/inactive';
      console.log('📡 GET INACTIVE CHEMICALS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.get<Chemical[]>(endpoint);
      
      console.log('✅ Inactive chemicals response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data && Array.isArray(response.data)) {
        console.log('🧪 Number of inactive chemicals returned:', response.data.length || 0);
        console.log('📄 Inactive chemicals data preview:', response.data.slice(0, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get inactive chemicals error:', error);
      throw error;
    }
  }

  async permanentDeleteChemical(id: number): Promise<ApiResponse<{ message: string; deleted_chemical: { id: number; name: string; l_number: string } }>> {
    try {
      const endpoint = `/admin/chemicals/${id}/delete`;
      console.log('📡 PERMANENT DELETE CHEMICAL API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Chemical ID:', id);
      console.log('🚀 Full URL would be: ${BASE_URL}' + endpoint);
      
      const response = await apiClient.delete<{ message: string; deleted_chemical: { id: number; name: string; l_number: string } }>(endpoint);
      
      console.log('✅ Permanent delete chemical response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Permanent delete chemical error:', error);
      throw error;
    }
  }

  // Report-specific admin methods based on admin-report.md
  async deleteReport(reportId: number, force?: boolean): Promise<ApiResponse<{ message: string }>> {
    try {
      const queryParams = force ? '?force=1' : '';
      const endpoint = `/admin/reports/${reportId}${queryParams}`;
      console.log('🗑️ DELETE REPORT API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Report ID:', reportId);
      console.log('⚡ Force delete:', force);
      
      const response = await apiClient.delete<{ message: string }>(endpoint);
      
      console.log('✅ Delete report response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response message:', response.data.message);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Delete report error:', error);
      throw error;
    }
  }

  async emailReport(
    reportId: number, 
    options?: {
      cc?: string[];
      additional_message?: string;
    }
  ): Promise<ApiResponse<{ message: string; recipient: string }>> {
    try {
      const endpoint = `/admin/reports/${reportId}/email`;
      console.log('📧 EMAIL REPORT API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Report ID:', reportId);
      console.log('📋 Options:', options);
      
      const response = await apiClient.post<{ message: string; recipient: string }>(endpoint, options || {});
      
      console.log('✅ Email report response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Email report error:', error);
      throw error;
    }
  }

  async downloadReportPDF(reportId: number): Promise<Blob> {
    try {
      console.log('📄 Admin Service: Downloading report PDF', reportId);
      const blob = await apiClient.getBlob(`/admin/reports/${reportId}/download`);
      console.log('✅ Admin Service: Report PDF downloaded successfully');
      console.log('📄 Blob type:', typeof blob);
      console.log('📄 Blob constructor:', blob.constructor.name);
      console.log('📄 Blob size:', blob.size);
      return blob;
    } catch (error) {
      console.error('❌ Admin Service: Failed to download report PDF', error);
      throw error;
    }
  }

  async getReportStats(): Promise<ApiResponse<{
    overview: {
      total_reports: number;
      draft_reports: number;
      pending_reports: number;
      approved_reports: number;
      declined_reports: number;
      archived_reports: number;
      inspection_reports: number;
      fumigation_reports: number;
      combined_reports: number;
    };
    draft_analysis: {
      total_drafts: number;
      old_drafts_30_days: number;
      old_drafts_7_days: number;
      new_drafts_24h: number;
    };
    recent_activity: Array<{
      status: string;
      count: number;
      date: string;
    }>;
  }>> {
    try {
      const endpoint = '/admin/reports/stats';
      console.log('📊 GET REPORT STATS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      
      const response = await apiClient.get<{
        overview: {
          total_reports: number;
          draft_reports: number;
          pending_reports: number;
          approved_reports: number;
          declined_reports: number;
          archived_reports: number;
          inspection_reports: number;
          fumigation_reports: number;
          combined_reports: number;
        };
        draft_analysis: {
          total_drafts: number;
          old_drafts_30_days: number;
          old_drafts_7_days: number;
          new_drafts_24h: number;
        };
        recent_activity: Array<{
          status: string;
          count: number;
          date: string;
        }>;
      }>(endpoint);
      
      console.log('✅ Report stats response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Stats data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Get report stats error:', error);
      throw error;
    }
  }

  async bulkOperations(operation: 'update_status' | 'delete', data: {
    report_ids: number[];
    status?: string;
    admin_notes?: string;
  }): Promise<ApiResponse<{
    message: string;
    operation: string;
    results: Array<{
      report_id: number;
      status: 'success' | 'error';
      message?: string;
    }>;
  }>> {
    try {
      const endpoint = '/admin/reports/bulk';
      console.log('🔄 BULK OPERATIONS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      console.log('📦 Operation:', operation);
      console.log('📊 Data:', JSON.stringify(data, null, 2));
      
      const requestData = {
        operation,
        ...data
      };
      
      const response = await apiClient.post<{
        message: string;
        operation: string;
        results: Array<{
          report_id: number;
          status: 'success' | 'error';
          message?: string;
        }>;
      }>(endpoint, requestData);
      
      console.log('✅ Bulk operations response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Bulk operations error:', error);
      throw error;
    }
  }

  async cleanupOldDrafts(): Promise<ApiResponse<{
    message: string;
    cleaned_count: number;
    cutoff_date: string;
  }>> {
    try {
      const endpoint = '/admin/reports/cleanup';
      console.log('🧹 CLEANUP OLD DRAFTS API CALL:');
      console.log('🔗 Endpoint:', endpoint);
      
      const response = await apiClient.post<{
        message: string;
        cleaned_count: number;
        cutoff_date: string;
      }>(endpoint, {});
      
      console.log('✅ Cleanup old drafts response:', response);
      console.log('📊 Response status:', response.success ? 'SUCCESS' : 'FAILED');
      if (response.data) {
        console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Cleanup old drafts error:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();

// Re-export types for convenience
export type {
  AdminDashboardData,
  Client,
  AdminClientsResponse,
  DetailedReport,
  AdminReportsResponse,
  ClientNote,
  Assignment,
  User,
  Chemical,
  ChemicalStats
} from '../types/admin';
