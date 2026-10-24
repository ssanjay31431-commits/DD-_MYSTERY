import axios from 'axios';

const RAILWAY_API_URL = 'https://dd-mystery-production.up.railway.app';

const getBaseURL = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/$/, '');
    const apiUrl = /^https?:\/\/[^/]*\.onrender\.com(?:\/|$)/i.test(clean) ? RAILWAY_API_URL : clean;
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }

  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return '/api';
  }

  return `${RAILWAY_API_URL}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

// Interceptor to attach JWT Token to requests automatically (admin token)
API.interceptors.request.use((config) => {
  const rawToken = localStorage.getItem('dd_admin_token');
  const token = typeof rawToken === 'string' && rawToken !== 'undefined' && rawToken !== 'null' && rawToken !== '[object Object]' ? rawToken.trim() : '';

  // Only attach Authorization if token looks like a real JWT (three base64url parts separated by dots)
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  if (token && jwtRegex.test(token)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
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

    if (status === 401 && localStorage.getItem('dd_admin_token')) {
      localStorage.removeItem('dd_admin_token');
      localStorage.removeItem('dd_admin_user');
      window.dispatchEvent(new Event('auth_logout'));
    }

    if (error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504)) {
      error.response.data = {
        success: false,
        message: `Backend server is offline or unreachable (${error.response.status} Bad Gateway). Check the backend deployment and VITE_API_URL configuration.`
      };
    }
    return Promise.reject(error);
  }
);

export default API;
