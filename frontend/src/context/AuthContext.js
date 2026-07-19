// ============================================
// Authentication Context (AuthContext.js)
// ============================================
// React Context provides a way to share data
// across all components without passing props
// down through every level.
//
// This context manages:
//   - Current user state (logged in or not)
//   - Login function
//   - Register function
//   - Logout function
//
// Any component can access these by using:
//   const { user, login, logout } = useAuth();
// ============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Step 1: Create the context
const AuthContext = createContext();

// Step 2: Create a custom hook to use the context easily
// Instead of useContext(AuthContext), components can just use useAuth()
export const useAuth = () => {
  return useContext(AuthContext);
};

// Step 3: Create the Provider component
// This wraps the entire app and provides auth data to all children
export const AuthProvider = ({ children }) => {
  // State to store the current user
  const [user, setUser] = useState(null);
  // State to track if we're still checking if user is logged in
  const [loading, setLoading] = useState(true);

  // ============================================
  // Check if user is already logged in (on page load)
  // ============================================
  // When the app loads, check if there's a token in localStorage
  // If yes, verify it and set the user
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify the token is still valid by calling /api/auth/me
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []); // Empty array = run only once when component mounts

  // ============================================
  // Login Function
  // ============================================
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Save token and user data to localStorage
      // localStorage persists even after browser is closed
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // ============================================
  // Register Function
  // ============================================
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'citizen', // New users are always citizens
      });
      const { token, user: userData } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // ============================================
  // Logout Function
  // ============================================
  const logout = () => {
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ============================================
  // Provide the context values to children
  // ============================================
  const value = {
    user,      // Current user object or null
    loading,   // Whether we're checking auth status
    login,     // Login function
    register,  // Register function
    logout,    // Logout function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
