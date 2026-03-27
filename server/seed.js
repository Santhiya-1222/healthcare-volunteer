require("dotenv").config({ path: __dirname + "/.env" });

const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin exists
    const existing = await User.findOne({ role: "admin" });

    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      phone: "9999999999",
      role: "admin",
    });

    console.log("✅ Admin created:", admin.email);
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedAdmin();