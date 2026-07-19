// ============================================
// Officer Dashboard Page
// ============================================
// Shows complaints assigned to the officer's
// department. Officers can update complaint
// status from here (In Progress / Resolved).
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  // Fetch department complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update complaint status
  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdating(complaintId);
    try {
      await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
      // Refresh complaints list
      await fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Filter complaints
  const filteredComplaints =
    filter === 'all'
      ? complaints
      : complaints.filter((c) => c.status === filter);

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
        <p className="mt-4 text-gray-600">Loading officer dashboard...</p>
      </div>
    );
  }

  // Count by status
  const counts = {
    all: complaints.length,
    Registered: complaints.filter((c) => c.status === 'Registered').length,
    'In Progress': complaints.filter((c) => c.status === 'In Progress').length,
    Resolved: complaints.filter((c) => c.status === 'Resolved').length,
    Escalated: complaints.filter((c) => c.status === 'Escalated').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👮 Officer Dashboard</h1>
        <p className="text-gray-600">Manage complaints assigned to your {user?.department?.departmentName || 'department'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-blue-500">
          <h3 className="text-3xl font-bold mb-2">{counts.all}</h3>
          <p className="text-gray-600">Total Assigned</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-gray-500">
          <h3 className="text-3xl font-bold mb-2">{counts.Registered}</h3>
          <p className="text-gray-600">Pending Review</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-yellow-500">
          <h3 className="text-3xl font-bold mb-2">{counts['In Progress']}</h3>
          <p className="text-gray-600">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border-t-4 border-green-500">
          <h3 className="text-3xl font-bold mb-2">{counts.Resolved}</h3>
          <p className="text-gray-600">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status} ({count})
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No complaints found with the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/complaints/${complaint._id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                        {complaint.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{complaint.issueType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.userId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.location?.substring(0, 30)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(complaint.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {complaint.status === 'Registered' && (
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
                          onClick={() =>
                            handleStatusUpdate(complaint._id, 'In Progress')
                          }
                          disabled={updating === complaint._id}
                        >
                          {updating === complaint._id ? '...' : 'Start'}
                        </button>
                      )}
                      {(complaint.status === 'Registered' ||
                        complaint.status === 'In Progress' ||
                        complaint.status === 'Escalated') && (
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                          onClick={() =>
                            handleStatusUpdate(complaint._id, 'Resolved')
                          }
                          disabled={updating === complaint._id}
                        >
                          {updating === complaint._id ? '...' : 'Resolve'}
                        </button>
                      )}
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
      )}
    </div>
  );
};

export default OfficerDashboard;
