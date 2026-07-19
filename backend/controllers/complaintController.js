// ============================================
// Complaint Controller
// ============================================
// Handles all complaint-related operations:
//   - createComplaint: File a new complaint
//   - getComplaints: Get all complaints (admin/officer)
//   - getMyComplaints: Get complaints filed by current user
//   - getComplaintById: Get a single complaint's details
//   - updateComplaintStatus: Update status (officer/admin)
//
// When a complaint is created:
// 1. It's saved to the database
// 2. Auto-assigned to the right department (based on issueType)
// 3. An SLA record is created with a deadline
// 4. A notification is sent to the citizen
// ============================================

const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const SLA = require('../models/SLA');
const Notification = require('../models/Notification');
const Escalation = require('../models/Escalation');

// ============================================
// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (citizen)
// ============================================
const createComplaint = async (req, res) => {
  try {
    const { title, description, issueType, location } = req.body;

    // If an image was uploaded, Multer adds it to req.file
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Step 1: Find the department that handles this issue type
    const department = await Department.findOne({
      issueTypes: issueType, // Find department whose issueTypes array contains this type
    });

    if (!department) {
      return res.status(400).json({
        message: `No department found for issue type: ${issueType}`,
      });
    }

    // Step 2: Create the complaint
    const complaint = await Complaint.create({
      userId: req.user.id, // Current logged-in user
      title,
      description,
      issueType,
      imageUrl,
      location,
      departmentId: department._id, // Auto-assign to department
      status: 'Registered',
    });

    // Step 3: Create SLA record with deadline
    // Deadline = current date + department's SLA timeline (in days)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + department.slaTimeline);

    await SLA.create({
      complaintId: complaint._id,
      deadline: deadline,
      status: 'on-time',
    });

    // Step 4: Send notification to citizen
    await Notification.create({
      userId: req.user.id,
      message: `Your complaint "${title}" has been registered and assigned to ${department.departmentName}. Expected resolution by ${deadline.toLocaleDateString()}.`,
      type: 'system',
      complaintId: complaint._id,
    });

    // Send response with the created complaint
    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint,
      assignedDepartment: department.departmentName,
      slaDeadline: deadline,
    });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ message: 'Error creating complaint' });
  }
};

// ============================================
// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (admin sees all, officer sees department's)
// ============================================
const getComplaints = async (req, res) => {
  try {
    let query = {};

    // If user is an officer, only show their department's complaints
    if (req.user.role === 'officer' && req.user.department) {
      query.departmentId = req.user.department;
    }

    // Find complaints and populate (join) user and department info
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email') // Include user's name and email
      .populate('departmentId', 'departmentName slaTimeline') // Include dept name
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error.message);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// ============================================
// @desc    Get complaints filed by current user
// @route   GET /api/complaints/my
// @access  Private (citizen)
// ============================================
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .populate('departmentId', 'departmentName slaTimeline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    res.status(500).json({ message: 'Error fetching your complaints' });
  }
};

// ============================================
// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
// ============================================
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('departmentId', 'departmentName slaTimeline');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Get SLA info for this complaint
    const sla = await SLA.findOne({ complaintId: complaint._id });

    res.json({
      success: true,
      complaint,
      sla,
    });
  } catch (error) {
    console.error('Get complaint error:', error.message);
    res.status(500).json({ message: 'Error fetching complaint' });
  }
};

// ============================================
// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (officer/admin)
// ============================================
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // Validate status value
    const validStatuses = ['Registered', 'In Progress', 'Resolved', 'Escalated', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (status === 'Rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({ message: 'Rejection reason is mandatory when rejecting a complaint' });
    }

    // Find and update the complaint
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();

    if (status === 'Rejected') {
      complaint.rejectionReason = rejectionReason;
      complaint.rejectedBy = req.user._id || req.user.id;
      complaint.rejectedAt = Date.now();
    }

    await complaint.save();

    // If resolved, update SLA status
    if (status === 'Resolved') {
      const sla = await SLA.findOne({ complaintId: complaint._id });
      if (sla) {
        // Check if resolved before or after deadline
        sla.status = new Date() <= sla.deadline ? 'on-time' : 'delayed';
        await sla.save();
      }
    }

    // Send notification to the citizen about status change
    let notificationMessage = `Your complaint "${complaint.title}" status has been updated to "${status}".`;
    if (status === 'Rejected') {
      notificationMessage += ` Reason: ${rejectionReason}`;
    }

    await Notification.create({
      userId: complaint.userId,
      message: notificationMessage,
      type: 'system',
      complaintId: complaint._id,
    });

    res.json({
      success: true,
      message: `Complaint status updated to "${status}"`,
      complaint,
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Error updating complaint status' });
  }
};

// ============================================
// @desc    Delete single complaint by ID
// @route   DELETE /api/complaints/:id
// @access  Private (Creator or admin)
// ============================================
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if the user is the creator (or admin)
    if (complaint.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    // Prevent deletion if the complaint is resolved
    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Cannot delete a resolved complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    // Also delete related SLA, Escalations, and Notifications to prevent orphans
    await SLA.findOneAndDelete({ complaintId: req.params.id });
    await Escalation.deleteMany({ complaintId: req.params.id });
    await Notification.deleteMany({ complaintId: req.params.id });

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error.message);
    res.status(500).json({ message: 'Error deleting complaint' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
};
