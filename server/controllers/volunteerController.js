const ServiceRequest = require("../models/ServiceRequest");
const User           = require("../models/User");

exports.getMyTasks = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ volunteerId: req.user._id })
      .populate("userId", "name phone address")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNearbyVolunteers = async (req, res) => {
  try {
    const { lat, lon, distance = 10000 } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon query params are required." });
    }

    const volunteers = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
          distanceField: "distanceMeters",
          maxDistance: parseFloat(distance),
          spherical: true,
          query: { role: "volunteer", isVerified: true, isBlocked: false },
        },
      },
      { $limit: 20 },
      {
        $project: {
          name: 1,
          trustScore: 1,
          avgRating: 1,
          completedTasks: 1,
          distanceMeters: 1,
          location: 1,
        },
      },
    ]);

    res.json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const totalTasks = await ServiceRequest.countDocuments({ volunteerId: req.user._id });
    const completedTasks = await ServiceRequest.countDocuments({
      volunteerId: req.user._id,
      status: "completed",
    });
    const activeTasks = await ServiceRequest.countDocuments({
      volunteerId: req.user._id,
      status: { $in: ["accepted", "in_progress"] },
    });

    res.json({
      profile: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        trustScore: req.user.trustScore,
        avgRating: req.user.avgRating,
        completedTasks: req.user.completedTasks,
        cancelledTasks: req.user.cancelledTasks,
        isVerified: req.user.isVerified,
        totalTasks,
        completedTasks: completedTasks,
        activeTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
