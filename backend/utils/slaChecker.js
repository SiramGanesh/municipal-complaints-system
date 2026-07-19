// ============================================
// SLA Checker Utility
// ============================================
// This utility checks all active complaints
// (not yet resolved) and escalates those that
// have exceeded their SLA deadline.
//
// HOW IT WORKS:
// 1. Find all SLA records where deadline has passed
// 2. For each overdue complaint:
//    a. Update complaint status to "Escalated"
//    b. Update SLA status to "delayed"
//    c. Create an escalation record
//    d. Send a notification to the citizen
//
// This can be run:
// - Manually via API endpoint
// - On a scheduled interval (e.g., every hour)
// ============================================

const Complaint = require('../models/Complaint');
const SLA = require('../models/SLA');
const Escalation = require('../models/Escalation');
const Notification = require('../models/Notification');

const checkAndEscalate = async () => {
  try {
    const now = new Date();

    // Find all SLA records where:
    // - deadline has passed (deadline < now)
    // - status is still "on-time" (hasn't been escalated yet)
    const overdueSLAs = await SLA.find({
      deadline: { $lt: now },
      status: 'on-time',
    });

    console.log(`🔍 Found ${overdueSLAs.length} overdue complaints`);

    let escalatedCount = 0;

    // Process each overdue complaint
    for (const sla of overdueSLAs) {
      // Find the complaint
      const complaint = await Complaint.findById(sla.complaintId);

      // Skip if complaint doesn't exist or is already resolved/escalated
      if (!complaint || complaint.status === 'Resolved' || complaint.status === 'Escalated') {
        // If resolved, mark SLA as on-time
        if (complaint && complaint.status === 'Resolved') {
          sla.status = 'on-time';
          await sla.save();
        }
        continue;
      }

      // Step 1: Update complaint status to "Escalated"
      complaint.status = 'Escalated';
      complaint.updatedAt = Date.now();
      await complaint.save();

      // Step 2: Update SLA status to "delayed"
      sla.status = 'delayed';
      await sla.save();

      // Step 3: Create an escalation record
      await Escalation.create({
        complaintId: complaint._id,
        escalatedTo: 'admin',
        reason: 'SLA deadline exceeded - complaint not resolved within the specified timeframe',
        level: 1,
      });

      // Step 4: Send notification to the citizen
      await Notification.create({
        userId: complaint.userId,
        message: `Your complaint "${complaint.title}" has been escalated to higher authorities due to delayed resolution.`,
        type: 'system',
        complaintId: complaint._id,
      });

      escalatedCount++;
    }

    console.log(`⚡ Escalated ${escalatedCount} complaints`);
    return { checked: overdueSLAs.length, escalated: escalatedCount };
  } catch (error) {
    console.error('❌ SLA Check Error:', error.message);
    throw error;
  }
};

module.exports = { checkAndEscalate };
