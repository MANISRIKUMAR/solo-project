const express = require("express");
const Project = require("../models/Project");
const Bid = require("../models/Bid");
const { verifyToken, isClient } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, isClient, async (req, res) => {
  const { title, description, budget, deadline, skills, category } = req.body;
  try {
    if (!budget || Number(budget.min) <= 0 || Number(budget.max) <= 0) {
      return res.status(400).json({ message: "Budget values must be greater than $0" });
    }
    if (Number(budget.min) > Number(budget.max)) {
      return res.status(400).json({ message: "Min budget cannot be greater than max budget" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    if (!deadline || isNaN(deadlineDate) || deadlineDate < today) {
      return res.status(400).json({ message: "Deadline must be today or a future date" });
    }
    const twoYearsFromNow = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    if (deadlineDate > twoYearsFromNow) {
      return res.status(400).json({ message: "Deadline cannot be more than 2 years in the future" });
    }
    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      skills,
      category,
      postedBy: req.user._id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my", verifyToken, isClient, async (req, res) => {
  try {
    const projects = await Project.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", verifyToken, isClient, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const hasBids = await Bid.exists({ project: project._id });
    if (hasBids) {
      return res.status(400).json({ message: "Cannot edit project after bids are received" });
    }
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, isClient, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const hasBids = await Bid.exists({ project: project._id });
    if (hasBids) {
      return res.status(400).json({ message: "Cannot delete project after bids are received" });
    }
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  const { category, minBudget, maxBudget, deadline, search } = req.query;
  const filter = { status: "open" };
  if (category) filter.category = category;
  if (deadline) filter.deadline = { $lte: new Date(deadline) };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }
  if (minBudget || maxBudget) {
    filter.$and = [];
    if (minBudget) filter.$and.push({ "budget.max": { $gte: Number(minBudget) } });
    if (maxBudget) filter.$and.push({ "budget.min": { $lte: Number(maxBudget) } });
  }
  try {
    const projects = await Project.find(filter).populate("postedBy", "name companyName").sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("postedBy", "name companyName email")
      .populate({ path: "selectedBid", populate: { path: "bidder", select: "name email profilePhoto" } });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
