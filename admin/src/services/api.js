import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL,
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dd_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 405) {
      console.error('[API 405 Error] Method Not Allowed. Request URL:', error.config?.url, 'Full Target:', `${error.config?.baseURL}${error.config?.url}`);
    }
    if (error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504)) {
      error.response.data = {
        success: false,
        message: `Backend server is offline or unreachable (${error.response.status} Bad Gateway). Make sure Node server is running on port 5000.`
      };
    }
    return Promise.reject(error);
  }
);

export default API;
