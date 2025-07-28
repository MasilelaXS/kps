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
  status: string;
}

export interface LoginResponse {
  user: User;
  permissions: string[];
}

export interface LogoutResponse {
  message: string;
}

class AuthService {
  async loginUser(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('Attempting user login with:', { pco_number: credentials.pco_number });
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('User login response:', response);
      
      // Store user data if login successful (no tokens to store)
      if (response.success && response.data?.user) {
        localStorage.setItem('kps_user', JSON.stringify(response.data.user));
        localStorage.setItem('kps_permissions', JSON.stringify(response.data.permissions));
        console.log('User data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('User login error:', error);
      throw error;
    }
  }

  async loginAdmin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('Attempting admin login with:', { pco_number: credentials.pco_number });
      // Use the same /auth/login endpoint for both admin and regular users
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('Admin login response:', response);
      
      // Validate that the user has admin role
      if (response.success && response.data?.user) {
        if (response.data.user.role !== 'admin') {
          // Return an error if user doesn't have admin privileges
          return {
            success: false,
            message: 'Access denied. This account does not have admin privileges.'
          };
        }
        
        // Store admin data if login successful and user is admin
        localStorage.setItem('kps_user', JSON.stringify(response.data.user));
        localStorage.setItem('kps_permissions', JSON.stringify(response.data.permissions));
        console.log('Admin data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('Admin login error:', error);
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
