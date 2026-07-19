// ============================================
// Public Dashboard Page
// ============================================
// A transparency dashboard accessible to everyone
// (no login required). Shows:
//   - Total complaints and resolution rate
//   - Complaints by issue type
//   - Department performance
//
// This promotes accountability and trust in
// municipal governance.
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PublicDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch public statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/public');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching public stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading public dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Unable to load dashboard data.</div>
      </div>
    );
  }

  // Get emoji for issue type
  const getIssueEmoji = (type) => {
    const emojis = {
      road: '🛣️',
      water: '💧',
      garbage: '🗑️',
      sanitation: '🚿',
      electricity: '⚡',
      other: '📋',
    };
    return emojis[type] || '📋';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Public Transparency Dashboard</h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
          Real-time statistics of municipal complaint management.
          This dashboard is accessible to everyone to promote transparency.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">{stats.totalComplaints}</h3>
          <p className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Total</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-4xl font-extrabold mb-2 text-brand-600 tracking-tight">{stats.resolved}</h3>
          <p className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Resolved</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-4xl font-extrabold mb-2 text-yellow-600 tracking-tight">{stats.inProgress}</h3>
          <p className="text-gray-500 font-semibold text-sm uppercase tracking-wide">In Progress</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-4xl font-extrabold mb-2 text-red-500 tracking-tight">{stats.escalated}</h3>
          <p className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Escalated</p>
        </div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-white p-10 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 text-center mb-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <h2 className="text-2xl font-extrabold mb-6 text-gray-900 tracking-tight">Overall Resolution Rate</h2>
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-tr from-brand-500 to-brand-400 rounded-full text-white text-3xl font-extrabold shadow-lg shadow-brand-500/30">
            {stats.resolutionRate}
          </div>
        </div>
        <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: stats.resolutionRate }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Complaints by Type */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100">
          <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight">Complaints by Issue Type</h2>
          {stats.complaintsByType.length === 0 ? (
            <p className="text-gray-500 font-medium">No data available yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.complaintsByType.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">{getIssueEmoji(item._id)}</span>
                  <span className="flex-1 font-semibold text-gray-900 capitalize">{item._id}</span>
                  <span className="font-extrabold text-brand-600 text-lg">{item.count}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{
                        width: `${(item.count / stats.totalComplaints) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Performance */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100">
          <h2 className="text-xl font-extrabold mb-6 text-gray-900 tracking-tight">Department Performance</h2>
          {stats.departmentPerformance.length === 0 ? (
            <p className="text-gray-500 font-medium">No data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Department</th>
                    <th className="text-center py-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Total</th>
                    <th className="text-center py-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Resolved</th>
                    <th className="text-center py-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.departmentPerformance.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-semibold text-gray-900">{dept._id}</td>
                      <td className="text-center py-4 font-medium text-gray-600">{dept.total}</td>
                      <td className="text-center py-4 text-brand-600 font-bold">{dept.resolved}</td>
                      <td className="text-center py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            dept.total > 0 && dept.resolved / dept.total >= 0.5
                              ? 'bg-brand-50 text-brand-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {dept.total > 0
                            ? `${((dept.resolved / dept.total) * 100).toFixed(0)}%`
                            : '0%'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-gray-600">
        <p>
          📌 This dashboard is updated in real time. Data reflects all complaints
          registered in the system.
        </p>
      </div>
    </div>
  );
};

export default PublicDashboard;
