import { apiClient } from './apiClient';
import { useAuthStore } from '../stores/authStore';
import type { 
  DashboardData, 
  AssignedClient, 
  ClientDetails, 
  ReportSubmission,
  ReportData,
  ReportDraft,
  Chemical,
  ChangePasswordRequest 
} from '../types/mobile';

class MobileService {
  private basePath = '/pco';

  // Helper method to get PCO authentication headers
  private getPcoHeaders() {
    const authState = useAuthStore.getState();
    const pcoId = authState.user?.id;
    
    if (!pcoId) {
      console.warn('No PCO ID available for headers');
      return {};
    }

    return {
      'X-PCO-ID': pcoId.toString(),
      'X-User-ID': pcoId.toString(),
      'X-User-Role': 'pco'
    };
  }

  // Dashboard Data
  async getDashboard(pcoId?: number): Promise<DashboardData> {
    const params = new URLSearchParams();
    if (pcoId) params.append('pco_id', pcoId.toString());
    
    const url = params.toString() ? `${this.basePath}/dashboard?${params.toString()}` : `${this.basePath}/dashboard`;
    const response = await apiClient.get(url, {
      headers: this.getPcoHeaders()
    });
    return response.data as DashboardData;
  }

  // Client Management
  async getAssignedClients(search?: string, pcoId?: number): Promise<AssignedClient[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (pcoId) params.append('pco_id', pcoId.toString());
    
    const response = await apiClient.get(`${this.basePath}/clients?${params.toString()}`, {
      headers: this.getPcoHeaders()
    });
    return response.data as AssignedClient[];
  }

  async getClientDetails(clientId: number): Promise<ClientDetails> {
    const response = await apiClient.get(`${this.basePath}/clients/${clientId}`, {
      headers: this.getPcoHeaders()
    });
    return response.data as ClientDetails;
  }

  // Report Management
  async getReports(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    client_id?: number;
  }): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await apiClient.get(`${this.basePath}/reports?${params.toString()}`, {
      headers: this.getPcoHeaders()
    });
    return response.data as unknown[];
  }

  async getReport(reportId: number): Promise<unknown> {
    const response = await apiClient.get(`${this.basePath}/reports/${reportId}`, {
      headers: this.getPcoHeaders()
    });
    return response.data as unknown;
  }

  async createReport(data: ReportSubmission): Promise<{ success: boolean; message: string; report_id?: number }> {
    console.log('🚀 MOBILE SERVICE: About to make API call...');
    console.log('📊 Data being sent:', JSON.stringify(data, null, 2));
    
    const response = await apiClient.post(`${this.basePath}/reports`, data, {
      headers: this.getPcoHeaders()
    });
    
    // Try to handle all possible response structures
    let finalResult;
    
    if (response && typeof response === 'object') {
      // Case 1: Response has nested structure { success: true, data: { ... } }
      if (response.success && response.data && typeof response.data === 'object') {
        console.log('📦 Using nested structure: response.success + response.data');
        const data = response.data as { message?: string; report_id?: number };
        finalResult = {
          success: true,
          message: data?.message || response.message || 'Report created successfully',
          report_id: data?.report_id || (response as { report_id?: number }).report_id
        };
      }
      // Case 2: Response is flattened { message: ..., report_id: ..., success: ... }
      else if (response.message !== undefined) {
        console.log('📦 Using flattened structure: direct response fields');
        finalResult = {
          success: response.success !== false, // Assume success if not explicitly false
          message: response.message,
          report_id: (response as { report_id?: number }).report_id
        };
      }
      // Case 3: Response has success field but no nested data
      else if (response.success !== undefined) {
        console.log('📦 Using success field only');
        finalResult = {
          success: response.success,
          message: response.message || 'Unknown response',
          report_id: (response as { report_id?: number }).report_id
        };
      }
      // Case 4: Fallback - assume success if we got here without error
      else {
        console.log('📦 Using fallback - assuming success');
        finalResult = {
          success: true,
          message: 'Report created successfully',
          report_id: (response as { report_id?: number }).report_id
        };
      }
    } else {
      console.log('❌ Response is not a valid object');
      finalResult = {
        success: false,
        message: 'Invalid response from server'
      };
    }
    
    console.log('🎯 FINAL RESULT being returned:', JSON.stringify(finalResult, null, 2));
    return finalResult;
  }

  async updateReport(reportId: number, data: Partial<ReportSubmission>): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`${this.basePath}/reports/${reportId}`, data, {
      headers: this.getPcoHeaders()
    });
    return response.data as { success: boolean; message: string };
  }

  async deleteReport(reportId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.basePath}/reports/${reportId}`, {
      headers: this.getPcoHeaders()
    });
    return response.data as { success: boolean; message: string };
  }

  // Chemical Management
  async getChemicals(): Promise<Chemical[]> {
    const response = await apiClient.get(`${this.basePath}/chemicals`, {
      headers: this.getPcoHeaders()
    });
    return response.data as Chemical[];
  }

  // Profile Management
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data as { success: boolean; message: string };
  }

  // File Upload (for signatures)
  async uploadSignature(file: Blob, reportId?: number): Promise<{ success: boolean; url?: string }> {
    const formData = new FormData();
    formData.append('signature', file, 'signature.png');
    if (reportId) formData.append('report_id', reportId.toString());

    const response = await apiClient.post('/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as { success: boolean; url?: string };
  }

  // Offline Support - Draft Management
  async saveDraft(draftId: string, reportData: Partial<ReportData> & { client_id: number; current_step: string }): Promise<void> {
    // Save to localStorage for offline support
    const draft: ReportDraft = {
      id: draftId,
      client_id: reportData.client_id,
      data: reportData,
      current_step: reportData.current_step,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const existingDrafts = this.getDrafts();
    const draftIndex = existingDrafts.findIndex(d => d.id === draftId);
    
    if (draftIndex >= 0) {
      existingDrafts[draftIndex] = { ...existingDrafts[draftIndex], ...draft };
    } else {
      existingDrafts.push(draft);
    }
    
    localStorage.setItem('pco_report_drafts', JSON.stringify(existingDrafts));
  }

  getDrafts(): ReportDraft[] {
    const drafts = localStorage.getItem('pco_report_drafts');
    return drafts ? JSON.parse(drafts) : [];
  }

  async deleteDraft(draftId: string): Promise<void> {
    const existingDrafts = this.getDrafts();
    const filteredDrafts = existingDrafts.filter(d => d.id !== draftId);
    localStorage.setItem('pco_report_drafts', JSON.stringify(filteredDrafts));
  }

  async clearAllDrafts(): Promise<void> {
    localStorage.removeItem('pco_report_drafts');
  }
}

export const mobileService = new MobileService();
