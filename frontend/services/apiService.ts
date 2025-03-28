import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
});

apiClient.interceptors.request.use((config) => {
    // Avoid duplicate requests by adding a unique identifier
    if (!config.headers['X-Request-ID']) {
        config.headers['X-Request-ID'] = `${Date.now()}-${Math.random()}`;
    }
    return config;
});

export default apiClient;
