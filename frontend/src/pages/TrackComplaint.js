// ============================================
// Track Complaints Page
// ============================================
// Shows all complaints filed by the current citizen.
// Includes filtering by status.
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ComplaintCard from '../components/ComplaintCard';

const TrackComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch complaints on page load
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints/my');
        setComplaints(response.data.complaints);
        setFilteredComplaints(response.data.complaints);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Filter complaints when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(
        complaints.filter((c) => c.status === statusFilter)
      );
    }
  }, [statusFilter, complaints]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading your complaints...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">🔍 Track Your Complaints</h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 border border-gray-300 rounded-full text-sm transition-colors ${statusFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({complaints.length})
        </button>
        <button
          className={`px-4 py-2 border border-gray-300 rounded-full text-sm transition-colors ${statusFilter === 'Registered' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setStatusFilter('Registered')}
        >
          Registered ({complaints.filter((c) => c.status === 'Registered').length})
        </button>
        <button
          className={`px-4 py-2 border border-gray-300 rounded-full text-sm transition-colors ${statusFilter === 'In Progress' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setStatusFilter('In Progress')}
        >
          In Progress ({complaints.filter((c) => c.status === 'In Progress').length})
        </button>
        <button
          className={`px-4 py-2 border border-gray-300 rounded-full text-sm transition-colors ${statusFilter === 'Resolved' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setStatusFilter('Resolved')}
        >
          Resolved ({complaints.filter((c) => c.status === 'Resolved').length})
        </button>
        <button
          className={`px-4 py-2 border border-gray-300 rounded-full text-sm transition-colors ${statusFilter === 'Escalated' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setStatusFilter('Escalated')}
        >
          Escalated ({complaints.filter((c) => c.status === 'Escalated').length})
        </button>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No complaints found with the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
