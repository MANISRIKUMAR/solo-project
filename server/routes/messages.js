const express = require("express");
const Message = require("../models/Message");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get message history for a specific project and chat partner
router.get("/project/:projectId", verifyToken, async (req, res) => {
  const { partnerId } = req.query;
  const { projectId } = req.params;
  try {
    if (!partnerId) {
      return res.status(400).json({ message: "partnerId is required" });
    }
    // Find all messages exchanged between req.user._id and partnerId in the context of this project
    const messages = await Message.find({
      project: projectId,
      $or: [
        { sender: req.user._id, recipient: partnerId },
        { sender: partnerId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/", verifyToken, async (req, res) => {
  const { projectId, recipientId, text } = req.body;
  try {
    if (!projectId || !recipientId || !text) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      recipient: recipientId,
      text,
    });

    // Send a push notification on our platform bell system
    const project = await Project.findById(projectId);
    const projectName = project ? project.title : "Project";
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: "chat_message",
      message: `${req.user.name} sent you a message in "${projectName}": "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`,
      project: projectId,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
