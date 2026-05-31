const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  deadline: { type: Date, required: true },
  skills: [String],
  category: {
    type: String,
    enum: ["web", "mobile", "ai/ml", "design", "data", "other"],
    default: "other",
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["open", "in-progress", "completed", "cancelled"],
    default: "open",
  },
  selectedBid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
  totalBids: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
