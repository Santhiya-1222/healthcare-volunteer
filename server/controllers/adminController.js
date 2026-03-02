const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");
const Notification = require("../models/Notification");

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalVolunteers, pendingVolunteers, totalRequests, activeRequests, completedRequests, emergencyRequests] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "volunteer", isVerified: false, isBlocked: false }),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: { $in: ["pending", "accepted", "in_progress"] } }),
      ServiceRequest.countDocuments({ status: "completed" }),
      ServiceRequest.countDocuments({ priority: "emergency" }),
    ]);

    const recentRequests = await ServiceRequest.find()
      .populate("userId", "name")
      .populate("volunteerId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const topVolunteers = await User.find({ role: "volunteer", isVerified: true })
      .select("name trustScore avgRating completedTasks")
      .sort({ trustScore: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalVolunteers,
        pendingVolunteers,
        totalRequests,
        activeRequests,
        completedRequests,
        emergencyRequests,
      },
      recentRequests,
      topVolunteers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({
      role: "volunteer",
      isVerified: false,
      isBlocked: false,
    }).select("-password -otp -otpExpiry").sort({ createdAt: -1 });
    res.json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(404).json({ error: "Volunteer not found." });
    }

    volunteer.isVerified = true;
    await volunteer.save({ validateModifiedOnly: true });

    await Notification.create({
      recipientId: volunteer._id,
      type: "volunteer_verified",
      message: "Congratulations! Your volunteer account has been verified. You can now accept tasks.",
    });

    res.json({ message: "Volunteer verified successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.blockVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ error: "User not found." });

    volunteer.isBlocked = !volunteer.isBlocked;
    await volunteer.save({ validateModifiedOnly: true });

    res.json({
      message: volunteer.isBlocked ? "User blocked." : "User unblocked.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("userId", "name phone")
      .populate("volunteerId", "name phone")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer" })
      .select("-password -otp -otpExpiry")
      .sort({ trustScore: -1 });
    res.json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Aadhaar verification ──
exports.verifyAadhaar = async (req, res) => {
  try {
    const { status } = req.body; // "verified" | "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use 'verified' or 'rejected'." });
    }

    const volunteer = await User.findById(req.params.id);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(404).json({ error: "Volunteer not found." });
    }

    // Fetch the admin's name for audit trail
    const admin = await User.findById(req.session.userId).select("name");

    volunteer.aadhaarVerified    = status;
    volunteer.aadhaarVerifiedAt  = new Date();
    volunteer.aadhaarVerifiedBy  = admin?.name || "Admin";
    await volunteer.save({ validateModifiedOnly: true });

    await Notification.create({
      recipientId: volunteer._id,
      type: "aadhaar_verified",
      message:
        status === "verified"
          ? "Your Aadhaar document has been verified successfully by the admin."
          : "Your Aadhaar document was rejected. Please re-upload a valid, clear document.",
    });

    res.json({ message: `Aadhaar ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
