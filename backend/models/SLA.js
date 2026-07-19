// ============================================
// SLA Model (Schema)
// ============================================
// SLA = Service Level Agreement
// This tracks the deadline for each complaint.
// When a complaint is created, an SLA record
// is also created with a calculated deadline.
//
// Example: If SLA timeline is 3 days and complaint
// is created on Jan 1, deadline = Jan 4.
// ============================================

const mongoose = require('mongoose');

const slaSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    enum: ['on-time', 'delayed'],
    default: 'on-time', // Starts as on-time, changes if deadline passes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SLA', slaSchema);
