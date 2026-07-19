// ============================================
// Admin Dashboard Page
// ============================================
// The main dashboard for administrators.
// Shows comprehensive statistics including:
//   - Total complaints by status
//   - Complaints by type and department
//   - SLA compliance rates
//   - Recent complaints list
//   - Escalation management
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, escalationsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/escalations'),
        ]);
        setStats(statsRes.data.stats);
        setEscalations(escalationsRes.data.escalations);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run SLA check manually
  const handleSLACheck = async () => {
    setChecking(true);
    try {
      const response = await api.post('/escalations/check');
      setMessage(response.data.message);

      // Refresh data after check
      const [statsRes, escalationsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/escalations'),
      ]);
      setStats(statsRes.data.stats);
      setEscalations(escalationsRes.data.escalations);
    } catch (error) {
      setMessage('Error running SLA check');
    } finally {
      setChecking(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👑 Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/create-account"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ➕ Create Account
          </Link>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSLACheck}
            disabled={checking}
          >
            {checking ? '⏳ Checking...' : '⚡ Run SLA Check'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          {message}
          <button onClick={() => setMessage('')} className="text-blue-700 hover:text-blue-900 text-xl font-bold">×</button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-blue-500">
          <h3 className="text-3xl font-bold mb-2">{stats.totalComplaints}</h3>
          <p className="text-gray-600">Total Complaints</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-gray-500">
          <h3 className="text-3xl font-bold mb-2">{stats.statusCounts.registered}</h3>
          <p className="text-gray-600">Registered</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-yellow-500">
          <h3 className="text-3xl font-bold mb-2">{stats.statusCounts.inProgress}</h3>
          <p className="text-gray-600">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-green-500">
          <h3 className="text-3xl font-bold mb-2">{stats.statusCounts.resolved}</h3>
          <p className="text-gray-600">Resolved</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-red-500">
          <h3 className="text-3xl font-bold mb-2">{stats.statusCounts.escalated}</h3>
          <p className="text-gray-600">Escalated</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-3xl font-bold mb-2">{stats.resolutionRate}</h3>
          <p className="text-gray-600">Resolution Rate</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-3xl font-bold mb-2">{stats.users.citizens}</h3>
          <p className="text-gray-600">Registered Citizens</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-3xl font-bold mb-2">{stats.totalDepartments}</h3>
          <p className="text-gray-600">Departments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-3xl font-bold mb-2">{stats.sla.onTime} / {stats.sla.onTime + stats.sla.delayed}</h3>
          <p className="text-gray-600">SLA Compliance</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Complaints by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📊 Complaints by Issue Type</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Issue Type</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Count</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Bar</th>
                </tr>
              </thead>
              <tbody>
                {stats.complaintsByType.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100">
                    <td className="py-3 capitalize">{item._id}</td>
                    <td className="text-center py-3">{item.count}</td>
                    <td className="py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.count / stats.totalComplaints) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🏢 Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Department</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Total</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Resolved</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Escalated</th>
                </tr>
              </thead>
              <tbody>
                {stats.complaintsByDepartment.map((dept) => (
                  <tr key={dept._id} className="border-b border-gray-100">
                    <td className="py-3">{dept._id}</td>
                    <td className="text-center py-3">{dept.total}</td>
                    <td className="text-center py-3 text-green-600 font-semibold">{dept.resolved}</td>
                    <td className="text-center py-3 text-red-600 font-semibold">{dept.escalated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Escalations */}
      {escalations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">🚨 Escalated Complaints</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Complaint</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Filed By</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Escalated To</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {escalations.slice(0, 10).map((esc) => (
                  <tr key={esc._id} className="border-b border-gray-100">
                    <td className="py-3">{esc.complaintId?.title || 'N/A'}</td>
                    <td className="py-3">{esc.complaintId?.userId?.name || 'N/A'}</td>
                    <td className="py-3">{esc.complaintId?.departmentId?.departmentName || 'N/A'}</td>
                    <td className="py-3">{esc.escalatedTo}</td>
                    <td className="py-3">{esc.reason.substring(0, 40)}...</td>
                    <td className="py-3">{formatDate(esc.escalatedAt)}</td>
                    <td className="py-3">
                      {esc.complaintId && (
                        <Link
                          to={`/complaints/${esc.complaintId._id}`}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">📋 Recent Complaints</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">Title</th>
                <th className="text-left py-2 font-semibold text-gray-700">Type</th>
                <th className="text-left py-2 font-semibold text-gray-700">Status</th>
                <th className="text-left py-2 font-semibold text-gray-700">Filed By</th>
                <th className="text-left py-2 font-semibold text-gray-700">Department</th>
                <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left py-2 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentComplaints.map((complaint) => (
                <tr key={complaint._id} className="border-b border-gray-100">
                  <td className="py-3">{complaint.title}</td>
                  <td className="py-3 capitalize">{complaint.issueType}</td>
                  <td className="py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="py-3">{complaint.userId?.name || 'N/A'}</td>
                  <td className="py-3">{complaint.departmentId?.departmentName || 'N/A'}</td>
                  <td className="py-3">{formatDate(complaint.createdAt)}</td>
                  <td className="py-3">
                    <Link
                      to={`/complaints/${complaint._id}`}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
