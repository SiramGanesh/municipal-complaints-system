// ============================================
// Department Routes
// ============================================

const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  getDepartmentById,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/departments - Get all departments (public)
router.get('/', getDepartments);

// GET /api/departments/:id - Get single department
router.get('/:id', getDepartmentById);

// POST /api/departments - Create department (admin only)
router.post('/', protect, authorize('admin'), createDepartment);

module.exports = router;
