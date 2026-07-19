// ============================================
// Complaint Routes
// ============================================
// API endpoints for complaint operations.
// Note: The order of routes matters!
// Put specific routes (like /my) before
// dynamic routes (like /:id).
// ============================================

const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes below require login
router.use(protect);

// GET /api/complaints/my - Get current user's complaints (citizen)
// This MUST come before /:id route, otherwise "my" would be treated as an ID
router.get('/my', getMyComplaints);

// POST /api/complaints - Create new complaint (citizen)
// upload.single('image') handles the file upload for the 'image' field
router.post('/', authorize('citizen'), upload.single('image'), createComplaint);

// GET /api/complaints - Get all complaints (admin/officer)
router.get('/', authorize('admin', 'officer'), getComplaints);

// GET /api/complaints/:id - Get single complaint
router.get('/:id', getComplaintById);

// PUT /api/complaints/:id/status - Update status (officer/admin)
router.put('/:id/status', authorize('officer', 'admin'), updateComplaintStatus);

// DELETE /api/complaints/:id - Delete single complaint
router.delete('/:id', deleteComplaint);

module.exports = router;
