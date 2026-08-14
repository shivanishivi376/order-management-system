import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ── Request interceptor ───────────────────────────────────────────────────
// Automatically attaches the JWT token to every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────
// If the server responds with 401 (token expired / invalid), automatically
// log the user out and redirect them to the login page.
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses straight through
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch logout to clear Redux state and localStorage
      store.dispatch(logout());
      // Redirect to login — using window.location because we are outside React here
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
