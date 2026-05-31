const express = require("express");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const Bid = require("../models/Bid");
const { verifyToken, isClient, isStudent } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isClient, async (req, res) => {
  const { projectId, title, description, amount, dueDate, order } = req.body;
  try {
    const project = await Project.findById(projectId).populate("selectedBid");
    if (!project || project.status !== "in-progress") {
      return res.status(400).json({ message: "Milestones can only be created for in-progress projects" });
    }
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const bid = await Bid.findById(project.selectedBid);
    if (!bid) return res.status(400).json({ message: "No selected bid found" });
    const milestone = await Milestone.create({
      project: project._id,
      student: bid.bidder,
      client: req.user._id,
      title,
      description,
      amount,
      dueDate,
      order,
    });
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:projectId", verifyToken, async (req, res) => {
  try {
    const milestones = await Milestone.find({ project: req.params.projectId })
      .sort({ order: 1 })
      .populate("student", "name profilePhoto")
      .populate("client", "name");
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const milestone = await Milestone.findById(req.params.id).populate("project");
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    const userId = req.user._id.toString();
    if (req.user.role === "student") {
      if (milestone.student.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (!["in-progress", "submitted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status update for student" });
      }
    }
    if (req.user.role === "client") {
      if (milestone.client.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (!["completed", "paid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status update for client" });
      }
      if (status === "paid") {
        const project = await Project.findById(milestone.project._id);
        if (project && project.status !== "in-progress") {
          return res.status(400).json({ message: "Project must be in-progress to pay milestone" });
        }
      }
    }
    milestone.status = status;
    await milestone.save();
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
