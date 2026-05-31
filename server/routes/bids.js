const express = require("express");
const Bid = require("../models/Bid");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const { verifyToken, isStudent, isClient } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isStudent, async (req, res) => {
  const { projectId, amount, deliveryDays, proposal } = req.body;
  try {
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Bid amount must be greater than $0" });
    }
    if (!deliveryDays || Number(deliveryDays) < 1 || Number(deliveryDays) > 365) {
      return res.status(400).json({ message: "Delivery days must be between 1 and 365" });
    }
    const project = await Project.findById(projectId);
    if (!project || project.status !== "open") {
      return res.status(400).json({ message: "Project is not open for bids" });
    }
    const existing = await Bid.findOne({ project: projectId, bidder: req.user._id });
    if (existing) return res.status(400).json({ message: "You already bid on this project" });
    const bid = await Bid.create({
      project: projectId,
      bidder: req.user._id,
      amount,
      deliveryDays,
      proposal,
    });
    project.totalBids += 1;
    await project.save();

    await Notification.create({
      recipient: project.postedBy,
      sender: req.user._id,
      type: "bid_placed",
      message: `${req.user.name} placed a bid of $${amount} on your project "${project.title}".`,
      project: project._id,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my", verifyToken, isStudent, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id }).populate("project", "title status budget").sort({ submittedAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/project/:id", verifyToken, isClient, async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.id })
      .populate("bidder", "name bio skills profilePhoto completedProjects averageRating")
      .sort({ submittedAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", verifyToken, isStudent, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    if (bid.bidder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Cannot edit bid after it is accepted or rejected" });
    }
    const { amount, deliveryDays, proposal } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Bid amount must be greater than $0" });
    }
    if (!deliveryDays || Number(deliveryDays) < 1 || Number(deliveryDays) > 365) {
      return res.status(400).json({ message: "Delivery days must be between 1 and 365" });
    }
    bid.amount = amount;
    bid.deliveryDays = deliveryDays;
    bid.proposal = proposal;
    await bid.save();
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, isStudent, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    if (bid.bidder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Cannot withdraw bid after decision" });
    }
    bid.status = "withdrawn";
    await bid.save();
    const project = await Project.findById(bid.project);
    if (project) {
      project.totalBids = Math.max(0, project.totalBids - 1);
      await project.save();
    }
    res.json({ message: "Bid withdrawn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/accept", verifyToken, isClient, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    const project = await Project.findById(bid.project._id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Bid is not pending" });
    }
    bid.status = "accepted";
    project.selectedBid = bid._id;
    project.status = "in-progress";
    await bid.save();
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id }, status: "pending" },
      { status: "rejected" }
    );
    await project.save();
    res.json({ bid, project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/reject", verifyToken, isClient, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    const project = await Project.findById(bid.project._id);
    if (!project || project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (bid.status !== "pending") {
      return res.status(400).json({ message: "Bid cannot be rejected" });
    }
    bid.status = "rejected";
    await bid.save();
    res.json({ bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
