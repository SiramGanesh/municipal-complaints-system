// ============================================
// Notification Model (Schema)
// ============================================
// Stores notifications sent to users about
// their complaint status changes, escalations,
// or other updates.
// ============================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  type: {
    type: String,
    enum: ['system', 'email', 'sms'],
    default: 'system', // For now, we only use in-app notifications
  },
  isRead: {
    type: Boolean,
    default: false, // New notifications are unread
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null, // Optional link to a specific complaint
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
