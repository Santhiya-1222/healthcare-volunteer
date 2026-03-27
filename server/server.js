// Load env properly (IMPORTANT FIX)
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recurringRoutes = require("./routes/recurringRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// 🔍 DEBUG (remove later)
console.log("MONGO URI:", process.env.MONGODB_URI);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Session setup (FIXED)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // ✅ FIXED
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start scheduler
require("./jobs/recurringScheduler");

// Start server AFTER DB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });