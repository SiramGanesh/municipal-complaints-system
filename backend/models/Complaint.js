// ============================================
// Complaint Model (Schema)
// ============================================
// This defines the structure for a Complaint.
// Each complaint represents a civic issue
// reported by a citizen (e.g., pothole, water leak).
//
// Key relationships:
//   - userId → links to the User who filed it
//   - departmentId → links to the assigned Department
// ============================================

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User collection
    required: [true, 'User ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  issueType: {
    type: String,
    required: [true, 'Please select an issue type'],
    enum: ['road', 'water', 'garbage', 'sanitation', 'electricity', 'other'],
    // enum means only these values are allowed
  },
  imageUrl: {
    type: String, // Path to the uploaded image
    default: null, // Optional - citizens don't have to upload an image
  },
  status: {
    type: String,
    enum: ['Registered', 'In Progress', 'Resolved', 'Escalated', 'Rejected'],
    default: 'Registered', // All new complaints start as "Registered"
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: {
    type: Date,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', // Links to the Department collection
    default: null,
  },
  location: {
    type: String,
    required: [true, 'Please provide the location of the issue'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the 'updatedAt' field whenever the document is modified
complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
