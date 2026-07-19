// ============================================
// Axios API Configuration
// ============================================
// This creates a pre-configured Axios instance
// that automatically:
// 1. Uses the correct backend URL
// 2. Attaches the JWT token to every request
//
// Instead of writing the full URL every time,
// we just use: api.get('/complaints')
// instead of: axios.get('http://localhost:5000/api/complaints')
// ============================================

import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: apiBaseUrl, // Backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================
// This runs BEFORE every request is sent.
// It automatically adds the JWT token from
// localStorage to the Authorization header.
// ============================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
// This runs AFTER every response is received.
// If we get a 401 (Unauthorized) error, it means
// the token is invalid/expired, so we log out.
// ============================================
api.interceptors.response.use(
  (response) => response, // If successful, return response as-is
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired - clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
