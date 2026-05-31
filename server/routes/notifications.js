const express = require("express");
const Notification = require("../models/Notification");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a specific notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
