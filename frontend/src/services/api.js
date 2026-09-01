import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Intercept requests to attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('kaveri_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses for global 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kaveri_token');
      localStorage.removeItem('kaveri_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
