import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'; // Base URL includes /api/v1

class ApiService {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL, // Use the baseURL with /api/v1
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.instance.interceptors.request.use(
      config => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.instance.interceptors.response.use(
      response => {
        console.log('API Response:', response); // Debug log for all responses
        return response;
      },
      error => {
        console.error('API Error:', error.response || error.message); // Debug log for errors
        return Promise.reject(error);
      }
    );
  }

  public get<T>(endpoint: string, params = {}): Promise<T> {
    return this.instance.get(endpoint, { params }).then(response => response.data);
  }

  public post<T>(endpoint: string, data = {}): Promise<T> {
    return this.instance.post(endpoint, data).then(response => response.data);
  }

  public put<T>(endpoint: string, data = {}): Promise<T> {
    return this.instance.put(endpoint, data).then(response => response.data);
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.instance.delete(endpoint).then(response => response.data);
  }

  public createResourceService<T>(resource: string) {
    const resourcePath = resource.endsWith('/') ? resource : `${resource}/`;

    return {
      getAll: (params = {}) => this.get<T[]>(resourcePath, params),
      getById: (id: string | number, params = {}) => this.get<T>(`${resourcePath}${id}/`, params),
      create: (data = {}) => this.post<T>(resourcePath, data),
      update: (id: string | number, data = {}) => this.put<T>(`${resourcePath}${id}/`, data),
      delete: (id: string | number) => this.delete<void>(`${resourcePath}${id}/`),
    };
  }
}

// Export an instance of the ApiService class
const apiService = new ApiService(API_BASE_URL);
export default apiService;
