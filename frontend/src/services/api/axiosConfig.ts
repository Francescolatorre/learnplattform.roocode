import axios from 'axios';

import {useAuth} from '@context/auth/AuthContext';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the authentication token
axiosInstance.interceptors.request.use(
  (config: import('axios').AxiosRequestConfig): import('axios').AxiosRequestConfig => {
    const {getAccessToken} = useAuth();
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async (error: unknown): Promise<never> => Promise.reject(error)
);

export default axiosInstance;
