import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — auto-inject JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('assetflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors, handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('assetflow_token');
      localStorage.removeItem('assetflow_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
export { BASE_URL };
