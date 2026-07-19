// ============================================
// Dashboard Controller
// ============================================
// Provides statistics and analytics data for:
//   - Admin Dashboard (private, detailed stats)
//   - Public Dashboard (public, general stats)
//
// Uses MongoDB aggregation for counting and
// grouping data efficiently.
// ============================================

const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const Escalation = require('../models/Escalation');
const SLA = require('../models/SLA');

// ============================================
// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (admin)
// ============================================
const getStats = async (req, res) => {
  try {
    // Count total complaints by status
    const totalComplaints = await Complaint.countDocuments();
    const registeredCount = await Complaint.countDocuments({ status: 'Registered' });
    const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
    const escalatedCount = await Complaint.countDocuments({ status: 'Escalated' });

    // Count users by role
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalOfficers = await User.countDocuments({ role: 'officer' });

    // Count departments
    const totalDepartments = await Department.countDocuments();

    // Count escalations
    const totalEscalations = await Escalation.countDocuments();

    // Get SLA statistics
    const onTimeSLA = await SLA.countDocuments({ status: 'on-time' });
    const delayedSLA = await SLA.countDocuments({ status: 'delayed' });

    // Get complaints grouped by issue type
    // This uses MongoDB's aggregation pipeline
    const complaintsByType = await Complaint.aggregate([
      {
        $group: {
          _id: '$issueType', // Group by issueType field
          count: { $sum: 1 }, // Count each group
        },
      },
      { $sort: { count: -1 } }, // Sort by count (highest first)
    ]);

    // Get complaints grouped by department
    const complaintsByDepartment = await Complaint.aggregate([
      {
        $lookup: {
          from: 'departments', // Join with departments collection
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' }, // Flatten the array
      {
        $group: {
          _id: '$department.departmentName',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
          escalated: {
            $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] },
          },
        },
      },
    ]);

    // Get recent complaints (last 10)
    const recentComplaints = await Complaint.find()
      .populate('userId', 'name')
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0
      ? ((resolvedCount / totalComplaints) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalComplaints,
        statusCounts: {
          registered: registeredCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          escalated: escalatedCount,
        },
        users: {
          citizens: totalCitizens,
          officers: totalOfficers,
        },
        totalDepartments,
        totalEscalations,
        sla: {
          onTime: onTimeSLA,
          delayed: delayedSLA,
        },
        resolutionRate: `${resolutionRate}%`,
        complaintsByType,
        complaintsByDepartment,
        recentComplaints,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// ============================================
// @desc    Get public dashboard statistics
// @route   GET /api/dashboard/public
// @access  Public (anyone can view)
// ============================================
const getPublicStats = async (req, res) => {
  try {
    // Public dashboard shows limited, non-sensitive data
    const totalComplaints = await Complaint.countDocuments();
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
    const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
    const escalatedCount = await Complaint.countDocuments({ status: 'Escalated' });

    const resolutionRate = totalComplaints > 0
      ? ((resolvedCount / totalComplaints) * 100).toFixed(1)
      : 0;

    // Complaints by type (for public chart)
    const complaintsByType = await Complaint.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Department performance (public view)
    const departmentPerformance = await Complaint.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department.departmentName',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalComplaints,
        resolved: resolvedCount,
        inProgress: inProgressCount,
        escalated: escalatedCount,
        resolutionRate: `${resolutionRate}%`,
        complaintsByType,
        departmentPerformance,
      },
    });
  } catch (error) {
    console.error('Public stats error:', error.message);
    res.status(500).json({ message: 'Error fetching public statistics' });
  }
};

module.exports = { getStats, getPublicStats };
