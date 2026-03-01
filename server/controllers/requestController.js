const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const calculateTrustScore = require("../utils/trustScore");

exports.createRequest = async (req, res) => {
  try {
    const { serviceType, priority, description, address, latitude, longitude } = req.body;

    const request = await ServiceRequest.create({
      userId: req.user._id,
      serviceType,
      priority: priority || "normal",
      description,
      address: address || req.user.address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || req.user.location.coordinates[0], parseFloat(latitude) || req.user.location.coordinates[1]],
      },
    });

    // Notify nearby volunteers for emergency requests
    if (priority === "emergency") {
      const nearbyVolunteers = await User.find({
        role: "volunteer",
        isVerified: true,
        isBlocked: false,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: request.location.coordinates },
            $maxDistance: 10000,
          },
        },
      }).limit(20);

      const notifications = nearbyVolunteers.map((v) => ({
        recipientId: v._id,
        type: "emergency",
        message: `EMERGENCY: ${req.user.name} needs ${serviceType} assistance urgently!`,
        relatedRequestId: request._id,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ message: "Request created successfully.", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.user._id })
      .populate("volunteerId", "name phone trustScore avgRating")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNearbyRequests = async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({ error: "Account not yet verified by admin." });
    }

    const maxDistance = parseInt(req.query.distance) || 5000;
    const coords = req.user.location.coordinates;

    let query = {
      status: "pending",
      volunteerId: null,
    };

    // Only use $near if coordinates are set
    if (coords[0] !== 0 || coords[1] !== 0) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: maxDistance,
        },
      };
    }

    const requests = await ServiceRequest.find(query)
      .populate("userId", "name phone address")
      .sort({ priorityWeight: -1, createdAt: 1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request is no longer available." });
    }

    request.volunteerId = req.user._id;
    request.status = "accepted";
    await request.save();

    await Notification.create({
      recipientId: request.userId,
      type: "task_accepted",
      message: `${req.user.name} has accepted your ${request.serviceType} request.`,
      relatedRequestId: request._id,
    });

    res.json({ message: "Request accepted.", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found." });

    if (String(request.volunteerId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized for this request." });
    }

    const validTransitions = {
      accepted: ["in_progress", "cancelled"],
      in_progress: ["completed"],
    };

    if (!validTransitions[request.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot change from ${request.status} to ${status}.` });
    }

    request.status = status;
    if (status === "completed") {
      request.completedAt = new Date();

      // Update volunteer stats
      const volunteer = await User.findById(req.user._id);
      volunteer.completedTasks += 1;
      volunteer.trustScore = calculateTrustScore(volunteer);
      await volunteer.save({ validateModifiedOnly: true });
    }

    if (status === "cancelled") {
      const volunteer = await User.findById(req.user._id);
      volunteer.cancelledTasks += 1;
      volunteer.trustScore = calculateTrustScore(volunteer);
      await volunteer.save({ validateModifiedOnly: true });
      request.volunteerId = null;
      request.status = "pending";
    }

    await request.save();

    await Notification.create({
      recipientId: request.userId,
      type: "status_update",
      message: `Your ${request.serviceType} request status updated to: ${status}.`,
      relatedRequestId: request._id,
    });

    res.json({ message: "Status updated.", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found." });

    if (String(request.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized." });
    }
    if (request.status !== "completed") {
      return res.status(400).json({ error: "Can only give feedback for completed requests." });
    }
    if (request.feedback?.rating) {
      return res.status(400).json({ error: "Feedback already submitted." });
    }

    request.feedback = { rating: parseInt(rating), comment: comment || "" };
    await request.save();

    // Update volunteer rating
    const volunteer = await User.findById(request.volunteerId);
    if (volunteer) {
      const newTotal = volunteer.totalRatings + 1;
      volunteer.avgRating =
        (volunteer.avgRating * volunteer.totalRatings + parseInt(rating)) / newTotal;
      volunteer.totalRatings = newTotal;
      volunteer.trustScore = calculateTrustScore(volunteer);
      await volunteer.save({ validateModifiedOnly: true });

      await Notification.create({
        recipientId: volunteer._id,
        type: "feedback_received",
        message: `You received a ${rating}-star rating for ${request.serviceType} service.`,
        relatedRequestId: request._id,
      });
    }

    res.json({ message: "Feedback submitted.", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("userId", "name phone address")
      .populate("volunteerId", "name phone trustScore avgRating");
    if (!request) return res.status(404).json({ error: "Request not found." });
    res.json({ request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
