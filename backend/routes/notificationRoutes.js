// ============================================
// Notification Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require login
router.use(protect);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark single as read
router.put('/:id/read', markAsRead);

module.exports = router;
