# Health and Care Support System Using OTP-Based Secure Volunteer Network

## Full Project Analysis & Technical Documentation

---

## 1. Project Overview

The **Health and Care Support System Using OTP-Based Secure Volunteer Network** is a web-based platform designed to provide health and daily care assistance through a trusted volunteer network.

### Problem Statement

Many people, especially the elderly and disabled, struggle to access basic healthcare services like medicine delivery, hospital visits, and emergency assistance. Relying solely on hospitals or paid caregivers is expensive and not always available.

### Solution

A community-driven platform that connects people in need with verified, nearby volunteers in a secure and organized way.

### Services Provided

- Medicine Delivery
- Hospital Visit Assistance
- Grocery Support
- Emergency Care
- Daily Care Services

---

## 2. Technical Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| **Frontend** | React.js, Tailwind CSS            |
| **Backend**  | Node.js, Express.js               |
| **Database** | MongoDB (with Mongoose ODM)       |
| **Auth**     | OTP-based (SMS Gateway API)       |
| **Geo**      | MongoDB GeoSpatial Indexing (2dsphere) |
| **Scheduling** | node-cron (Background Jobs)    |
| **Notifications** | Nodemailer / SMS API (Twilio / Fast2SMS) |
| **State Management** | React Context API / Redux |
| **HTTP Client** | Axios                          |
| **Styling**  | Tailwind CSS                      |
| **Security** | bcrypt, express-session, CORS, Helmet |

---

## 3. System Roles & Permissions (RBAC)

### 3.1 User (Service Requester)

| Capability                | Description                                      |
| ------------------------- | ------------------------------------------------ |
| Register & OTP Login      | Sign up with details, login via OTP verification |
| Create Service Requests   | Raise requests for medicine, hospital, emergency |
| Set Request Priority      | Normal / Urgent / Emergency                      |
| Track Request Status      | Real-time status: Pending → Accepted → In Progress → Completed |
| Give Feedback             | Rate and review volunteer after service completion |
| Schedule Recurring Service| Set up monthly/weekly medicine delivery automation |

### 3.2 Volunteer (Service Provider)

| Capability                | Description                                      |
| ------------------------- | ------------------------------------------------ |
| Register & OTP Login      | Sign up, await admin verification                |
| View Nearby Requests      | GeoSpatial-filtered requests within radius       |
| Accept & Complete Tasks   | Pick tasks, update status through workflow        |
| Build Trust Score         | Score increases with completions & good feedback  |
| Receive Notifications     | Alerts for new requests, recurring reminders      |

### 3.3 Admin (System Manager)

| Capability                | Description                                      |
| ------------------------- | ------------------------------------------------ |
| Verify Volunteers         | Approve/reject new volunteer registrations        |
| Monitor System Activity   | View all requests, statuses, and feedback         |
| Manage Trust Scores       | Oversee volunteer ranking and performance         |
| Block Accounts            | Disable misuse or fake accounts                   |
| Dashboard Analytics       | Overview of system metrics and operations         |

---

## 4. Application Workflow (Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Registration & OTP Login                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Register │───>│ Send OTP │───>│  Verify  │───> Session       │
│  │  (Form)   │    │ (SMS API)│    │  OTP     │     Created       │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
│  Step 2: Service Request Creation                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Select   │───>│   Set    │───>│  Submit  │───> Stored in DB  │
│  │  Service  │    │ Priority │    │ Request  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
│  Step 3: GeoSpatial Volunteer Matching                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  User     │───>│ $near /  │───>│ Matched  │───> Notify        │
│  │ Location  │    │ 2dsphere │    │Volunteers│    Volunteers     │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
│  Step 4: Task Acceptance & Tracking                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ Volunteer │───>│  Update  │───>│ Complete │───> User Notified │
│  │  Accepts  │    │  Status  │    │   Task   │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
│  Step 5: Feedback & Trust Score Update                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │   User    │───>│ Calculate│───>│  Update  │───> Volunteer     │
│  │ Feedback  │    │  Score   │    │  Ranking │     Ranked        │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
│  Step 6: Admin Verification & Monitoring                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Review   │───>│  Verify/ │───>│ Monitor  │───> System        │
│  │ Volunteer │    │  Reject  │    │ Activity │     Secured       │
│  └──────────┘    └──────────┘    └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema Design (MongoDB)

### 5.1 User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,                    // registered mobile number
  password: String,                 // bcrypt hashed
  role: String,                     // "user" | "volunteer" | "admin"
  location: {
    type: "Point",
    coordinates: [Number, Number]   // [longitude, latitude]
  },
  address: String,
  isVerified: Boolean,              // admin verification (for volunteers)
  trustScore: Number,               // default: 0 (volunteers only)
  completedTasks: Number,           // task completion count
  cancelledTasks: Number,           // task cancellation count
  avgRating: Number,                // average feedback rating
  otp: String,                      // current OTP (time-bound)
  otpExpiry: Date,                  // OTP expiration timestamp
  createdAt: Date,
  updatedAt: Date
}
```

**Index:** `location` field with `2dsphere` index for GeoSpatial queries.

### 5.2 Service Request Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref: User (requester)
  volunteerId: ObjectId,            // ref: User (assigned volunteer)
  serviceType: String,              // "medicine" | "hospital" | "grocery" | "emergency"
  priority: String,                 // "normal" | "urgent" | "emergency"
  priorityWeight: Number,           // 1 (normal) | 2 (urgent) | 3 (emergency)
  description: String,
  location: {
    type: "Point",
    coordinates: [Number, Number]
  },
  address: String,
  status: String,                   // "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  isRecurring: Boolean,             // recurring service flag
  recurringScheduleId: ObjectId,    // ref: RecurringSchedule (if recurring)
  feedback: {
    rating: Number,                 // 1-5
    comment: String
  },
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

**Index:** `location` with `2dsphere`, compound index on `{ priority: -1, createdAt: 1 }` for priority scheduling.

### 5.3 Recurring Schedule Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref: User
  volunteerId: ObjectId,            // ref: User (fixed volunteer)
  serviceType: String,              // "medicine" | "grocery"
  medicineName: String,             // e.g., "Diabetes Tablets"
  frequency: String,                // "weekly" | "monthly"
  nextDueDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.4 Notification Collection

```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,            // ref: User
  type: String,                     // "task_accepted" | "emergency" | "recurring_reminder" | "task_completed"
  message: String,
  isRead: Boolean,
  relatedRequestId: ObjectId,       // ref: ServiceRequest
  createdAt: Date
}
```

---

## 6. Core Technical Features

### 6.1 OTP-Based Secure Authentication

**How it works:**

1. User submits phone number at login
2. Backend generates a **6-digit time-bound OTP** (expires in 5 minutes)
3. OTP is sent via SMS Gateway API (Twilio / Fast2SMS)
4. User enters OTP on frontend
5. Backend validates OTP and creates an authenticated session

**Security Benefits:**
- Eliminates password-based credential theft
- Time-bound OTP prevents replay attacks
- Server-side generation prevents client-side manipulation

**Backend Logic (Express.js):**

```javascript
// Generate OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

// Store in DB
await User.findOneAndUpdate({ phone }, { otp, otpExpiry });

// Send via SMS API
await smsGateway.send(phone, `Your OTP is: ${otp}`);
```

```javascript
// Verify OTP
const user = await User.findOne({ phone, otp, otpExpiry: { $gt: new Date() } });
if (!user) return res.status(401).json({ error: "Invalid or expired OTP" });

// Create session
req.session.userId = user._id;
req.session.role = user.role;
```

---

### 6.2 Role-Based Access Control (RBAC)

**Middleware Implementation:**

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

// Usage in routes
router.post("/requests", authorize("user"), createRequest);
router.put("/requests/:id/accept", authorize("volunteer"), acceptRequest);
router.put("/volunteers/:id/verify", authorize("admin"), verifyVolunteer);
```

**Access Matrix:**

| Endpoint                 | User | Volunteer | Admin |
| ------------------------ | ---- | --------- | ----- |
| Create Request           | Yes  | No        | No    |
| View Nearby Requests     | No   | Yes       | Yes   |
| Accept Task              | No   | Yes       | No    |
| Update Task Status       | No   | Yes       | No    |
| Give Feedback            | Yes  | No        | No    |
| Verify Volunteer         | No   | No        | Yes   |
| View All Requests        | No   | No        | Yes   |
| Block Account            | No   | No        | Yes   |
| Schedule Recurring       | Yes  | No        | No    |

---

### 6.3 Priority-Based Request Scheduling

Requests are classified into three priority levels and sorted using a **priority queue model**:

| Priority    | Weight | Behavior                            |
| ----------- | ------ | ----------------------------------- |
| Emergency   | 3      | Appears first in volunteer dashboard |
| Urgent      | 2      | Appears after emergency requests     |
| Normal      | 1      | Standard queue order                 |

**Query Logic:**

```javascript
// Fetch requests sorted by priority (emergency first), then by creation time
const requests = await ServiceRequest.find({
  status: "pending",
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: volunteerCoords },
      $maxDistance: 5000  // 5 km radius
    }
  }
}).sort({ priorityWeight: -1, createdAt: 1 });
```

---

### 6.4 GeoSpatial Volunteer Matching

**How it works:**

1. User and volunteer locations are stored as **GeoJSON Point** coordinates
2. MongoDB `2dsphere` index enables efficient spatial queries
3. When a request is created, the system queries for nearby volunteers using `$near` operator

**MongoDB Index:**

```javascript
userSchema.index({ location: "2dsphere" });
```

**Matching Query:**

```javascript
const nearbyVolunteers = await User.find({
  role: "volunteer",
  isVerified: true,
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [requestLongitude, requestLatitude]
      },
      $maxDistance: 5000  // 5 km radius in meters
    }
  }
}).sort({ trustScore: -1 }); // highest trust score first
```

**Benefits:**
- Faster than manual distance calculation
- Scales efficiently with large volunteer datasets
- Combined with trust score sorting for optimal matching

---

### 6.5 Task Assignment & Real-Time Tracking

**Status Workflow:**

```
Pending ──> Accepted ──> In Progress ──> Completed
                │                            │
                └──> Cancelled               └──> Feedback Given
```

**Status Transitions:**

| From        | To          | Actor     | Trigger              |
| ----------- | ----------- | --------- | -------------------- |
| Pending     | Accepted    | Volunteer | Accepts the task     |
| Accepted    | In Progress | Volunteer | Starts the task      |
| In Progress | Completed   | Volunteer | Finishes the task    |
| Pending     | Cancelled   | User      | Cancels the request  |
| Accepted    | Cancelled   | Volunteer | Cannot fulfil task   |

---

### 6.6 Trust Score Algorithm

Volunteer reliability is computed using a **dynamic trust-score evaluation model**:

**Formula:**

```
Trust Score = (Completed Tasks x 2) + (Avg Rating x 10) - (Cancelled Tasks x 5)
```

**Example Calculation:**

| Metric           | Value | Weight | Result |
| ---------------- | ----- | ------ | ------ |
| Completed Tasks  | 20    | x 2    | 40     |
| Avg Rating       | 4.5   | x 10   | 45     |
| Cancelled Tasks  | 2     | x 5    | -10    |
| **Trust Score**  |       |        | **75** |

**Implementation:**

```javascript
const calculateTrustScore = (volunteer) => {
  const completionScore = volunteer.completedTasks * 2;
  const ratingScore = volunteer.avgRating * 10;
  const penalty = volunteer.cancelledTasks * 5;
  return completionScore + ratingScore - penalty;
};
```

**Score is recalculated when:**
- A task is marked as completed
- User submits feedback/rating
- A task is cancelled by the volunteer

---

### 6.7 Recurring Service Scheduling

**Use Case:** Monthly medicine refill, weekly grocery delivery

**How it works:**

1. User selects service type, medicine name, and frequency (weekly/monthly)
2. System assigns a **fixed volunteer** to that user
3. A **cron job** runs daily to check for upcoming due dates
4. Automatic notifications are sent to the volunteer before the due date
5. A new service request is auto-generated on the due date

**Cron Job (node-cron):**

```javascript
const cron = require("node-cron");

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueSchedules = await RecurringSchedule.find({
    isActive: true,
    nextDueDate: { $lte: tomorrow }
  }).populate("userId volunteerId");

  for (const schedule of dueSchedules) {
    // Create notification for volunteer
    await Notification.create({
      recipientId: schedule.volunteerId,
      type: "recurring_reminder",
      message: `Reminder: Deliver ${schedule.medicineName} for ${schedule.userId.name} tomorrow.`,
      relatedRequestId: null
    });

    // Auto-create service request on due date
    if (schedule.nextDueDate <= new Date()) {
      await ServiceRequest.create({
        userId: schedule.userId,
        volunteerId: schedule.volunteerId,
        serviceType: schedule.serviceType,
        priority: "normal",
        description: `Recurring: ${schedule.medicineName}`,
        isRecurring: true,
        recurringScheduleId: schedule._id,
        status: "pending"
      });

      // Update next due date
      const next = new Date(schedule.nextDueDate);
      if (schedule.frequency === "monthly") next.setMonth(next.getMonth() + 1);
      if (schedule.frequency === "weekly") next.setDate(next.getDate() + 7);
      schedule.nextDueDate = next;
      await schedule.save();
    }
  }
});
```

---

### 6.8 Notification & Alert System

**Event-Driven Notifications:**

| Event                    | Recipient  | Channel        |
| ------------------------ | ---------- | -------------- |
| Emergency Request Created| Nearby Volunteers | SMS + In-App |
| Task Accepted            | User       | In-App         |
| Task Completed           | User       | In-App + SMS   |
| Recurring Reminder       | Volunteer  | SMS + In-App   |
| Volunteer Verified       | Volunteer  | In-App         |

---

### 6.9 Admin Verification & Monitoring

**Volunteer Verification Flow:**

```
Volunteer Registers ──> Status: "Pending"
        │
Admin Reviews Profile
        │
   ┌────┴────┐
   │         │
Approved   Rejected
   │         │
Status:    Status:
"Verified" "Rejected"
   │
Can Accept Tasks
```

**Admin Dashboard Features:**
- Total users, volunteers, and requests count
- Active/completed/cancelled request breakdown
- Volunteer trust score leaderboard
- Pending volunteer verification queue
- Feedback and complaint monitoring

---

### 6.10 Privacy & Data Protection

| Measure                    | Implementation                           |
| -------------------------- | ---------------------------------------- |
| Password Hashing           | bcrypt with salt rounds                  |
| Session Security           | express-session with secure cookies      |
| OTP Expiry                 | Time-bound (5 min), single-use           |
| Role-Restricted Access     | Middleware-enforced RBAC                  |
| Data Minimization          | Volunteers see only assigned request data |
| CORS Protection            | Whitelisted origins only                 |
| HTTP Security Headers      | Helmet.js middleware                     |

---

## 7. Project Folder Structure

```
volunteer/
├── client/                         # React.js Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── OtpInput.jsx
│   │   │   ├── RequestCard.jsx
│   │   │   ├── TrustBadge.jsx
│   │   │   └── NotificationBell.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── VolunteerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateRequest.jsx
│   │   │   ├── TrackRequest.jsx
│   │   │   ├── RecurringSchedule.jsx
│   │   │   └── FeedbackForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── requestService.js
│   │   │   └── notificationService.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css               # Tailwind directives
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                         # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── ServiceRequest.js
│   │   ├── RecurringSchedule.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── volunteerRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── recurringRoutes.js
│   │   └── notificationRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── requestController.js
│   │   ├── volunteerController.js
│   │   ├── adminController.js
│   │   ├── recurringController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js                 # Session validation
│   │   └── authorize.js            # RBAC middleware
│   ├── jobs/
│   │   └── recurringScheduler.js   # Cron job for recurring services
│   ├── utils/
│   │   ├── sendOtp.js              # SMS gateway integration
│   │   ├── trustScore.js           # Trust score calculator
│   │   └── geoQuery.js             # GeoSpatial helpers
│   ├── server.js                   # Entry point
│   └── package.json
│
├── .env                            # Environment variables
├── .gitignore
└── PROJECT_ANALYSIS.md             # This file
```

---

## 8. API Endpoints

### Authentication

| Method | Endpoint              | Description           | Access  |
| ------ | --------------------- | --------------------- | ------- |
| POST   | `/api/auth/register`  | Register new user     | Public  |
| POST   | `/api/auth/send-otp`  | Send OTP to phone     | Public  |
| POST   | `/api/auth/verify-otp`| Verify OTP & login    | Public  |
| POST   | `/api/auth/logout`    | Destroy session       | Auth    |

### Service Requests

| Method | Endpoint                       | Description               | Access    |
| ------ | ------------------------------ | ------------------------- | --------- |
| POST   | `/api/requests`                | Create service request    | User      |
| GET    | `/api/requests/my`             | Get user's requests       | User      |
| GET    | `/api/requests/nearby`         | Get nearby requests       | Volunteer |
| PUT    | `/api/requests/:id/accept`     | Accept a request          | Volunteer |
| PUT    | `/api/requests/:id/status`     | Update request status     | Volunteer |
| POST   | `/api/requests/:id/feedback`   | Submit feedback           | User      |

### Recurring Services

| Method | Endpoint                       | Description                  | Access |
| ------ | ------------------------------ | ---------------------------- | ------ |
| POST   | `/api/recurring`               | Create recurring schedule    | User   |
| GET    | `/api/recurring/my`            | Get user's schedules         | User   |
| PUT    | `/api/recurring/:id/cancel`    | Cancel a schedule            | User   |

### Admin

| Method | Endpoint                         | Description              | Access |
| ------ | -------------------------------- | ------------------------ | ------ |
| GET    | `/api/admin/volunteers/pending`  | Get pending volunteers   | Admin  |
| PUT    | `/api/admin/volunteers/:id/verify` | Verify a volunteer     | Admin  |
| PUT    | `/api/admin/volunteers/:id/block`  | Block a volunteer      | Admin  |
| GET    | `/api/admin/dashboard`           | Get system stats         | Admin  |
| GET    | `/api/admin/requests`            | Get all requests         | Admin  |

### Notifications

| Method | Endpoint                         | Description              | Access |
| ------ | -------------------------------- | ------------------------ | ------ |
| GET    | `/api/notifications`             | Get user notifications   | Auth   |
| PUT    | `/api/notifications/:id/read`    | Mark as read             | Auth   |

---

## 9. Frontend Pages (React.js + Tailwind CSS)

| Page                  | Route                  | Role      | Description                         |
| --------------------- | ---------------------- | --------- | ----------------------------------- |
| Home / Landing        | `/`                    | Public    | Project intro & feature highlights  |
| Login                 | `/login`               | Public    | Phone + OTP login                   |
| Register              | `/register`            | Public    | Registration form with role select  |
| User Dashboard        | `/user/dashboard`      | User      | Active requests, history, stats     |
| Create Request        | `/user/create-request` | User      | Service type, priority, location    |
| Track Request         | `/user/track/:id`      | User      | Real-time status tracking           |
| Feedback Form         | `/user/feedback/:id`   | User      | Rating & comment submission         |
| Recurring Schedule    | `/user/recurring`      | User      | Set up monthly/weekly services      |
| Volunteer Dashboard   | `/volunteer/dashboard` | Volunteer | Nearby requests sorted by priority  |
| Task Detail           | `/volunteer/task/:id`  | Volunteer | Accept, update status, communicate  |
| Admin Dashboard       | `/admin/dashboard`     | Admin     | System stats & monitoring           |
| Volunteer Verification| `/admin/volunteers`    | Admin     | Approve/reject volunteers           |
| Request Management    | `/admin/requests`      | Admin     | View all requests & statuses        |

---

## 10. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/volunteer_health_system

# Session
SESSION_SECRET=your_session_secret_key

# SMS Gateway (Fast2SMS / Twilio)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=HEALTH

# CORS
CLIENT_URL=http://localhost:3000
```

---

## 11. Key Algorithms & Logic

### Trust Score Recalculation (on task completion)

```
Input:  completedTasks, avgRating, cancelledTasks
Output: trustScore (Number)

trustScore = (completedTasks * 2) + (avgRating * 10) - (cancelledTasks * 5)

Minimum score: 0
Maximum score: Unbounded (grows with completions)
```

### Priority Queue Scheduling

```
Emergency (weight: 3) → Processed first
Urgent    (weight: 2) → Processed second
Normal    (weight: 1) → Processed last

Within same priority: sorted by createdAt (oldest first - FIFO)
```

### GeoSpatial Matching

```
Input:  User location [lng, lat], search radius (meters)
Method: MongoDB $near with 2dsphere index
Output: Sorted list of nearby verified volunteers (by trust score desc)
```

---

## 12. Security Measures

| Threat                    | Mitigation                                     |
| ------------------------- | ---------------------------------------------- |
| Unauthorized Access       | OTP-based auth + session validation            |
| Credential Theft          | No passwords stored in plain text (bcrypt)     |
| Privilege Escalation      | RBAC middleware on every protected route        |
| Replay Attack             | Time-bound OTP (5 min expiry, single-use)      |
| XSS                       | React auto-escaping + Helmet security headers  |
| CSRF                      | Session-based tokens + SameSite cookies        |
| Data Exposure             | Role-restricted data access, minimal data sent |
| Fake Volunteers           | Admin verification required before activation  |
| Brute Force OTP           | Rate limiting on OTP endpoints                 |

---

## 13. Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React.js   │────>│  Express.js  │────>│   MongoDB    │
│   Frontend   │     │   Backend    │     │  (Atlas /    │
│  (Vercel /   │     │  (Render /   │     │   Local)     │
│   Netlify)   │     │   Railway)   │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  SMS Gateway │
                     │  (Twilio /   │
                     │  Fast2SMS)   │
                     └──────────────┘
```

---

## 14. Future Enhancements

- **Real-time Chat:** WebSocket-based communication between user and volunteer
- **Map Integration:** Leaflet.js / Google Maps for visual volunteer tracking
- **Mobile App:** React Native version for on-the-go access
- **AI-Based Matching:** ML model to predict best volunteer based on history
- **Multi-language Support:** i18n for regional language accessibility
- **Payment Integration:** Optional payment for premium services
- **Analytics Dashboard:** Charts and graphs for admin insights (Chart.js / Recharts)

---

## 15. Conclusion

This system provides a **secure, scalable, and community-driven** healthcare assistance platform. By integrating:

- **OTP-based authentication** for secure access
- **GeoSpatial matching** for efficient volunteer discovery
- **Priority scheduling** for emergency responsiveness
- **Trust-score ranking** for volunteer reliability
- **Recurring service automation** for continuity of care
- **RBAC** for controlled access
- **Notification automation** for timely coordination

The platform delivers a practical, real-world solution for connecting people in need with trusted volunteers.

> **"Our system connects users with verified nearby volunteers using OTP login, GeoSpatial matching, emergency priority scheduling, trust-score ranking, and monthly recurring medicine support with automatic notifications."**
