import axios from 'axios';

import {API_CONFIG} from './apiConfig';

const api = axios.create(API_CONFIG);

export const apiServiceBase = {
  get: async (url: string) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  },
  post: async (url: string, data: any) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  },
  put: async (url: string, data: any) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  },
  delete: async (url: string) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  },
  patch: async (url: string, data: any) => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  },
};

export const apiService = <T>() => ({
  get: async (url: string): Promise<T> => {
    try {
      const response = await api.get(url);
      return response.data as T;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  },
  post: async <U>(url: string, data: U): Promise<T> => {
    try {
      const response = await api.post(url, data);
      return response.data as T;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  },
  put: async <U>(url: string, data: U): Promise<T> => {
    try {
      const response = await api.put(url, data);
      return response.data as T;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  },
  delete: async (url: string): Promise<T> => {
    try {
      const response = await api.delete(url);
      return response.data as T;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  },
  patch: async <U>(url: string, data: U): Promise<T> => {
    try {
      const response = await api.patch(url, data);
      return response.data as T;
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  },
});
