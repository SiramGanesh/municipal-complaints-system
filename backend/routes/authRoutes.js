// ============================================
// Authentication Routes
// ============================================
// Defines the API endpoints for authentication.
// Each route maps a URL + HTTP method to a
// controller function.
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, getMe, createUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// POST /api/auth/create-user - Create new account by Admin
router.post('/create-user', protect, authorize('admin'), createUser);

// POST /api/auth/register - Create new account
router.post('/register', register);

// POST /api/auth/login - Login and get token
router.post('/login', login);

// GET /api/auth/me - Get current user (requires login)
router.get('/me', protect, getMe);

module.exports = router;
