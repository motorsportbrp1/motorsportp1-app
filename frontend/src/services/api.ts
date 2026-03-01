import axios from 'axios';

// Create a configured Axios instance
const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const formattedBaseUrl = envUrl.endsWith('/api/v1')
    ? envUrl
    : `${envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl}/api/v1`;

const api = axios.create({
    baseURL: formattedBaseUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // We can add auth tokens here later
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Global error handling
        if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('API No Response:', error.request);
        } else {
            console.error('API Error Setup:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
