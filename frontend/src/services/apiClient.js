import axios from 'axios';

// Ensure we don't end up with double slashes when composing baseURL
const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: false, // using token auth, not cookies
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
