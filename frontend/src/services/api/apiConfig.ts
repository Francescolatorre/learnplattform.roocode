export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Default base URL
};

// Function to update the base URL dynamically
export const setApiBaseUrl = (url: string) => {
  API_CONFIG.BASE_URL = url;
};
