// ============================================
// Department Controller
// ============================================
// Handles department management operations.
// Departments are the municipal departments
// that handle different types of complaints.
// ============================================

const Department = require('../models/Department');

// ============================================
// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
// ============================================
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('assignedOfficers', 'name email'); // Include officer names

    res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error('Get departments error:', error.message);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

// ============================================
// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (admin only)
// ============================================
const createDepartment = async (req, res) => {
  try {
    const { departmentName, issueTypes, slaTimeline } = req.body;

    // Check if department already exists
    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      departmentName,
      issueTypes,
      slaTimeline: slaTimeline || 3, // Default 3 days
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Create department error:', error.message);
    res.status(500).json({ message: 'Error creating department' });
  }
};

// ============================================
// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Public
// ============================================
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('assignedOfficers', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      department,
    });
  } catch (error) {
    console.error('Get department error:', error.message);
    res.status(500).json({ message: 'Error fetching department' });
  }
};

module.exports = { getDepartments, createDepartment, getDepartmentById };
