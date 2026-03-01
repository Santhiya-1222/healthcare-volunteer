const RecurringSchedule = require("../models/RecurringSchedule");
const User = require("../models/User");

exports.createSchedule = async (req, res) => {
  try {
    const { serviceType, medicineName, frequency, nextDueDate, volunteerId } = req.body;

    let assignedVolunteer = null;
    if (volunteerId) {
      assignedVolunteer = await User.findOne({
        _id: volunteerId,
        role: "volunteer",
        isVerified: true,
      });
    }

    const schedule = await RecurringSchedule.create({
      userId: req.user._id,
      volunteerId: assignedVolunteer?._id || null,
      serviceType,
      medicineName,
      frequency,
      nextDueDate: new Date(nextDueDate),
    });

    res.status(201).json({ message: "Recurring schedule created.", schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await RecurringSchedule.find({ userId: req.user._id })
      .populate("volunteerId", "name phone")
      .sort({ createdAt: -1 });
    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSchedule = async (req, res) => {
  try {
    const schedule = await RecurringSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found." });

    if (String(schedule.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized." });
    }

    schedule.isActive = false;
    await schedule.save();
    res.json({ message: "Schedule cancelled.", schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
