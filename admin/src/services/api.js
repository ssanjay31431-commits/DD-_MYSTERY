import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
