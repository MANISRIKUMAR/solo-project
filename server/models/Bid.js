const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  proposal: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "withdrawn"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

bidSchema.index({ project: 1, bidder: 1 }, { unique: true });

module.exports = mongoose.model("Bid", bidSchema);
