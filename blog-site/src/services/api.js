import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response;
    },
    (error) => {
        // Handle errors
        if (error.response) {
            const { status, data } = error.response;

            // Extract error message from new API format
            const errorMessage = data?.message || 'An error occurred';
            const errors = data?.errors || [];

            // Handle 401 Unauthorized - token expired or invalid
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // Create detailed error object
            const detailedError = new Error(errorMessage);
            detailedError.statusCode = status;
            detailedError.errors = errors;
            detailedError.response = error.response;

            return Promise.reject(detailedError);
        }

        // Network error or no response
        const networkError = new Error('Network error. Please check your connection.');
        networkError.statusCode = 0;
        return Promise.reject(networkError);
    }
);

export default api;
