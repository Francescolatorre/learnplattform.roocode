import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from '../types/authTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Ensure this does not include `api/v1`

export interface ResourceService<T> {
    getAll: (params?: any, config?: any) => Promise<T[]>;
    getById: (id: string | number, params?: any, config?: any) => Promise<T>;
    create: (data?: any, config?: any) => Promise<T>;
    update: (id: string | number, data?: any, config?: any) => Promise<T>;
    replace: (id: string | number, data?: any, config?: any) => Promise<T>;
    delete: (id: string | number, config?: any) => Promise<void>;
    custom: (endpoint: string, method?: string, data?: any, params?: any, config?: any) => Promise<any>;
    get: (endpoint: string, params?: any, config?: any) => Promise<any>; // Add this method
}

export interface ApiServiceInterface {
    request<T>(config: AxiosRequestConfig, customBaseURL?: string): Promise<T>;
    get<T>(endpoint: string, params?: any, config?: any, customBaseURL?: string): Promise<T>;
    post<T>(endpoint: string, data?: any, config?: any, customBaseURL?: string): Promise<T>;
    put<T>(endpoint: string, data?: any, config?: any): Promise<T>;
    patch<T>(endpoint: string, data?: any, config?: any): Promise<T>;
    delete<T>(endpoint: string, config?: any): Promise<T>;
    fetchUserProfile(): Promise<User>;
    createResourceService<T>(resource: string): ResourceService<T>;
    uploadFile<T>(
        endpoint: string,
        fileData: File | Blob,
        fieldName?: string,
        additionalData?: any,
        config?: any
    ): Promise<T>;
    validateToken(): Promise<boolean>;
    fetchUserActivityLogs(userId: string): Promise<any>;
}

class ApiService implements ApiServiceInterface {
    private instance: AxiosInstance;
    private baseURL: string;

    constructor(baseURL = API_BASE_URL, version = 'api/v1') {
        this.baseURL = `${baseURL}/${version}`; // Default base URL with version

        this.instance = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include auth token
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    public async request<T>(config: AxiosRequestConfig, customBaseURL?: string): Promise<T> {
        try {
            const instance = customBaseURL
                ? axios.create({ baseURL: customBaseURL, timeout: 15000 })
                : this.instance;

            const response: AxiosResponse<T> = await instance(config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    public async get<T>(endpoint: string, params = {}, config = {}, customBaseURL?: string): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url: endpoint,
            params: { ...params, includeArchived: true },
            ...config
        }, customBaseURL);
    }

    public async post<T>(endpoint: string, data = {}, config = {}, customBaseURL?: string): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url: endpoint,
            data,
            ...config
        }, customBaseURL);
    }

    public async put<T>(endpoint: string, data = {}, config = {}): Promise<T> {
        return this.request<T>({
            method: 'PUT',
            url: endpoint,
            data,
            ...config
        });
    }

    public async patch<T>(endpoint: string, data = {}, config = {}): Promise<T> {
        return this.request<T>({
            method: 'PATCH',
            url: endpoint,
            data,
            ...config
        });
    }

    public async delete<T>(endpoint: string, config = {}): Promise<T> {
        return this.request<T>({
            method: 'DELETE',
            url: endpoint,
            ...config
        });
    }

    public async fetchUserProfile(): Promise<User> {
        try {
            return await this.get<User>('/users/profile/');
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to fetch user profile.');
        }
    }

    public async fetchUserActivityLogs(userId: string): Promise<any> {
        try {
            return await this.get(`/users/${userId}/activity-logs/`);
        } catch (error) {
            console.error('Error fetching user activity logs:', error);
            throw new Error('Failed to fetch user activity logs.');
        }
    }

    public createResourceService<T>(resource: string): ResourceService<T> {
        const resourcePath = resource.endsWith('/') ? resource : `${resource}/`;

        return {
            getAll: (params = {}, config = {}) => this.get<T[]>(resourcePath, params, config),
            getById: (id: string | number, params = {}, config = {}) =>
                this.get<T>(`${resourcePath}${id}/`, params, config),
            create: (data = {}, config = {}) => this.post<T>(resourcePath, data, config),
            update: (id: string | number, data = {}, config = {}) =>
                this.patch<T>(`${resourcePath}${id}/`, data, config),
            replace: (id: string | number, data = {}, config = {}) =>
                this.put<T>(`${resourcePath}${id}/`, data, config),
            delete: (id: string | number, config = {}) =>
                this.delete<void>(`${resourcePath}${id}/`, config),
            custom: (endpoint: string, method = 'GET', data = {}, params = {}, config = {}) =>
                this.request<any>({
                    method,
                    url: `${resourcePath}${endpoint}`,
                    data: ['POST', 'PUT', 'PATCH'].includes(method) ? data : undefined,
                    params: method === 'GET' ? params : undefined,
                    ...config
                }),
            get: (endpoint: string, params = {}, config = {}) =>
                this.get(`${resourcePath}${endpoint}`, params, config)
        };
    }

    public async uploadFile<T>(
        endpoint: string,
        fileData: File | Blob,
        fieldName = 'file',
        additionalData = {},
        config = {}
    ): Promise<T> {
        const formData = new FormData();
        formData.append(fieldName, fileData);

        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value as string | Blob);
        });

        return this.request<T>({
            method: 'POST',
            url: endpoint,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            ...config
        });
    }

    public async validateToken(): Promise<boolean> {
        try {
            await this.get<any>('/auth/validate-token/');
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    private handleError<T>(error: any): Promise<T> {
        if (axios.isAxiosError(error)) {
            const serverError = error.response?.data;

            if (typeof serverError === 'string') {
                throw new Error(serverError);
            } else if (serverError && typeof serverError === 'object') {
                // Handle different error formats
                if (serverError.detail) {
                    throw new Error(serverError.detail);
                } else if (serverError.message) {
                    throw new Error(serverError.message);
                } else if (serverError.error) {
                    throw new Error(serverError.error);
                }
            }

            // Handle specific HTTP status codes
            if (error.response?.status === 401) {
                console.error('Unauthorized access. Please log in again.');
                window.dispatchEvent(new Event('unauthorized'));
                throw new Error('Unauthorized access. Please log in again.');
            }
            if (error.response?.status === 403) {
                throw new Error('Forbidden. You do not have permission to perform this action.');
            }
            if (error.response?.status === 404) {
                throw new Error('Resource not found.');
            }
            if (error.response?.status === 500) {
                throw new Error('Internal server error. Please try again later.');
            }

            // Fallback error message
            throw new Error(`Request failed with status ${error.response?.status}`);
        }

        // Re-throw non-axios errors
        throw error;
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export pre-configured resource services for common endpoints
export const courseService = apiService.createResourceService('courses');
export const taskService = apiService.createResourceService('tasks');
export const moduleService = apiService.createResourceService('modules');
export const userService = apiService.createResourceService('users');
export const studentService = apiService.createResourceService('students');
