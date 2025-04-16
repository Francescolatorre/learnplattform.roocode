import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

import {API_CONFIG} from './apiConfig';

/**
 *
 */
export class ApiService<T = unknown> {
  private api: AxiosInstance;

  /**
   *
   * @param config
   */
  constructor(config: AxiosRequestConfig = API_CONFIG) {
    this.api = axios.create(config);
  }

  /**
   *
   * @param url
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
   * @param token
   */
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Singleton instance for general use
export const apiService = new ApiService();
