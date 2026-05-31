const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Bid = require("../models/Bid");
const Project = require("../models/Project");
const { verifyToken, isClient } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

const rawKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_SvziKJI51wOz7b";
const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "9JN7OhTkd5lRtznP4btavz6J";

const keyId = typeof rawKeyId === "string" ? rawKeyId.trim().replace(/[\r\n\t]/g, "") : "rzp_test_SvziKJI51wOz7b";
const keySecret = typeof rawKeySecret === "string" ? rawKeySecret.trim().replace(/[\r\n\t]/g, "") : "9JN7OhTkd5lRtznP4btavz6J";

// Initialize Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Create Razorpay Order (24% Advance Payment)
router.post("/create-order", verifyToken, isClient, async (req, res) => {
  const { bidId } = req.body;
  try {
    const bid = await Bid.findById(bidId).populate("project");
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Bid is no longer pending" });
    }

    const project = await Project.findById(bid.project._id);
    if (!project || project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this bid" });
    }

    // Calculate 24% advance payment
    const rawAdvance = bid.amount * 0.24;
    // Round to 2 decimal places to avoid floating point issues
    const advanceAmount = Math.round(rawAdvance * 100) / 100;
    // Razorpay accepts amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(advanceAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_bid_${bid._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      advanceAmount,
      bidId,
      keyId: keyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment and Complete Bid Acceptance
router.post("/verify-payment", verifyToken, isClient, async (req, res) => {
  const { bidId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  try {
    // Use sanitized keySecret
    const currentKeySecret = keySecret;

    // Verify cryptographic signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // Capture payment and finalize bid acceptance
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Bid is no longer pending" });
    }

    const project = await Project.findById(bid.project);
    if (!project || project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this bid" });
    }

    // Calculate 24% advance to update earnings & spent
    const rawAdvance = bid.amount * 0.24;
    const advanceAmount = Math.round(rawAdvance * 100) / 100;

    // Accept selected bid, reject all other pending bids for this project
    bid.status = "accepted";
    project.selectedBid = bid._id;
    project.status = "in-progress";

    await bid.save();
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id }, status: "pending" },
      { status: "rejected" }
    );
    await project.save();

    // 1. Update Student's total earnings
    const student = await User.findById(bid.bidder);
    if (student) {
      student.totalEarnings += advanceAmount;
      await student.save();
    }

    // 2. Update Client's total spent
    const client = await User.findById(req.user._id);
    if (client) {
      client.totalSpent += advanceAmount;
      await client.save();
    }

    // 3. Send Notification to Student
    await Notification.create({
      recipient: bid.bidder,
      sender: req.user._id,
      type: "bid_accepted",
      message: `${req.user.name} accepted your bid and paid a 24% advance of $${advanceAmount} for your project "${project.title}".`,
      project: project._id,
    });

    res.json({
      message: "Payment verified and project started successfully!",
      bidStatus: bid.status,
      projectStatus: project.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
