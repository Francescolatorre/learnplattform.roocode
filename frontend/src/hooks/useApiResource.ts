import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Ensure this matches Swagger

// Generic type for response data
type ApiResponse<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (id: string | number, data: Partial<T>) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T | null>;
  remove: (id: string | number) => Promise<boolean>;
};

// Standard error handler
const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Check if we have a specific error message from the server
    if (axiosError.response?.data) {
      const data = axiosError.response.data as any;
      if (typeof data === 'string') return data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.error) return data.error;

      // Handle validation errors (often returned as an object of field errors)
      if (typeof data === 'object') {
        const errorMessages = Object.entries(data)
          .filter(([_, value]) => !!value)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`);

        if (errorMessages.length > 0) {
          return errorMessages.join(' | ');
        }
      }
    }

    // Handle specific HTTP status codes
    if (axiosError.response?.status === 401) {
      return 'Unauthorized access. Please log in again.';
    }
    if (axiosError.response?.status === 403) {
      return 'Forbidden. You do not have permission to perform this action.';
    }
    if (axiosError.response?.status === 404) {
      return 'Resource not found.';
    }
    if (axiosError.response?.status === 500) {
      return 'Internal server error. Please try again later.';
    }

    // Fallback to status text or generic message
    return axiosError.response?.statusText || 'Network error occurred';
  }

  // For non-Axios errors
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Creates hooks for standard API operations on a resource
 * @param endpoint API endpoint for the resource
 */
export function createApiHook<T, ID = string | number>(endpoint: string) {
  // Form the full URL for the resource
  const resourceUrl = `${API_BASE_URL}/api/v1/${endpoint}`; // Ensure correct API version and path

  // Hook for fetching a collection of resources
  const useCollection = (
    config: AxiosRequestConfig = {}
  ): ApiResponse<{ count: number; next: string | null; previous: string | null; results: T[] }> => {
    const [data, setData] = useState<{
      count: number;
      next: string | null;
      previous: string | null;
      results: T[];
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<{
          count: number;
          next: string | null;
          previous: string | null;
          results: T[];
        }>(resourceUrl, {
          ...config,
          headers: {
            ...getAuthHeaders(),
            ...config.headers,
          },
        });

        setData(response.data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    }, [resourceUrl, config]); // Added `resourceUrl` and `config` to dependency array

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const create = async (newData: Partial<T>): Promise<T | null> => {
      try {
        const response = await axios.post<T>(resourceUrl, newData, {
          headers: getAuthHeaders(),
        });

        // Update the local data state if successful
        setData(prevData =>
          prevData
            ? { ...prevData, results: [...prevData.results, response.data] }
            : { count: 1, next: null, previous: null, results: [response.data] }
        );

        return response.data;
      } catch (err) {
        setError(handleError(err));
        return null;
      }
    };

    const update = async (id: string | number, updatedData: Partial<T>): Promise<T | null> => {
      try {
        const response = await axios.patch<T>(`${resourceUrl}/${id}/`, updatedData, {
          headers: getAuthHeaders(),
        });

        // Update the local data state if successful
        setData(prevData =>
          prevData
            ? {
                ...prevData,
                results: prevData.results.map(item =>
                  (item as any).id === id ? response.data : item
                ),
              }
            : null
        );

        return response.data;
      } catch (err) {
        setError(handleError(err));
        return null;
      }
    };

    const remove = async (id: string | number): Promise<boolean> => {
      try {
        await axios.delete(`${resourceUrl}/${id}/`, {
          headers: getAuthHeaders(),
        });

        // Remove the item from local state
        setData(prevData =>
          prevData
            ? { ...prevData, results: prevData.results.filter(item => (item as any).id !== id) }
            : null
        );

        return true;
      } catch (err) {
        setError(handleError(err));
        return false;
      }
    };

    return {
      data,
      loading,
      error,
      refetch: fetchData,
      update,
      create,
      remove,
    };
  };

  // Hook for fetching a single resource by ID
  const useResource = (id: ID | null, config: AxiosRequestConfig = {}): ApiResponse<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(id !== null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      if (id === null) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<T>(`${resourceUrl}/${id}/`, {
          ...config,
          headers: {
            ...getAuthHeaders(),
            ...config.headers,
          },
        });

        setData(response.data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    }, [id]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const update = async (
      resourceId: string | number,
      updatedData: Partial<T>
    ): Promise<T | null> => {
      try {
        const response = await axios.patch<T>(`${resourceUrl}/${resourceId}/`, updatedData, {
          headers: getAuthHeaders(),
        });

        // Update the local data state if successful
        if (resourceId === id) {
          setData(response.data);
        }

        return response.data;
      } catch (err) {
        setError(handleError(err));
        return null;
      }
    };

    const create = async (newData: Partial<T>): Promise<T | null> => {
      try {
        const response = await axios.post<T>(resourceUrl, newData, {
          headers: getAuthHeaders(),
        });

        return response.data;
      } catch (err) {
        setError(handleError(err));
        return null;
      }
    };

    const remove = async (resourceId: string | number): Promise<boolean> => {
      try {
        await axios.delete(`${resourceUrl}/${resourceId}/`, {
          headers: getAuthHeaders(),
        });

        // If we deleted the current resource, clear it from state
        if (resourceId === id) {
          setData(null);
        }

        return true;
      } catch (err) {
        setError(handleError(err));
        return false;
      }
    };

    return {
      data,
      loading,
      error,
      refetch: fetchData,
      update,
      create,
      remove,
    };
  };

  return {
    useCollection,
    useResource,
  };
}

// Export some commonly used API hooks
export const useCourses = createApiHook<any>('courses');
export const useTasks = createApiHook<any>('tasks');
export const useModules = createApiHook<any>('modules');

interface IApiResourceOptions {
  [key: string]: any;
}

export const useApiResource = (endpoint: string, options: IApiResourceOptions = {}) => {
  const queryKey = [endpoint, options];

  const queryFn = async () => {
    const { data } = await axios.get(endpoint, { params: options });
    return data;
  };

  return useQuery(queryKey, queryFn);
};
