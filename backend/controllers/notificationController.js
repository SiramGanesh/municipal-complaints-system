// ============================================
// Notification Controller
// ============================================
// Handles notification operations for users.
// ============================================

const Notification = require('../models/Notification');

// ============================================
// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
// ============================================
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Only get last 50 notifications

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// ============================================
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
// ============================================
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Make sure the notification belongs to the current user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error.message);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// ============================================
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
// ============================================
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error.message);
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
