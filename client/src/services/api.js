import axios from 'axios';

// Use Vite environment variable when available (production builds) otherwise fallback to relative /api for dev + proxy
const apiOrigin = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

const baseURL = apiOrigin ? `${apiOrigin}/api` : '/api';

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

// Response interceptor to handle token expiration and helpful errors
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
      // Helpful console message when frontend is hitting the wrong host (static host returning 405)
      console.error('[API] Method Not Allowed (405) - verify VITE_API_URL / proxy configuration and that the request is targeting your backend server');
    }

    return Promise.reject(error);
  }
);

export default API;
