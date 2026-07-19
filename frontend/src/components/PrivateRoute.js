// ============================================
// Private Route Component
// ============================================
// This component protects routes that require
// authentication. If the user is not logged in,
// they are redirected to the login page.
//
// Usage:
//   <Route path="/dashboard" element={
//     <PrivateRoute><Dashboard /></PrivateRoute>
//   } />
//
// You can also restrict by role:
//   <PrivateRoute roles={['admin']}>
//     <AdminDashboard />
//   </PrivateRoute>
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has the required role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  // User is authenticated and authorized - render the page
  return children;
};

export default PrivateRoute;
