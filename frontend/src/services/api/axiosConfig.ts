import axios from 'axios';

const isTesting = import.meta.env.NODE_ENV === 'test';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    if (!isTesting) {console.log('Request to', config.url);}

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (!isTesting) {console.error('Request error:', error);}
    return Promise.reject(error);
  }
);

// Add a response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    //if (!isTesting) {console.log('Response from', response.config.url);}
    return response;
  },
  (error) => {
    if (!isTesting) {console.error('Response error:', error);}
    return Promise.reject(error);
  }
);

export default axiosInstance;
