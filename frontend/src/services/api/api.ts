// src/services/api/api.ts
import { API_CONFIG, setApiBaseUrl } from './apiConfig';
import { apiService } from './apiService';

export { API_CONFIG, setApiBaseUrl }; // Export configuration and setter for external use
export default apiService;
