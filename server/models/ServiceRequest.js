const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    serviceType: {
      type: String,
      enum: ["medicine", "hospital", "grocery", "emergency", "daily_care"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    priorityWeight: { type: Number, default: 1 },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    address: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    isRecurring: { type: Boolean, default: false },
    recurringScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringSchedule",
      default: null,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ location: "2dsphere" });
serviceRequestSchema.index({ priorityWeight: -1, createdAt: 1 });

serviceRequestSchema.pre("save", function (next) {
  const weights = { normal: 1, urgent: 2, emergency: 3 };
  this.priorityWeight = weights[this.priority] || 1;
  next();
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
