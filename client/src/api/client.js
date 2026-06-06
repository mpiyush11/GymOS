import axios from 'axios';

// PRODUCTION ALIGNMENT: Match exact named instance signature expected by context routes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gymos-backend-e8xs.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for backend cookie verification lifecycle
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor sequence layer
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
