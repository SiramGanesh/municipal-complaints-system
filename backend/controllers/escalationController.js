// ============================================
// Escalation Controller
// ============================================
// Handles escalation-related operations.
// Escalations happen when complaints are not
// resolved within the SLA deadline.
// ============================================

const Escalation = require('../models/Escalation');
const { checkAndEscalate } = require('../utils/slaChecker');

// ============================================
// @desc    Get all escalations
// @route   GET /api/escalations
// @access  Private (admin)
// ============================================
const getEscalations = async (req, res) => {
  try {
    const escalations = await Escalation.find()
      .populate({
        path: 'complaintId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'departmentId', select: 'departmentName' },
        ],
      })
      .sort({ escalatedAt: -1 }); // Newest first

    // Filter out any orphaned escalations (where the associated complaint was deleted)
    const validEscalations = escalations.filter(e => e.complaintId !== null);

    res.json({
      success: true,
      count: validEscalations.length,
      escalations: validEscalations,
    });
  } catch (error) {
    console.error('Get escalations error:', error.message);
    res.status(500).json({ message: 'Error fetching escalations' });
  }
};

// ============================================
// @desc    Run SLA check and escalate overdue complaints
// @route   POST /api/escalations/check
// @access  Private (admin)
// ============================================
const runSLACheck = async (req, res) => {
  try {
    const result = await checkAndEscalate();
    res.json({
      success: true,
      message: `SLA check completed. Checked: ${result.checked}, Escalated: ${result.escalated}`,
      result,
    });
  } catch (error) {
    console.error('SLA check error:', error.message);
    res.status(500).json({ message: 'Error running SLA check' });
  }
};

module.exports = { getEscalations, runSLACheck };
