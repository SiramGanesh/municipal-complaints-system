// ============================================
// Register Complaint Page
// ============================================
// Form for citizens to submit a new complaint.
// Fields: title, issue type, description, location, image
//
// When submitted:
// 1. Data is sent to POST /api/complaints
// 2. Backend auto-assigns to correct department
// 3. SLA timer starts
// 4. Citizen gets a notification
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const RegisterComplaint = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create FormData to send files
      // We can't send files as JSON, so we use FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('issueType', issueType);
      formData.append('description', description);
      formData.append('location', location);

      // Only add image if one was selected
      if (image) {
        formData.append('image', image);
      }

      // Send to backend
      const response = await api.post('/complaints', formData);

      setSuccess(
        `Complaint registered successfully! Assigned to: ${response.data.assignedDepartment}. Expected resolution by: ${new Date(response.data.slaDeadline).toLocaleDateString()}`
      );

      // Clear form
      setTitle('');
      setIssueType('');
      setDescription('');
      setLocation('');
      setImage(null);

      // Redirect to tracking page after 2 seconds
      setTimeout(() => {
        navigate('/track-complaints');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error registering complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">📝 Register a New Complaint</h2>
        <p className="text-gray-600 mb-6">
          Report a municipal issue and it will be automatically assigned to the relevant department.
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Complaint Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pothole on Main Street"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={200}
            />
          </div>

          {/* Issue Type */}
          <div className="mb-4">
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">Issue Type *</label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select Issue Type --</option>
              <option value="road">🛣️ Road Damage</option>
              <option value="water">💧 Water Supply</option>
              <option value="garbage">🗑️ Garbage Collection</option>
              <option value="sanitation">🚿 Sanitation</option>
              <option value="electricity">⚡ Electricity</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              rows={5}
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 123 Main Street, Block A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <small className="text-gray-500 text-sm mt-1 block">
              Max 5MB. Accepted formats: JPG, PNG, GIF, WebP
            </small>
            {image && (
              <p className="text-green-600 text-sm mt-2">📎 Selected: {image.name}</p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterComplaint;
