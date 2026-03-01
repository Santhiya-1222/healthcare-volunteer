const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "task_accepted",
      "task_completed",
      "emergency",
      "recurring_reminder",
      "volunteer_verified",
      "status_update",
      "new_request",
      "feedback_received",
    ],
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
