// ============================================
// Server Entry Point (server.js)
// ============================================
// This is the main file that starts the Express
// server. It:
// 1. Loads environment variables from .env
// 2. Connects to MongoDB
// 3. Sets up middleware (CORS, JSON parsing)
// 4. Registers all API routes
// 5. Starts listening on the specified port
//
// To run: npm start (production) or npm run dev (development)
// ============================================

// Load environment variables from .env file
// This must be at the very top!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const escalationRoutes = require('./routes/escalationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ============================================
// Initialize Express App
// ============================================
const app = express();

// ============================================
// Connect to MongoDB
// ============================================
connectDB();

// ============================================
// Middleware Setup
// ============================================

// CORS - allows the React frontend to communicate with this backend
// Without this, the browser would block requests from localhost:3000
// to localhost:5000 (different ports = different origins)
app.use(cors());

// Parse JSON request bodies
// This allows us to access req.body when clients send JSON data
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static files
// This makes files in 'uploads/' accessible via URL
// Example: http://localhost:5000/uploads/image-12345.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API Routes
// ============================================
// Each route file handles a specific resource
// The first argument is the base URL prefix
// ============================================
app.use('/api/auth', authRoutes);           // /api/auth/login, /api/auth/register
app.use('/api/complaints', complaintRoutes); // /api/complaints, /api/complaints/:id
app.use('/api/departments', departmentRoutes); // /api/departments
app.use('/api/escalations', escalationRoutes); // /api/escalations
app.use('/api/notifications', notificationRoutes); // /api/notifications
app.use('/api/dashboard', dashboardRoutes);   // /api/dashboard/stats, /api/dashboard/public

// ============================================
// Root Route - Health Check
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Complaint Escalation System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      departments: '/api/departments',
      escalations: '/api/escalations',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
    },
  });
});

// ============================================
// Error Handling Middleware
// ============================================
// This catches any errors that occur in routes
// and sends a proper error response
// ============================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  // Handle Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ============================================
  🚀 Server running on port ${PORT}
  📍 URL: http://localhost:${PORT}
  📍 API: http://localhost:${PORT}/api
  ============================================
  `);
});
