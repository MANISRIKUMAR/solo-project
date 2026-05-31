const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, dbStatus } = require("./config/db");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const bidRoutes = require("./routes/bids");
const milestoneRoutes = require("./routes/milestones");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payment");

dotenv.config();
connectDB();

const rawFrontendUrl = process.env.FRONTEND_URL || "*";
const frontendUrl = typeof rawFrontendUrl === "string" 
  ? rawFrontendUrl.trim().replace(/[\r\n\t]/g, "") 
  : "*";

const app = express();
app.use(cors({
  origin: frontendUrl,
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

app.post("/api/seed", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const User = require("./models/User");
    const Project = require("./models/Project");
    const Bid = require("./models/Bid");
    const Milestone = require("./models/Milestone");

    await User.deleteMany();
    await Project.deleteMany();
    await Bid.deleteMany();
    await Milestone.deleteMany();

    const password = await bcrypt.hash("Password123", 10);

    const client1 = await User.create({
      name: "Ravi Shankar",
      email: "ravi@startup.com",
      password,
      role: "client",
      companyName: "TechStartup",
      totalSpent: 0,
    });
    const client2 = await User.create({
      name: "Priya Reddy",
      email: "priya@eduplatform.com",
      password,
      role: "client",
      companyName: "EduPlatform",
      totalSpent: 0,
    });

    const student1 = await User.create({
      name: "Mani",
      email: "mani@dev.com",
      password,
      role: "student",
      bio: "Full-stack MERN developer building scalable web apps.",
      skills: ["React", "Node.js", "MongoDB"],
      completedProjects: 4,
      totalEarnings: 3200,
      averageRating: 4.8,
      reviews: [
        { clientId: client1._id, rating: 5, comment: "Delivered clean code on time." },
      ],
    });
    const student2 = await User.create({
      name: "Akhil",
      email: "akhil@ai.com",
      password,
      role: "student",
      bio: "AI/ML specialist solving real-world problems.",
      skills: ["Python", "TensorFlow", "Data Science"],
      completedProjects: 6,
      totalEarnings: 5400,
      averageRating: 4.7,
      reviews: [
        { clientId: client2._id, rating: 5, comment: "Excellent model performance." },
      ],
    });
    const student3 = await User.create({
      name: "Sneha",
      email: "sneha@design.com",
      password,
      role: "student",
      bio: "UI/UX designer with a passion for intuitive experiences.",
      skills: ["Figma", "Illustrator", "User Research"],
      completedProjects: 5,
      totalEarnings: 2800,
      averageRating: 4.9,
      reviews: [
        { clientId: client1._id, rating: 5, comment: "Beautiful designs with strong usability." },
      ],
    });

    const projects = await Project.create([
      {
        title: "Marketing Website Rebuild",
        description: "Rebuild our SaaS landing page with modern animations and responsive layouts.",
        budget: { min: 1200, max: 1800 },
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        skills: ["web", "design", "React"],
        category: "web",
        postedBy: client1._id,
      },
      {
        title: "Mobile App Prototype",
        description: "Create an app prototype for our education platform with onboarding screens.",
        budget: { min: 800, max: 1400 },
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        skills: ["mobile", "design", "Figma"],
        category: "mobile",
        postedBy: client2._id,
      },
      {
        title: "AI Chatbot Proof of Concept",
        description: "Build a chatbot backend to answer student queries using NLP and embeddings.",
        budget: { min: 1500, max: 2500 },
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        skills: ["ai/ml", "python", "nlp"],
        category: "ai/ml",
        postedBy: client1._id,
      },
      {
        title: "Data Dashboard for Sales Metrics",
        description: "Design an analytics dashboard with charts and filters for sales tracking.",
        budget: { min: 1000, max: 1600 },
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        skills: ["data", "react", "chartjs"],
        category: "data",
        postedBy: client2._id,
      },
      {
        title: "Brand Identity Refresh",
        description: "Refresh our brand identity and design new marketing collateral.",
        budget: { min: 600, max: 1200 },
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        skills: ["design", "branding", "illustration"],
        category: "design",
        postedBy: client1._id,
      },
    ]);

    const [project1, project2, project3, project4, project5] = projects;

    const bids = await Bid.create([
      {
        project: project1._id,
        bidder: student1._id,
        amount: 1500,
        deliveryDays: 12,
        proposal: "I can rebuild your landing page using React and Tailwind with smooth animations.",
      },
      {
        project: project1._id,
        bidder: student3._id,
        amount: 1400,
        deliveryDays: 14,
        proposal: "I will design and build the page with a polished UI and responsive layout.",
      },
      {
        project: project2._id,
        bidder: student3._id,
        amount: 1300,
        deliveryDays: 16,
        proposal: "I will produce a clickable prototype in Figma and user flows for your app.",
      },
      {
        project: project3._id,
        bidder: student2._id,
        amount: 2200,
        deliveryDays: 20,
        proposal: "I can develop an NLP chatbot using embeddings and a clean API design.",
      },
      {
        project: project4._id,
        bidder: student1._id,
        amount: 1450,
        deliveryDays: 11,
        proposal: "I will build the dashboard using React and chart libraries with filter support.",
      },
      {
        project: project4._id,
        bidder: student2._id,
        amount: 1550,
        deliveryDays: 12,
        proposal: "I will integrate data visualizations and responsive metrics layout.",
      },
      {
        project: project5._id,
        bidder: student3._id,
        amount: 1100,
        deliveryDays: 9,
        proposal: "I will refresh your brand and create compelling marketing assets.",
      },
      {
        project: project2._id,
        bidder: student1._id,
        amount: 1200,
        deliveryDays: 15,
        proposal: "I will design screens and deliver a prototype ready for handoff.",
      },
    ]);

    project2.status = "in-progress";
    project2.selectedBid = bids[7]._id;
    project2.totalBids = 2;
    await project2.save();

    project4.status = "in-progress";
    project4.selectedBid = bids[4]._id;
    project4.totalBids = 2;
    await project4.save();

    await Milestone.create([
      {
        project: project2._id,
        student: student1._id,
        client: client2._id,
        title: "Prototype Wireframes",
        description: "Deliver initial app wireframes and screen flow.",
        amount: 500,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        project: project2._id,
        student: student1._id,
        client: client2._id,
        title: "Final Prototype",
        description: "Deliver clickable Figma prototype for review.",
        amount: 700,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        order: 2,
      },
      {
        project: project4._id,
        student: student1._id,
        client: client2._id,
        title: "Dashboard UI Design",
        description: "Design dashboard screens with charts and filters.",
        amount: 750,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        project: project4._id,
        student: student1._id,
        client: client2._id,
        title: "Dashboard Implementation",
        description: "Build the React dashboard and integrate sample metrics.",
        amount: 700,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        order: 2,
      },
    ]);

    res.json({ message: "Seed data created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

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
