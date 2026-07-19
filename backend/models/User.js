// ============================================
// User Model (Schema)
// ============================================
// This defines the structure of a User document
// in MongoDB. Think of it like a table definition
// in SQL, but for MongoDB.
//
// Fields:
//   - name: User's full name
//   - email: Unique email for login
//   - password: Hashed password (never store plain text!)
//   - role: citizen, officer, or admin
//   - department: Which department an officer belongs to
//   - createdAt: When the account was created
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema (structure) for User documents
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'], // Validation message
    trim: true, // Removes extra spaces
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true, // No two users can have the same email
    lowercase: true, // Converts to lowercase
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password when querying users
  },
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin'], // Only these values are allowed
    default: 'citizen', // New users are citizens by default
  },
  department: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Department collection
    ref: 'Department', // Which collection to reference
    default: null, // Only officers have departments
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current date
  },
});

// ============================================
// Pre-save Middleware (runs before saving)
// ============================================
// This automatically hashes the password before
// saving it to the database. This is important
// for security - never store plain text passwords!
// ============================================
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a "salt" (random data) and hash the password
  // The number 10 is the "salt rounds" - higher = more secure but slower
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// Instance Method: Compare Passwords
// ============================================
// This method checks if a given password matches
// the hashed password stored in the database.
// We use this during login.
// ============================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema and export it
// 'User' will create a 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema);
