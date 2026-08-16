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

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dd_admin_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const fullTarget = `${error.config?.baseURL || ''}${requestUrl}`;

    if (status === 405) {
      console.error(`[API 405 Error] 405 Method Not Allowed when sending to ${fullTarget}. Verify VITE_API_URL or backend CORS routing.`);
    }

    if (error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504)) {
      error.response.data = {
        success: false,
        message: `Backend server is offline or unreachable (${error.response.status} Bad Gateway). Make sure Node server is running on Render (https://dd-mystery.onrender.com).`
      };
    }
    return Promise.reject(error);
  }
);

export default API;
