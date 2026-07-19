// ============================================
// Database Connection Configuration
// ============================================
// This file handles connecting to MongoDB.
// We use Mongoose - a library that makes it
// easier to work with MongoDB in Node.js.
// ============================================

// Workaround: on some Windows machines, the system DNS points to
// 127.0.0.1 (a local proxy from a VPN, antivirus, or router) which
// refuses the SRV queries used by MongoDB Atlas (mongodb+srv://).
// Forcing a public resolver before mongoose connects fixes the
// "querySrv ECONNREFUSED _mongodb._tcp..." error.
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');

// This function connects to MongoDB
const connectDB = async () => {
  try {
    // mongoose.connect() tries to connect to the database
    // We pass the connection string from our .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

// Export so we can use it in server.js
module.exports = connectDB;
