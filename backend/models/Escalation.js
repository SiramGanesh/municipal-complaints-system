// ============================================
// Escalation Model (Schema)
// ============================================
// Tracks when a complaint is escalated to
// higher authorities because the SLA deadline
// was exceeded.
//
// Each escalation record stores:
//   - Which complaint was escalated
//   - Who it was escalated to
//   - Why it was escalated
//   - The escalation level (1 = first escalation, etc.)
// ============================================

const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
  },
  escalatedTo: {
    type: String,
    enum: ['supervisor', 'admin', 'commissioner'],
    required: [true, 'Escalation target is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason for escalation is required'],
    default: 'SLA deadline exceeded',
  },
  level: {
    type: Number,
    default: 1, // First escalation = level 1
  },
  escalatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Escalation', escalationSchema);
