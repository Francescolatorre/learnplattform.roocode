import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Ensure this does not include `api/v1`

class ApiService {
    private instance: AxiosInstance;
    private baseURL: string;

    constructor(baseURL = API_BASE_URL, version = 'api/v1') {
        this.baseURL = `${baseURL}/${version}`; // Default base URL with version

        this.instance = axios.create({
            baseURL: this.baseURL, // Default baseURL
            timeout: 15000, // 15 seconds
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include auth token
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`; // Use JWT Bearer token
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for token refresh
        this.instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refresh_token');
                        if (!refreshToken) {
                            this.handleLogout();
                            return Promise.reject(error);
                        }

                        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                            refresh: refreshToken,
                        });

                        const { access } = response.data;
                        localStorage.setItem('access_token', access);

                        originalRequest.headers['Authorization'] = `Bearer ${access}`;
                        return this.instance(originalRequest);
                    } catch (refreshError) {
                        this.handleLogout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private handleLogout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }

    // Generic request method with optional custom base URL
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

    // Helper methods for common HTTP methods
    public async get<T>(endpoint: string, params = {}, config = {}, customBaseURL?: string): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url: endpoint,
            params: { ...params, includeArchived: true }, // Add default query parameter for including archived data
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

    // Error handling
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
                } else {
                    // Combine field errors
                    const fieldErrors = Object.entries(serverError)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join('; ');

                    if (fieldErrors) {
                        throw new Error(fieldErrors);
                    }
                }
            }

            // Handle specific HTTP status codes
            if (error.response?.status === 401) {
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

    // Create a resource-specific API service instance
    public createResourceService<T>(resource: string) {
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
                })
        };
    }

    // Method to upload files
    public async uploadFile<T>(
        endpoint: string,
        fileData: File | Blob,
        fieldName = 'file',
        additionalData = {},
        config = {}
    ): Promise<T> {
        const formData = new FormData();
        formData.append(fieldName, fileData);

        // Add any additional fields
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

    // Method to validate token
    public async validateToken(): Promise<boolean> {
        try {
            const response = await this.get<any>('/auth/validate-token/'); // Ensure correct endpoint
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    // Method to fetch user profile
    public async fetchUserProfile(): Promise<any> {
        try {
            const response = await this.get('/users/profile/');
            return response; // Return user profile data
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to fetch user profile.');
        }
    }

    // Method to fetch user activity logs
    public async fetchUserActivityLogs(userId: string): Promise<any> {
        try {
            const response = await this.get(`/users/${userId}/activity-logs/`);
            return response; // Return activity logs
        } catch (error) {
            console.error('Error fetching user activity logs:', error);
            throw new Error('Failed to fetch user activity logs.');
        }
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; // Ensure this default export exists

// Export pre-configured resource services for common endpoints
export const courseService = apiService.createResourceService('courses');
export const taskService = apiService.createResourceService('tasks');
export const moduleService = apiService.createResourceService('modules');
export const userService = apiService.createResourceService('users');
export const studentService = apiService.createResourceService('students');

