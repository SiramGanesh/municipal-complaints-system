// ============================================
// File Upload Middleware (Multer)
// ============================================
// Multer is a Node.js middleware for handling
// file uploads (multipart/form-data).
//
// This configuration:
// - Saves files to the 'uploads/' folder
// - Only allows image files (jpg, png, gif, etc.)
// - Limits file size to 5MB
// - Generates unique filenames to avoid conflicts
// ============================================

const multer = require('multer');
const path = require('path');

// ============================================
// Storage Configuration
// ============================================
// Tells Multer WHERE to save files and WHAT to name them
// ============================================
const storage = multer.diskStorage({
  // Where to save the file
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save in the 'uploads' folder
  },

  // What to name the file
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp-random.extension
    // Example: complaint-1700000000000-123456789.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Get file extension (.jpg, .png)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// ============================================
// File Filter
// ============================================
// Only allow image files to be uploaded
// ============================================
const fileFilter = (req, file, cb) => {
  // Check if the file type is an image
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// ============================================
// Create the Multer Upload Instance
// ============================================
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

module.exports = upload;
