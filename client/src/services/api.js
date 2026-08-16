import axios from 'axios';

// Use Vite environment variable when available (production builds) otherwise fallback to relative /api for dev + proxy
const apiOrigin = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

const baseURL = apiOrigin ? (apiOrigin.endsWith('/api') ? apiOrigin : `${apiOrigin}/api`) : '/api';

const API = axios.create({
  baseURL,
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
    if (status === 401) {
      localStorage.removeItem('dd_token');
      localStorage.removeItem('dd_user');
      window.dispatchEvent(new Event('auth_logout'));
    }

    if (status === 405) {
      console.error('[API 405 Error] Method Not Allowed. Request URL:', error.config?.url, 'Target:', `${error.config?.baseURL}${error.config?.url}`);
      console.error('[API] Verify VITE_API_URL / proxy configuration and that the request is targeting your backend server.');
    }

    return Promise.reject(error);
  }
);

export default API;
