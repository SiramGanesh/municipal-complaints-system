// ============================================
// Department Model (Schema)
// ============================================
// Represents a municipal department like
// "Road Maintenance", "Water Supply", etc.
//
// Each department:
//   - Handles specific issue types
//   - Has a defined SLA timeline (days to resolve)
//   - Has officers assigned to it
// ============================================

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
  },
  issueTypes: {
    // Array of issue types this department handles
    // e.g., ["road"] for Road Maintenance Department
    type: [String],
    required: [true, 'At least one issue type is required'],
  },
  slaTimeline: {
    // Number of days to resolve complaints
    // e.g., 3 means complaints must be resolved within 3 days
    type: Number,
    required: [true, 'SLA timeline is required'],
    default: 3,
  },
  assignedOfficers: [
    {
      // Array of references to User documents (officers)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Department', departmentSchema);
