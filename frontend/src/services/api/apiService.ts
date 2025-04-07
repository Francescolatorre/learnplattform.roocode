import axios from 'axios';
import {API_CONFIG} from './apiConfig';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('authToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

class ApiService {
  private instance = axiosInstance;

  public get<T>(endpoint: string, params = {}): Promise<T> {
    return this.instance.get(endpoint, {params}).then(response => response.data);
  }

  public patch<T>(endpoint: string, data = {}): Promise<T> {
    return this.instance.patch(endpoint, data).then(response => response.data);
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

  // Reintroduce createResourceService for reusable CRUD operations
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

const apiService = new ApiService();
export default apiService;
