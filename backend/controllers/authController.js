// ============================================
// Authentication Controller
// ============================================
// Handles user registration and login.
//
// Functions:
//   - register: Create a new user account
//   - login: Authenticate user and return JWT token
//   - getMe: Get the currently logged-in user's info
//
// JWT (JSON Web Token) is used for authentication:
//   1. User logs in with email/password
//   2. Server verifies credentials
//   3. Server creates a JWT token containing user ID
//   4. Client stores token and sends it with every request
//   5. Server verifies token to identify the user
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

// ============================================
// Helper: Generate JWT Token
// ============================================
// Creates a token that contains the user's ID
// Token expires based on JWT_EXPIRE env variable
// ============================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ============================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
// ============================================
const register = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (password is auto-hashed by the pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen', // Default to citizen if no role specified
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (don't include password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ============================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email (include password for comparison)
    // We need .select('+password') because password has select: false in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ============================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private (requires login)
// ============================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).populate('department');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// @desc    Create a new user by Admin
// @route   POST /api/auth/create-user
// @access  Private/Admin
// ============================================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      user.role = role || user.role;
      if (role === 'officer' && department) {
        user.department = department;
      }
      await user.save();
    } else {
      isNewUser = true;
      const userData = {
        name,
        email,
        password,
        role: role || 'citizen',
      };

      if (role === 'officer' && department) {
        userData.department = department;
      }

      // Create user
      user = await User.create(userData);
    }

    // If role is officer, add user to department's assignedOfficers
    if (role === 'officer' && department) {
      await Department.findByIdAndUpdate(department, {
        $addToSet: { assignedOfficers: user._id }
      });
    }

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? `${role} account created successfully` : `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
    });
  } catch (error) {
    console.error('Create User error:', error.message);
    res.status(500).json({ message: 'Server error during user creation' });
  }
};

module.exports = { register, login, getMe, createUser };
