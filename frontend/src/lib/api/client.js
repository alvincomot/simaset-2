import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('simaset_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize errors and handle 401
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('simaset_token');
      localStorage.removeItem('simaset_user');
      // Dispatch custom event so AuthProvider can sync state immediately
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const normalizedError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Terjadi kesalahan pada server',
      fieldErrors: error.response?.data?.fieldErrors || null,
      raw: error,
    };

    return Promise.reject(normalizedError);
  }
);

export default client;
