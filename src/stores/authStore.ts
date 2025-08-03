import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  permissions: string[];
  login: (pcoNumber: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isSuccess: false,
      permissions: [],

      login: async (pcoNumber: string, password: string, isAdmin = false) => {
        set({ isLoading: true, error: null, isSuccess: false });
        
        try {
          const response = isAdmin 
            ? await authService.loginAdmin({ pco_number: pcoNumber, password })
            : await authService.loginUser({ pco_number: pcoNumber, password });
          
          if (response.success && response.data) {
            const user: User = response.data.user;
            const permissions = response.data.permissions;
            
            set({ 
              user, 
              permissions,
              isAuthenticated: true, 
              isLoading: false,
              isSuccess: true,
              error: null 
            });
            
            // If user is PCO, the main user object now contains all needed data
            if (user.role === 'pco') {
              console.log('🔐 AUTH: PCO user logged in successfully:', user.name);
              // All PCO data is now available in the main user object
            }
            
            // Show success message briefly before redirect
            setTimeout(() => {
              const redirectPath = user.role === 'admin' ? '/admin' : '/mobile';
              window.location.href = redirectPath;
            }, 1000);
          } else {
            // Handle failed response (success: false)
            const errorMessage = response.message || 'Login failed. Please check your credentials.';
            set({ 
              error: errorMessage,
              isLoading: false,
              isSuccess: false,
              isAuthenticated: false,
              user: null,
              permissions: []
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = 'Unable to connect to the server. Please try again.';
          
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { 
              response?: { 
                status?: number;
                data?: { 
                  message?: string; 
                  error?: string;
                  errors?: Record<string, string[]>;
                } 
              } 
            };
            
            const status = axiosError.response?.status;
            const responseData = axiosError.response?.data;
            
            if (status === 401) {
              errorMessage = 'Invalid PCO number or password. Please try again.';
            } else if (status === 403) {
              errorMessage = isAdmin 
                ? 'Access denied. This account does not have admin privileges.'
                : 'Access denied. Please contact your administrator.';
            } else if (status === 422) {
              // Validation errors
              if (responseData?.errors) {
                const validationErrors = Object.values(responseData.errors).flat();
                errorMessage = validationErrors.join(', ');
              } else {
                errorMessage = 'Please check your input and try again.';
              }
            } else if (status === 429) {
              errorMessage = 'Too many login attempts. Please wait a moment and try again.';
            } else if (status === 500) {
              errorMessage = 'Server error. Please try again later or contact support.';
            } else if (responseData?.message) {
              errorMessage = responseData.message;
            } else if (responseData?.error) {
              errorMessage = responseData.error;
            }
          } else if (error && typeof error === 'object' && 'message' in error) {
            // Network or other errors
            const networkError = error as { message: string };
            if (networkError.message.includes('Network Error')) {
              errorMessage = 'Network error. Please check your internet connection.';
            } else if (networkError.message.includes('timeout')) {
              errorMessage = 'Request timed out. Please try again.';
            }
          }
          
          set({ 
            error: errorMessage,
            isLoading: false,
            isSuccess: false,
            isAuthenticated: false,
            user: null,
            permissions: []
          });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear auth store
        set({ 
          user: null, 
          permissions: [],
          isAuthenticated: false, 
          isSuccess: false,
          error: null 
        });
        window.location.href = '/login';
      },

      clearError: () => {
        set({ error: null, isSuccess: false });
      }
    }),
    {
      name: 'kps-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
