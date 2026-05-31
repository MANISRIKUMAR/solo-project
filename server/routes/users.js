const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", verifyToken, upload.single("profilePhoto"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { bio, skills, portfolio, companyName, name } = req.body;
    user.name = name || user.name;
    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }
    if (user.role === "student") {
      user.bio = bio || user.bio;
      user.skills = skills ? skills.split(",").map((skill) => skill.trim()) : user.skills;
      if (portfolio) {
        user.portfolio = Array.isArray(portfolio) ? portfolio : JSON.parse(portfolio);
      }
    }
    if (user.role === "client") {
      user.companyName = companyName || user.companyName;
    }
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
