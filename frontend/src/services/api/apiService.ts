import {AxiosInstance, AxiosRequestConfig} from 'axios';

import axiosInstance from './axiosConfig';
import {API_CONFIG} from './apiConfig';

/**
 * Generic API Service
 *
 * Provides type-safe methods for API operations
 * Uses the centralized axios instance with auth interceptors
 */
export class ApiService<T = unknown> {
  protected api: AxiosInstance;

  /**
   * Creates a new ApiService instance
   * @param config Optional custom axios config (defaults to API_CONFIG)
   */
  constructor(config: AxiosRequestConfig = API_CONFIG) {
    // Use the shared axiosInstance with interceptors instead of creating a new instance
    this.api = axiosInstance;

    // Apply any custom configurations if needed
    if (config.baseURL && config.baseURL !== API_CONFIG.baseURL) {
      console.warn('Custom baseURL detected. This may override global configuration.');
    }
  }

  /**
   * Performs a GET request to the specified URL
   * @param url The endpoint URL
   * @returns Promise resolving to the response data
   */
  async get(url: string): Promise<T> {
    try {
      const response = await this.api.get<T>(url);
      if (!response || typeof response.data === 'undefined') {
        const status = response?.status ?? 'unknown';
        throw new Error(`GET request to ${url} did not return data (status: ${status})`);
      }
      return response.data;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param data
   */
  async post<U = unknown>(url: string, data: U): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data);
      if (!response || typeof response.data === 'undefined') {
        const status = response?.status ?? 'unknown';
        throw new Error(`POST request to ${url} did not return data (status: ${status})`);
      }
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param data
   */
  async put<U = unknown>(url: string, data: U): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data);
      if (!response || typeof response.data === 'undefined') {
        const status = response?.status ?? 'unknown';
        throw new Error(`PUT request to ${url} did not return data (status: ${status})`);
      }
      return response.data;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  /**
   *
   * @param url
   */
  async delete(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(url);
      if (!response || typeof response.data === 'undefined') {
        const status = response?.status ?? 'unknown';
        throw new Error(`DELETE request to ${url} did not return data (status: ${status})`);
      }
      return response.data;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param data
   */
  async patch<U = unknown>(url: string, data: U): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data);
      if (!response || typeof response.data === 'undefined') {
        const status = response?.status ?? 'unknown';
        throw new Error(`PATCH request to ${url} did not return data (status: ${status})`);
      }
      return response.data;
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }

  /**
   * Sets the Authorization header for this ApiService instance.
   * @param token The authentication token
   */
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Singleton instance for general use
export const apiService = new ApiService();
