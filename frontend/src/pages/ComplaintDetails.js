// ============================================
// Complaint Details Page
// ============================================
// Shows full details of a single complaint.
// Includes: all info, SLA status, image, timeline
// Officers/Admins can update status from here.
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';

const ComplaintDetails = () => {
  const { id } = useParams(); // Get complaint ID from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Fetch complaint details
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data.complaint);
        setSla(response.data.sla);
      } catch (error) {
        setError('Complaint not found');
        console.error('Error fetching complaint:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // Update complaint status (officer/admin only)
  const handleStatusUpdate = async (newStatus, reason = null) => {
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      if (reason) payload.rejectionReason = reason;

      await api.put(`/complaints/${id}/status`, payload);
      // Refresh the complaint data
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data.complaint);
      setSla(response.data.sla);
      setShowRejectModal(false);
      setRejectionReasonInput('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get issue type label
  const getIssueTypeLabel = (type) => {
    const labels = {
      road: '🛣️ Road Damage',
      water: '💧 Water Supply',
      garbage: '🗑️ Garbage Collection',
      sanitation: '🚿 Sanitation',
      electricity: '⚡ Electricity',
      other: '📋 Other',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading complaint details...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mb-4">
        ← Back
      </button>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start p-6 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{complaint.title}</h2>
            <p className="text-gray-600">
              {getIssueTypeLabel(complaint.issueType)} • Filed on{' '}
              {formatDate(complaint.createdAt)}
            </p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Main Content */}
        <div className="md:grid md:grid-cols-3 gap-0">
          {/* Left Column - Details */}
          <div className="md:col-span-2 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">📝 Description</h3>
              <p className="text-gray-900">{complaint.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">📍 Location</h3>
              <p className="text-gray-900">{complaint.location}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">🏢 Assigned Department</h3>
              <p className="text-gray-900">
                {complaint.departmentId?.departmentName || 'Not assigned yet'}
              </p>
            </div>

            {complaint.userId && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">👤 Filed By</h3>
                <p className="text-gray-900">
                  {complaint.userId.name} ({complaint.userId.email})
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">📅 Timeline</h3>
              <p className="text-gray-900">
                <strong>Created:</strong> {formatDate(complaint.createdAt)}
              </p>
              <p className="text-gray-900">
                <strong>Last Updated:</strong> {formatDate(complaint.updatedAt)}
              </p>
            </div>

            {complaint.status === 'Rejected' && (
              <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-sm font-semibold text-red-800 uppercase mb-2">❌ Rejection Details</h3>
                <p className="text-gray-900 mb-1">
                  <strong>Reason:</strong> {complaint.rejectionReason}
                </p>
                {complaint.rejectedAt && (
                  <p className="text-gray-900 text-sm">
                    <strong>Rejected On:</strong> {formatDate(complaint.rejectedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - SLA & Image */}
          <div className="p-6 bg-gray-50 border-l border-gray-200 md:border-l">
            {/* SLA Information */}
            {sla && (
              <div className={`p-4 rounded-md mb-6 ${sla.status === 'delayed' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <h3 className="font-semibold mb-3">⏱️ SLA Status</h3>
                <p className="text-sm mb-2">
                  <strong>Deadline:</strong> {formatDate(sla.deadline)}
                </p>
                <p className="text-sm mb-2">
                  <strong>Status:</strong>{' '}
                  <span className={sla.status === 'delayed' ? 'text-red-600' : 'text-green-600'}>
                    {sla.status === 'on-time' ? '✅ On Time' : '❌ Delayed'}
                  </span>
                </p>
                {sla.status === 'on-time' && complaint.status !== 'Resolved' && (
                  <p className="text-sm font-semibold text-orange-600">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(sla.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                      )
                    )}{' '}
                    days remaining
                  </p>
                )}
              </div>
            )}

            {/* Uploaded Image */}
            {complaint.imageUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">📷 Attached Image</h3>
                <img
                  src={`${process.env.REACT_APP_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${complaint.imageUrl}`}
                  alt="Complaint evidence"
                  className="w-full rounded-md border border-gray-300"
                />
              </div>
            )}

            {/* Status Update (Officer/Admin only) */}
            {(user?.role === 'officer' || user?.role === 'admin') && (
              <div className="bg-white p-4 rounded-md border border-gray-300">
                <h3 className="font-semibold mb-3">🔄 Update Status</h3>
                <div className="flex flex-col gap-2">
                  {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                    <button
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleStatusUpdate('In Progress')}
                      disabled={updating}
                    >
                      Mark In Progress
                    </button>
                  )}
                  {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleStatusUpdate('Resolved')}
                      disabled={updating}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {complaint.status !== 'Rejected' && complaint.status !== 'Resolved' && (
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setShowRejectModal(true)}
                      disabled={updating}
                    >
                      Reject Complaint
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* User Actions (Creator only) */}
            {user && complaint.userId && user._id === complaint.userId._id && complaint.status !== 'Resolved' && (
              <div className="bg-white p-4 rounded-md border border-red-200 mt-6">
                <h3 className="font-semibold mb-3 text-red-600">⚠️ Danger Zone</h3>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors w-full"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
                      try {
                        await api.delete(`/complaints/${complaint._id}`);
                        navigate(-1);
                      } catch (error) {
                        console.error('Error deleting complaint:', error);
                        alert(error.response?.data?.message || 'Error deleting complaint');
                      }
                    }
                  }}
                >
                  Delete Complaint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Complaint</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please provide a reason for rejecting this complaint. This message will be sent to the citizen.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px]"
              placeholder="Reason for rejection (mandatory)..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReasonInput('');
                }}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!rejectionReasonInput.trim()) {
                    alert('Please enter a rejection reason.');
                    return;
                  }
                  handleStatusUpdate('Rejected', rejectionReasonInput);
                }}
                disabled={updating || !rejectionReasonInput.trim()}
              >
                {updating ? 'Rejecting...' : 'Submit Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
