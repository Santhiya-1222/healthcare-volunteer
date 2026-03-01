require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin",
      email: "admin@healthcare.com",
      phone: "9999999999",
      password: "admin123",
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Phone:", admin.phone);
    console.log("Password: admin123");
    console.log("\nUse phone 9999999999 to login with OTP.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
