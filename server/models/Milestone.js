const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "in-progress", "submitted", "completed", "paid"],
    default: "pending",
  },
  order: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("Milestone", milestoneSchema);
