// ============================================
// Navbar Component
// ============================================
// The navigation bar that appears at the top of
// every page. It shows different links based on:
// - Whether the user is logged in
// - What role the user has (citizen/officer/admin)
// ============================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#f6f7f6] sticky top-0 z-50 py-2 pt-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center min-h-[4rem] flex-wrap gap-4">
          {/* Logo / Brand Name */}
          <Link to="/" className="text-xl font-extrabold text-gray-900 hover:text-brand-600 transition-colors flex items-center gap-2 tracking-tight">
            <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </span>
            Municipal Complaints
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap bg-white/60 backdrop-blur-md px-2 py-1.5 rounded-full border border-gray-200/60 shadow-sm">
            {/* Public link - always visible */}
            <Link to="/public-dashboard" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
              Public Dashboard
            </Link>

            {user ? (
              // ---- LOGGED IN ----
              <>
                {/* Citizen Links */}
                {user.role === 'citizen' && (
                  <>
                    <Link to="/register-complaint" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
                      New Complaint
                    </Link>
                    <Link to="/track-complaints" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
                      Track
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
                    Admin
                  </Link>
                )}

                {/* Officer Links */}
                {user.role === 'officer' && (
                  <Link to="/officer-dashboard" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
                    Officer
                  </Link>
                )}

                {/* User Info & Logout */}
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                <span className="text-gray-900 text-sm px-2 py-2 font-medium whitespace-nowrap flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </span>
                <button onClick={handleLogout} className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all text-sm font-semibold whitespace-nowrap hover:shadow-md">
                  Logout
                </button>
              </>
            ) : (
              // ---- NOT LOGGED IN ----
              <>
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap hover:bg-gray-100/50">
                  Log In
                </Link>
                <Link to="/register" className="bg-brand-500 text-white px-5 py-2 rounded-full hover:bg-brand-600 transition-all text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
