// ============================================
// Seed Data Script
// ============================================
// This script populates the database with sample
// data for testing. Run it once to set up:
//   - 5 Departments (Road, Water, Garbage, Sanitation, Electricity)
//   - 3 Users (1 admin, 1 officer, 1 citizen)
//   - 3 Sample Complaints
//   - SLA records for each complaint
//
// HOW TO RUN:
//   cd backend
//   node seed/seedData.js
//
// This will DELETE existing data and create fresh data!
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const SLA = require('../models/SLA');
const Notification = require('../models/Notification');
const Escalation = require('../models/Escalation');

const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('📦 Connected to database');

    // ============================================
    // Step 1: Clear all existing data
    // ============================================
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await SLA.deleteMany({});
    await Notification.deleteMany({});
    await Escalation.deleteMany({});

    // ============================================
    // Step 2: Create Departments
    // ============================================
    console.log('🏢 Creating departments...');
    const departments = await Department.insertMany([
      {
        departmentName: 'Road Maintenance',
        issueTypes: ['road'],
        slaTimeline: 3, // 3 days to resolve
      },
      {
        departmentName: 'Water Supply',
        issueTypes: ['water'],
        slaTimeline: 2,
      },
      {
        departmentName: 'Waste Management',
        issueTypes: ['garbage'],
        slaTimeline: 1,
      },
      {
        departmentName: 'Sanitation Department',
        issueTypes: ['sanitation'],
        slaTimeline: 2,
      },
      {
        departmentName: 'Electricity Board',
        issueTypes: ['electricity'],
        slaTimeline: 1,
      },
      {
        departmentName: 'General Administration',
        issueTypes: ['other'],
        slaTimeline: 5,
      },
    ]);

    console.log(`   ✅ Created ${departments.length} departments`);

    // ============================================
    // Step 3: Create Users
    // ============================================
    console.log('👤 Creating users...');

    // Hash passwords manually (since we're using insertMany which doesn't trigger pre-save)
    const salt = await bcrypt.genSalt(10);
    const hashedAdmin = await bcrypt.hash('admin123', salt);
    const hashedOfficer = await bcrypt.hash('officer123', salt);
    const hashedCitizen = await bcrypt.hash('citizen123', salt);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@municipality.com',
        password: hashedAdmin,
        role: 'admin',
      },
      {
        name: 'Road Officer',
        email: 'officer@municipality.com',
        password: hashedOfficer,
        role: 'officer',
        department: departments[0]._id, // Road Maintenance
      },
      {
        name: 'John Citizen',
        email: 'citizen@example.com',
        password: hashedCitizen,
        role: 'citizen',
      },
    ]);

    console.log(`   ✅ Created ${users.length} users`);

    // Update department with assigned officer
    await Department.findByIdAndUpdate(departments[0]._id, {
      $push: { assignedOfficers: users[1]._id },
    });

    // ============================================
    // Step 4: Create Sample Complaints
    // ============================================
    console.log('📋 Creating sample complaints...');

    const citizen = users[2]; // John Citizen

    const complaints = await Complaint.insertMany([
      {
        userId: citizen._id,
        title: 'Large pothole on Main Street',
        description: 'There is a large pothole near the intersection of Main Street and 2nd Avenue. It is causing damage to vehicles.',
        issueType: 'road',
        status: 'Registered',
        departmentId: departments[0]._id,
        location: '123 Main Street, Downtown',
      },
      {
        userId: citizen._id,
        title: 'Water pipe leaking',
        description: 'A water pipe is leaking near the park area, causing water wastage and slippery roads.',
        issueType: 'water',
        status: 'In Progress',
        departmentId: departments[1]._id,
        location: 'Central Park, North Side',
      },
      {
        userId: citizen._id,
        title: 'Garbage not collected for 3 days',
        description: 'The garbage in our area has not been collected for 3 days. It is causing bad smell and health hazards.',
        issueType: 'garbage',
        status: 'Registered',
        departmentId: departments[2]._id,
        location: 'Block B, Residential Area',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ]);

    console.log(`   ✅ Created ${complaints.length} complaints`);

    // ============================================
    // Step 5: Create SLA Records
    // ============================================
    console.log('⏱️  Creating SLA records...');

    const slaRecords = [];
    for (let i = 0; i < complaints.length; i++) {
      const dept = departments.find(
        (d) => d._id.toString() === complaints[i].departmentId.toString()
      );
      const deadline = new Date(complaints[i].createdAt);
      deadline.setDate(deadline.getDate() + dept.slaTimeline);

      slaRecords.push({
        complaintId: complaints[i]._id,
        deadline: deadline,
        status: 'on-time',
      });
    }

    await SLA.insertMany(slaRecords);
    console.log(`   ✅ Created ${slaRecords.length} SLA records`);

    // ============================================
    // Step 6: Create Sample Notifications
    // ============================================
    console.log('🔔 Creating sample notifications...');

    await Notification.insertMany([
      {
        userId: citizen._id,
        message: 'Your complaint "Large pothole on Main Street" has been registered and assigned to Road Maintenance.',
        type: 'system',
        complaintId: complaints[0]._id,
      },
      {
        userId: citizen._id,
        message: 'Your complaint "Water pipe leaking" is now In Progress.',
        type: 'system',
        complaintId: complaints[1]._id,
        isRead: true,
      },
    ]);

    console.log('   ✅ Created sample notifications');

    // ============================================
    // Done!
    // ============================================
    console.log('\n============================================');
    console.log('🎉 Database seeded successfully!');
    console.log('============================================');
    console.log('\nLogin credentials:');
    console.log('  Admin:   admin@municipality.com / admin123');
    console.log('  Officer: officer@municipality.com / officer123');
    console.log('  Citizen: citizen@example.com / citizen123');
    console.log('============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
