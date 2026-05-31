const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  date: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
  title: String,
  description: String,
  techStack: [String],
  link: String,
  image: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "student"], required: true },
  profilePhoto: String,
  bio: String,
  skills: [String],
  portfolio: [portfolioSchema],
  completedProjects: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviews: [reviewSchema],
  companyName: String,
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
