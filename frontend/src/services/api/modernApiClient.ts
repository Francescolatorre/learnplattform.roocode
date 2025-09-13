/**
 * Modern API Client (2025 Best Practices)
 * 
 * This implementation follows current TypeScript/React best practices:
 * - Composition over inheritance
 * - Centralized authentication handling
 * - Minimal abstraction layers
 * - Functional approach with clear separation of concerns
 * - Single responsibility principle
 */

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API_CONFIG available if needed for future enhancements
import axiosInstance from './axiosConfig';

/**
 * Request configuration interface extending Axios config
 */
export interface RequestConfig extends AxiosRequestConfig {
  endpoint?: string;
  retries?: number;
}

/**
 * Response wrapper for consistent error handling
 */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Modern API client that emphasizes composition over inheritance
 * and follows the "functional core, imperative shell" pattern
 */
export class ModernApiClient {
  constructor(private httpClient: AxiosInstance = axiosInstance) {
    // Use the existing configured axios instance with interceptors
  }

  /**
   * Generic request method that handles all HTTP operations
   * @param config Request configuration
   * @returns Promise resolving to the response data
   */
  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.httpClient.request(config);
    
    if (!response?.data) {
      throw new Error(`Request to ${config.url || config.endpoint} returned no data`);
    }
    
    return response.data;
  }

  /**
   * GET request helper
   */
  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ 
      method: 'GET', 
      url, 
      ...config 
    });
  }

  /**
   * POST request helper
   */
  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ 
      method: 'POST', 
      url, 
      data, 
      ...config 
    });
  }

  /**
   * PUT request helper
   */
  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ 
      method: 'PUT', 
      url, 
      data, 
      ...config 
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ 
      method: 'PATCH', 
      url, 
      data, 
      ...config 
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ 
      method: 'DELETE', 
      url, 
      ...config 
    });
  }

  /**
   * Set authentication token (primarily for testing)
   */
  setAuthToken(token: string): void {
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Singleton instance using composition
export const modernApiClient = new ModernApiClient();