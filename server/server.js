const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, dbStatus } = require("./config/db");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const bidRoutes = require("./routes/bids");
const milestoneRoutes = require("./routes/milestones");
const userRoutes = require("./routes/users");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Middleware to ensure DB is connected before routing any API requests
app.use("/api", (req, res, next) => {
  if (!dbStatus.connected) {
    return res.status(503).json({
      message: "Database is not connected. Please verify connection credentials and network access.",
      error: dbStatus.error,
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Freelance Bid Portal API is running",
    database: dbStatus.connected ? "connected" : "disconnected",
    error: dbStatus.error || null,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
