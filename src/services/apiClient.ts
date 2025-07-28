import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Response types based on the documentation
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

// Create axios instance with base configuration
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor (no tokens needed)
    this.client.interceptors.request.use(
      (config) => {
        console.log('Making API request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          data: config.data
        });
        // No token injection needed based on API documentation
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API response received:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('API response error:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message
        });
        // Handle 401 unauthorized - redirect to login (no token management needed)
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('🌐 API CLIENT PUT REQUEST:');
    console.log('🔗 URL:', url);
    console.log('📦 Data:', JSON.stringify(data, null, 2));
    console.log('⚙️ Config:', config);
    
    const response = await this.client.put(url, data, config);
    
    console.log('📨 API CLIENT PUT RESPONSE:');
    console.log('📊 Status:', response.status);
    console.log('📋 Data:', JSON.stringify(response.data, null, 2));
    console.log('🏷️ Headers:', response.headers);
    
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
