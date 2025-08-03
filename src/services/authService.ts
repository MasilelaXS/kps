import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';

// Types based on API documentation
export interface LoginRequest {
  pco_number: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'pco' | 'admin';
  pco_number?: string;
  phone?: string;
  status: string;
}

export interface LoginResponse {
  user: User;
  permissions: string[];
}

export interface LogoutResponse {
  message: string;
}

export interface ChangePasswordRequest {
  user_id: number;
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

class AuthService {
  async loginUser(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 AUTH SERVICE: Attempting user login');
      console.log('🔐 AUTH SERVICE: Request payload:', JSON.stringify(credentials, null, 2));
      console.log('🔐 AUTH SERVICE: Endpoint: POST /auth/login');
      
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('🔐 AUTH SERVICE: Login response received:', JSON.stringify(response, null, 2));
      
      // Store user data if login successful (no tokens to store)
      if (response.success && response.data?.user) {
        localStorage.setItem('kps_user', JSON.stringify(response.data.user));
        localStorage.setItem('kps_permissions', JSON.stringify(response.data.permissions));
        console.log('🔐 AUTH SERVICE: User data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('🔐 AUTH SERVICE: User login error details:');
      console.error('Error object:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: unknown; 
            headers?: unknown 
          }; 
          config?: { 
            url?: string; 
            method?: string; 
            data?: string 
          } 
        };
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        console.error('Response headers:', axiosError.response?.headers);
        console.error('Request config:', axiosError.config);
        console.error('Request URL:', axiosError.config?.url);
        console.error('Request method:', axiosError.config?.method);
        console.error('Request data:', axiosError.config?.data);
      }
      
      throw error;
    }
  }

  async loginAdmin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 AUTH SERVICE: Attempting admin login');
      console.log('🔐 AUTH SERVICE: Request payload:', JSON.stringify(credentials, null, 2));
      console.log('🔐 AUTH SERVICE: Endpoint: POST /auth/login');
      
      // Use the same /auth/login endpoint for both admin and regular users
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('🔐 AUTH SERVICE: Admin login response received:', JSON.stringify(response, null, 2));
      
      // Validate that the user has admin role
      if (response.success && response.data?.user) {
        if (response.data.user.role !== 'admin') {
          console.log('🔐 AUTH SERVICE: User does not have admin role');
          // Return an error if user doesn't have admin privileges
          return {
            success: false,
            message: 'Access denied. This account does not have admin privileges.'
          };
        }
        
        // Store admin data if login successful and user is admin
        localStorage.setItem('kps_user', JSON.stringify(response.data.user));
        localStorage.setItem('kps_permissions', JSON.stringify(response.data.permissions));
        console.log('🔐 AUTH SERVICE: Admin data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('🔐 AUTH SERVICE: Admin login error details:');
      console.error('Error object:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: unknown; 
            headers?: unknown 
          }; 
          config?: { 
            url?: string; 
            method?: string; 
            data?: string 
          } 
        };
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        console.error('Response headers:', axiosError.response?.headers);
        console.error('Request config:', axiosError.config);
        console.error('Request URL:', axiosError.config?.url);
        console.error('Request method:', axiosError.config?.method);
        console.error('Request data:', axiosError.config?.data);
      }
      
      throw error;
    }
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');
      
      // Clear stored data regardless of response
      this.clearAuthData();
      
      return response;
    } catch (error) {
      // Clear data even if logout fails
      this.clearAuthData();
      console.error('Logout error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> {
    try {
      console.log('Attempting password change for user:', data.user_id);
      const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', data);
      console.log('Change password response:', response);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  getUser(): User | null {
    const userData = localStorage.getItem('kps_user');
    return userData ? JSON.parse(userData) : null;
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem('kps_permissions');
    return permissions ? JSON.parse(permissions) : [];
  }

  clearAuthData(): void {
    localStorage.removeItem('kps_user');
    localStorage.removeItem('kps_permissions');
  }
}

export const authService = new AuthService();
