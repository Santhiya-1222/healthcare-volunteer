const User = require("../models/User");
const { generateOtp, sendOtp } = require("../utils/sendOtp");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, address, latitude, longitude } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or phone already registered." });
    }

    const validRoles = ["user", "volunteer"];
    const userRole = validRoles.includes(role) ? role : "user";

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: userRole,
      address: address || "",
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      isVerified: userRole === "user",
    });

    res.status(201).json({
      message: `Registration successful.${userRole === "volunteer" ? " Awaiting admin verification." : ""}`,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "Phone number not registered." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateModifiedOnly: true });

    await sendOtp(phone, otp);

    const response = { message: "OTP sent successfully.", phone };
    if (process.env.NODE_ENV !== "production") {
      response.otp = otp;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      phone,
      otp,
      otpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired OTP." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Account has been blocked." });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateModifiedOnly: true });

    // Create session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
