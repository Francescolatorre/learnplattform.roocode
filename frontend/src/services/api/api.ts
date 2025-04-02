// src/services/api/api.ts
import apiService from './apiService';
import { API_CONFIG, setApiBaseUrl } from './apiConfig';

export { API_CONFIG, setApiBaseUrl }; // Export configuration and setter for external use
export default apiService;
