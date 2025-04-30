import {AxiosInstance, AxiosRequestConfig} from 'axios';

import axiosInstance from './axiosConfig';
import {API_CONFIG} from './apiConfig';

export interface IApiService<T = unknown> {
  setAxiosInstance(instance: AxiosInstance): void;
  get<R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  put<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  delete<R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  patch<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
}

/**
 * Generic API Service
 *
 * Provides type-safe methods for API operations
 * Uses the centralized axios instance with auth interceptors
 */
export class ApiService<T = unknown> implements IApiService<T> {
  protected axiosInstance: AxiosInstance;

  /**
   * Creates a new ApiService instance
   * @param config Optional custom axios config (defaults to API_CONFIG)
   */
  constructor(config: AxiosRequestConfig = API_CONFIG) {
    // Use the shared axiosInstance with interceptors instead of creating a new instance
    this.axiosInstance = axiosInstance;

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
  async get<R = T>(url: string, config?: AxiosRequestConfig): Promise<R> {
    try {
      const response = await this.axiosInstance.get<R>(url, config);
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
  async post<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    try {
      const response = await this.axiosInstance.post<R>(url, data, config);
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
   * Sets a custom axios instance for this ApiService.
   * This is useful for testing or when you need a different configuration.
   * * @param instance The custom axios instance to use
   *  * @example
   * ```typescript
   * const customAxiosInstance = axios.create({ baseURL: 'https://api.example.com' });
   * const apiService = new ApiService();
   * apiService.setAxiosInstance(customAxiosInstance);
   *
   * **/
  public setAxiosInstance(instance: AxiosInstance): void {
    this.axiosInstance = instance;
  }
  /**
   *
   * @param url
   * @param data
   */
  async put<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    try {
      const response = await this.axiosInstance.put<R>(url, data, config);
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
  async delete<R = T>(url: string, config?: AxiosRequestConfig): Promise<R> {
    try {
      const response = await this.axiosInstance.delete<R>(url, config);
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
  async patch<R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    try {
      const response = await this.axiosInstance.patch<R>(url, data, config);
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
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Singleton instance for general use
export const apiService = new ApiService();
