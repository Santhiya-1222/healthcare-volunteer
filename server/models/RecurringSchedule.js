const mongoose = require("mongoose");

const recurringScheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    serviceType: {
      type: String,
      enum: ["medicine", "grocery"],
      required: true,
    },
    medicineName: { type: String, required: true },
    frequency: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    nextDueDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecurringSchedule", recurringScheduleSchema);
