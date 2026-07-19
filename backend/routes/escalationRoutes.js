// ============================================
// Escalation Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getEscalations, runSLACheck } = require('../controllers/escalationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect, authorize('admin'));

// GET /api/escalations - Get all escalations
router.get('/', getEscalations);

// POST /api/escalations/check - Run SLA check manually
router.post('/check', runSLACheck);

module.exports = router;
