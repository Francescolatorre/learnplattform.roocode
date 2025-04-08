import axios, {InternalAxiosRequestConfig} from 'axios';
import {API_CONFIG} from './apiConfig';

const apiService = axios.create({
  baseURL: `${API_CONFIG.baseURL}/${API_CONFIG.version}`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for auth
apiService.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('Using token:', token.slice(0, 10) + '...'); // Debug token usage
  } else {
    console.debug('No token found in localStorage');
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
apiService.interceptors.response.use(
  response => {
    console.debug('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default apiService;
