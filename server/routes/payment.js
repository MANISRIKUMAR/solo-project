const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Bid = require("../models/Bid");
const Project = require("../models/Project");
const { verifyToken, isClient } = require("../middleware/authMiddleware");

const router = express.Router();

// Initialize Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SvziKJI51wOz7b",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "9JN7OhTkd5lRtznP4btavz6J",
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
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SvziKJI51wOz7b",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment and Complete Bid Acceptance
router.post("/verify-payment", verifyToken, isClient, async (req, res) => {
  const { bidId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "9JN7OhTkd5lRtznP4btavz6J";

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
