const cron = require("node-cron");
const RecurringSchedule = require("../models/RecurringSchedule");
const ServiceRequest = require("../models/ServiceRequest");
const Notification = require("../models/Notification");

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  try {
    console.log("[CRON] Checking recurring schedules...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const dueSchedules = await RecurringSchedule.find({
      isActive: true,
      nextDueDate: { $lte: tomorrow },
    }).populate("userId volunteerId");

    for (const schedule of dueSchedules) {
      // Send reminder notification to volunteer
      if (schedule.volunteerId) {
        await Notification.create({
          recipientId: schedule.volunteerId._id,
          type: "recurring_reminder",
          message: `Reminder: Deliver ${schedule.medicineName} for ${schedule.userId.name} by ${schedule.nextDueDate.toLocaleDateString()}.`,
        });
      }

      // Auto-create service request if due today or overdue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(schedule.nextDueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate <= today) {
        await ServiceRequest.create({
          userId: schedule.userId._id,
          volunteerId: schedule.volunteerId?._id || null,
          serviceType: schedule.serviceType,
          priority: "normal",
          description: `Recurring: ${schedule.medicineName}`,
          location: schedule.userId.location,
          address: schedule.userId.address,
          isRecurring: true,
          recurringScheduleId: schedule._id,
          status: schedule.volunteerId ? "accepted" : "pending",
        });

        // Calculate next due date
        const next = new Date(schedule.nextDueDate);
        if (schedule.frequency === "monthly") next.setMonth(next.getMonth() + 1);
        if (schedule.frequency === "weekly") next.setDate(next.getDate() + 7);
        schedule.nextDueDate = next;
        await schedule.save();

        console.log(`[CRON] Created recurring request for ${schedule.userId.name} - ${schedule.medicineName}`);
      }
    }
  } catch (error) {
    console.error("[CRON] Recurring scheduler error:", error.message);
  }
});

console.log("[CRON] Recurring scheduler initialized (runs daily at 8:00 AM)");
