// src/services/api/api.ts
import apiService from './apiService';

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  AUTH_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
};

export default apiService;
