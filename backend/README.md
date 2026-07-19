# 🔧 Backend - Smart Complaint Escalation System

This is the **backend API** built with **Node.js**, **Express.js**, and **MongoDB**.

---

## 📁 Folder Structure Explained

```
backend/
├── server.js              ← ENTRY POINT: Starts the server
├── .env.example           ← Template for environment variables
├── package.json           ← Dependencies and scripts
│
├── config/
│   └── db.js              ← MongoDB connection logic
│
├── models/                ← DATABASE SCHEMAS (what data looks like)
│   ├── User.js            ← User accounts (citizen/officer/admin)
│   ├── Complaint.js       ← Complaint details
│   ├── Department.js      ← Municipal departments
│   ├── Escalation.js      ← Escalation records
│   ├── SLA.js             ← SLA deadline tracking
│   └── Notification.js    ← In-app notifications
│
├── middleware/            ← RUNS BEFORE CONTROLLER (checks/transforms)
│   ├── auth.js            ← JWT token verification + role checking
│   └── upload.js          ← Multer file upload configuration
│
├── controllers/           ← BUSINESS LOGIC (what happens when API is called)
│   ├── authController.js         ← Login/Register logic
│   ├── complaintController.js    ← CRUD for complaints
│   ├── departmentController.js   ← Department management
│   ├── escalationController.js   ← Escalation + SLA check
│   ├── notificationController.js ← Notification management
│   └── dashboardController.js    ← Statistics / analytics
│
├── routes/                ← URL DEFINITIONS (maps URLs to controllers)
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── departmentRoutes.js
│   ├── escalationRoutes.js
│   ├── notificationRoutes.js
│   └── dashboardRoutes.js
│
├── utils/
│   └── slaChecker.js      ← SLA monitoring logic
│
├── seed/
│   └── seedData.js        ← Sample data for testing
│
└── uploads/               ← Uploaded images stored here (auto-created)
```

---

## 🧠 How the Backend Works (Request Flow)

```
Client Request
    │
    ▼
server.js (Express app)
    │
    ▼
Route (e.g., /api/complaints)
    │
    ▼
Middleware (auth check, file upload)
    │
    ▼
Controller (business logic)
    │
    ▼
Model (database operation)
    │
    ▼
Response sent back to client
```

### Example: Creating a Complaint

1. **Client** sends POST request to `/api/complaints` with token + data
2. **Route** (`complaintRoutes.js`) receives the request
3. **Middleware** (`auth.js`) verifies the JWT token, checks role is "citizen"
4. **Middleware** (`upload.js`) handles any file upload
5. **Controller** (`complaintController.js`) runs `createComplaint`:
   - Finds the right department for the issue type
   - Saves complaint to database
   - Creates SLA record with deadline
   - Sends notification to citizen
6. **Response** sent back with complaint data

---

## 🔐 Authentication Flow (JWT)

```
REGISTRATION:
  User sends name/email/password → Server hashes password → Saves to DB → Returns JWT token

LOGIN:
  User sends email/password → Server finds user → Compares hashed passwords → Returns JWT token

PROTECTED ROUTES:
  User sends request with "Authorization: Bearer <token>" header
  → auth.js middleware verifies token → Extracts user ID → Attaches user to request
```

### What is JWT?
- **J**SON **W**eb **T**oken - a string that contains encoded user information
- It's like a "digital ID card" that proves who you are
- The server creates it when you login, and you send it with every request
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1Nj...`

---

## 📊 Key Concepts Explained

### Models (Mongoose Schemas)
- **What**: Define the structure of documents in MongoDB
- **Like**: Table definitions in SQL, but more flexible
- **Example**: User model defines that every user must have name, email, password, role

### Middleware
- **What**: Functions that run between receiving a request and sending a response
- **Like**: Security guards that check your ID before letting you into a building
- **Example**: `auth.js` checks if you're logged in before allowing access

### Controllers
- **What**: Functions that contain the actual business logic
- **Like**: The workers who do the actual job after the security guard lets you in
- **Example**: `createComplaint` saves the complaint and sets up SLA tracking

### Routes
- **What**: Map URL paths and HTTP methods to controller functions
- **Like**: A directory that tells you which office handles which request
- **Example**: `POST /api/complaints` → runs `createComplaint` controller

---

## 🗄️ Database Collections

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | User accounts | name, email, password, role |
| `complaints` | Complaint records | title, issueType, status, departmentId |
| `departments` | Municipal departments | departmentName, issueTypes, slaTimeline |
| `escalations` | Escalation records | complaintId, escalatedTo, level |
| `slas` | SLA deadline tracking | complaintId, deadline, status |
| `notifications` | User notifications | userId, message, isRead |

---

## ⏱️ SLA (Service Level Agreement) Logic

1. When a complaint is created, an SLA record is created:
   ```
   SLA deadline = complaint.createdAt + department.slaTimeline (in days)
   ```

2. The `slaChecker.js` utility checks for overdue complaints:
   ```
   IF current_date > SLA.deadline AND complaint.status != "Resolved":
       → Change complaint status to "Escalated"
       → Create escalation record
       → Send notification to citizen
   ```

3. This can be triggered:
   - Manually via `POST /api/escalations/check` (admin only)
   - Could be automated with a cron job (advanced)

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Seed database with sample data
npm run seed

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

---

## 🧪 Testing with Postman

1. **Register**: POST `http://localhost:5000/api/auth/register`
   ```json
   { "name": "Test User", "email": "test@test.com", "password": "test123" }
   ```

2. **Login**: POST `http://localhost:5000/api/auth/login`
   ```json
   { "email": "test@test.com", "password": "test123" }
   ```
   Copy the `token` from the response.

3. **Create Complaint**: POST `http://localhost:5000/api/complaints`
   - Header: `Authorization: Bearer <your-token>`
   - Body (form-data): title, description, issueType, location, image (file)
