import axios from 'axios';

// PRODUCTION HARDENING: Explicitly target the hosted Render backend with a clean fallback chain
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gymos-backend-e8xs.onrender.com/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for secure server-side HTTP-Only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for dynamic log auditing in dev
client.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
