// ============================================
// Dashboard Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getStats, getPublicStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard/public - Public statistics (no login required)
router.get('/public', getPublicStats);

// GET /api/dashboard/stats - Admin statistics (admin only)
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
