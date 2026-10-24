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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT Token to requests automatically
API.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem('dd_token');
    const token = typeof rawToken === 'string' && rawToken !== 'undefined' && rawToken !== 'null' && rawToken !== '[object Object]' ? rawToken.trim() : '';

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration & 401 unauthorized cleanly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/google');

      const hadToken = Boolean(localStorage.getItem('dd_token'));
      localStorage.removeItem('dd_token');
      localStorage.removeItem('dd_user');

      if (hadToken && !isAuthRoute) {
        const msg = error.response?.data?.message || 'Your session expired. Please login again.';
        const code = error.response?.data?.code || 'TOKEN_EXPIRED';

        window.dispatchEvent(
          new CustomEvent('auth_session_expired', {
            detail: { message: msg, code }
          })
        );
      }
    }

    if (status === 405) {
      console.error(`[API 405 Error] 405 Method Not Allowed when sending to ${requestUrl}. Verify CORS & VITE_API_URL.`);
    }

    return Promise.reject(error);
  }
);

export default API;
