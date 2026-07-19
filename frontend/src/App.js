// ============================================
// App.js - Main Application Component
// ============================================
// This is the root component that sets up:
// 1. AuthProvider - wraps entire app with auth context
// 2. BrowserRouter - enables client-side routing
// 3. Routes - defines which page shows for which URL
// 4. Navbar - appears on every page
//
// ROUTING: React Router maps URLs to page components
//   /login          → Login page
//   /register       → Register page
//   /dashboard      → Citizen dashboard (private)
//   /register-complaint → New complaint form (private, citizen)
//   /track-complaints   → View citizen's complaints (private)
//   /complaints/:id     → Complaint details (private)
//   /admin-dashboard    → Admin dashboard (private, admin)
//   /officer-dashboard  → Officer dashboard (private, officer)
//   /public-dashboard   → Public stats (public)
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RegisterComplaint from './pages/RegisterComplaint';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import CreateAccount from './pages/CreateAccount';
import OfficerDashboard from './pages/OfficerDashboard';
import PublicDashboard from './pages/PublicDashboard';

// ============================================
// Home Redirect Component
// ============================================
// Redirects to the appropriate dashboard based
// on user role, or to login if not authenticated
// ============================================
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/public-dashboard" />;

  // Redirect based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" />;
    case 'officer':
      return <Navigate to="/officer-dashboard" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

// ============================================
// Main App Component
// ============================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Navbar - shown on all pages */}
          <Navbar />

          {/* Main content area */}
          <main>
            <Routes>
              {/* Home - redirects based on role */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Public Routes (no login needed) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/public-dashboard" element={<PublicDashboard />} />

              {/* Citizen Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute roles={['citizen']}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/register-complaint"
                element={
                  <PrivateRoute roles={['citizen']}>
                    <RegisterComplaint />
                  </PrivateRoute>
                }
              />
              <Route
                path="/track-complaints"
                element={
                  <PrivateRoute roles={['citizen']}>
                    <TrackComplaint />
                  </PrivateRoute>
                }
              />

              {/* Shared Private Route (any logged-in user) */}
              <Route
                path="/complaints/:id"
                element={
                  <PrivateRoute>
                    <ComplaintDetails />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <PrivateRoute roles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/create-account"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CreateAccount />
                  </PrivateRoute>
                }
              />

              {/* Officer Routes */}
              <Route
                path="/officer-dashboard"
                element={
                  <PrivateRoute roles={['officer']}>
                    <OfficerDashboard />
                  </PrivateRoute>
                }
              />

              {/* 404 - catch all unmatched routes */}
              <Route
                path="*"
                element={
                  <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
