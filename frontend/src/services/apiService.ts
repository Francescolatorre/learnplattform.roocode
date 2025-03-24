import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = 'api/v1';

class ApiService {
    private instance: AxiosInstance;
    private baseURL: string;

    constructor(baseURL = API_BASE_URL, version = API_VERSION) {
        this.baseURL = `${baseURL}/${version}`;

        this.instance = axios.create({
            baseURL: this.baseURL,
            timeout: 15000, // 15 seconds
            headers: {
                'Content-Type': 'application/json'
            }
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
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for token refresh
        this.instance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 (Unauthorized) and we haven't already tried to refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh the token
                        const refreshToken = localStorage.getItem('refresh_token');
                        if (!refreshToken) {
                            // If no refresh token, user must login again
                            this.handleLogout();
                            return Promise.reject(error);
                        }

                        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                            refresh: refreshToken
                        });

                        // Save the new access token
                        const { access } = response.data;
                        localStorage.setItem('access_token', access);

                        // Update the original request with the new token
                        originalRequest.headers['Authorization'] = `Bearer ${access}`;

                        // Retry the original request
                        return this.instance(originalRequest);
                    } catch (refreshError) {
                        // If token refresh fails, user must login again
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

        // Redirect to login page - this assumes you're using React Router
        // If not using client-side routing, you may want to handle this differently
        window.location.href = '/login';
    }

    // Generic request method
    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance(config);
            return response.data;
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    // Helper methods for common HTTP methods
    public async get<T>(endpoint: string, params = {}, config = {}): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url: endpoint,
            params,
            ...config
        });
    }

    public async post<T>(endpoint: string, data = {}, config = {}): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url: endpoint,
            data,
            ...config
        });
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
        console.log('Validating token...');
        try {
            const response = await this.get('/auth/validate-token/'); // Replace with your backend's token validation endpoint
            console.log('Token validation response status:', response.status);
            return response.status === 200; // Ensure the response indicates a valid token
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
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

