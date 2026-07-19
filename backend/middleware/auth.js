// ============================================
// Authentication Middleware
// ============================================
// This middleware checks if the user is logged in
// by verifying their JWT token. It also checks
// if the user has the right role to access
// certain routes.
//
// HOW IT WORKS:
// 1. User logs in → gets a JWT token
// 2. User sends token in request header
// 3. This middleware reads and verifies the token
// 4. If valid, allows access; if not, blocks request
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// protect - Verify JWT Token
// ============================================
// Use this middleware on routes that require login.
// Example: router.get('/profile', protect, getProfile)
// ============================================
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header contains a Bearer token
  // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      // This returns the decoded payload (contains user ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database using the ID from the token
      // .select('-password') means don't include the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Move to the next middleware/controller
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// ============================================
// authorize - Check User Role
// ============================================
// Use this AFTER protect middleware to check roles.
// Example: router.get('/admin', protect, authorize('admin'), getAdmin)
// You can allow multiple roles: authorize('admin', 'officer')
// ============================================
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
