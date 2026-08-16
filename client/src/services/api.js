import axios from 'axios';

// Default Production Render Express Backend
const RENDER_BACKEND_URL = 'https://dd-mystery.onrender.com';

const getBaseURL = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // If running in browser on production domain (e.g. vercel.app), default directly to Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${RENDER_BACKEND_URL}/api`;
  }

  // Local development fallback
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT Token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dd_token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiration and helpful 405 error diagnostics
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const fullTarget = `${error.config?.baseURL || ''}${requestUrl}`;

    if (status === 405) {
      console.error(`[API 405 Error] 405 Method Not Allowed when sending to ${fullTarget}. Verify VITE_API_URL or backend CORS routing.`);
    }

    if (status === 401) {
      localStorage.removeItem('dd_token');
      localStorage.removeItem('dd_user');
      window.dispatchEvent(new Event('auth_logout'));
    }

    return Promise.reject(error);
  }
);

export default API;
