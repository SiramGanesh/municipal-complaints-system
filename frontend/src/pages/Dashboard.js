// ============================================
// Citizen Dashboard
// ============================================
// The main page for citizens after login.
// Shows:
//   - Welcome message
//   - Quick stats (total, resolved, pending)
//   - Recent complaints
//   - Quick action buttons
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ComplaintCard from '../components/ComplaintCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's complaints and notifications when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complaints and notifications in parallel
        const [complaintsRes, notificationsRes] = await Promise.all([
          api.get('/complaints/my'),
          api.get('/notifications'),
        ]);

        setComplaints(complaintsRes.data.complaints);
        setNotifications(notificationsRes.data.notifications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty array = run once on mount

  // Calculate stats from complaints
  const stats = {
    total: complaints.length,
    registered: complaints.filter((c) => c.status === 'Registered').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    escalated: complaints.filter((c) => c.status === 'Escalated').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-10 mt-4">
        <h1 className="text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-500 font-medium text-lg">Manage and track your municipal complaints</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/register-complaint" className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl block">📝</span>
          </div>
          <span className="font-bold text-gray-900 block">New Complaint</span>
        </Link>
        <Link to="/track-complaints" className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl block">🔍</span>
          </div>
          <span className="font-bold text-gray-900 block">Track Complaints</span>
        </Link>
        <Link to="/public-dashboard" className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl block">📊</span>
          </div>
          <span className="font-bold text-gray-900 block">Public Dashboard</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <h3 className="text-3xl font-extrabold mb-1 text-gray-900">{stats.total}</h3>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Total</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <h3 className="text-3xl font-extrabold mb-1 text-blue-600">{stats.registered}</h3>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Registered</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <h3 className="text-3xl font-extrabold mb-1 text-yellow-600">{stats.inProgress}</h3>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <h3 className="text-3xl font-extrabold mb-1 text-brand-600">{stats.resolved}</h3>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Resolved</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
          <h3 className="text-3xl font-extrabold mb-1 text-red-500">{stats.escalated}</h3>
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Escalated</p>
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 mb-10">
          <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight">🔔 Recent Notifications</h2>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-2xl border ${!notif.isRead ? 'bg-brand-50 border-brand-100' : 'bg-gray-50 border-gray-100'}`}
              >
                <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                <span className="text-xs text-gray-500 font-medium mt-2 inline-block">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 mb-10">
        <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight">📋 Your Recent Complaints</h2>
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium mb-6">You haven't filed any complaints yet.</p>
            <Link to="/register-complaint" className="bg-brand-500 text-white px-8 py-3.5 rounded-full hover:bg-brand-600 transition-all font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 inline-block">
              Register Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.slice(0, 6).map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
