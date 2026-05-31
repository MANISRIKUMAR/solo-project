const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 1. Ensure local uploads directory exists to prevent any multer ENOENT crashes
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 2. Setup dynamic storage uploader supporting both local fallback and Cloudinary cloud storage
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    const cloudinary = require("cloudinary").v2;
    const { CloudinaryStorage } = require("multer-storage-cloudinary");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "freelance_portal_profiles",
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      },
    });
    console.log("Cloudinary Storage configured successfully!");
  } catch (cloudinaryErr) {
    console.error("Failed to initialize Cloudinary storage, falling back to disk:", cloudinaryErr);
    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, "uploads/"),
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    });
  }
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });
  console.log("Local disk storage configured (uploads directory verified).");
}

const upload = multer({ storage });

router.get("/me/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
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
      user.profilePhoto = req.file.path && req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/${req.file.filename}`;
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
