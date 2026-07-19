// ============================================
// Complaint Card Component
// ============================================
// Displays a single complaint as a card.
// Used in lists/grids of complaints.
// Shows: title, issue type, status, date, location
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ComplaintCard = ({ complaint, onDelete }) => {
  const { user } = useAuth();

  // Format date to readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get a nice label for issue type
  const getIssueTypeLabel = (type) => {
    const labels = {
      road: '🛣️ Road',
      water: '💧 Water',
      garbage: '🗑️ Garbage',
      sanitation: '🚿 Sanitation',
      electricity: '⚡ Electricity',
      other: '📋 Other',
    };
    return labels[type] || type;
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/complaints/${complaint._id}`);
        if (onDelete) {
          onDelete(complaint._id);
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('Failed to delete complaint');
      }
    }
  };

  // Check if the current user is the creator
  const isCreator = user && complaint.userId && (
    complaint.userId === user._id || complaint.userId._id === user._id
  );

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Card Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
        <span className="text-sm font-medium text-gray-700">{getIssueTypeLabel(complaint.issueType)}</span>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Card Body */}
      <div className="px-6 py-5">
        <h3 className="text-xl font-extrabold mb-2 text-gray-900 tracking-tight">{complaint.title}</h3>
        <p className="text-gray-500 font-medium text-sm mb-4 leading-relaxed">
          {complaint.description.length > 100
            ? complaint.description.substring(0, 100) + '...'
            : complaint.description}
        </p>

        <div className="space-y-1 text-sm text-gray-500">
          <p>📍 {complaint.location}</p>
          <p>📅 {formatDate(complaint.createdAt)}</p>
          {complaint.departmentId && (
            <p>🏢 {complaint.departmentId.departmentName || 'Assigned'}</p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
        <Link to={`/complaints/${complaint._id}`} className="inline-block bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-full hover:border-gray-300 hover:text-gray-900 shadow-sm transition-all text-sm font-bold">
          View Details →
        </Link>
        {isCreator && complaint.status !== 'Resolved' && (
          <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
