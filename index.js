const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectToDatabase } = require("./utils/mongoClient");

// Routes
const buildingRoutes = require("./routes/buildingRoutes");
const coordinatesRoutes = require("./routes/coordinatesRoutes");
const linksRoutes = require("./routes/linksRoutes");
const routesRoutes = require("./routes/routesRoutes");

const app = express();

// CORS setup
app.use(cors({
  origin: "*", // or specify your frontend URL
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Handle preflight requests
app.options("*", (req, res) => res.sendStatus(204));

app.use(express.json());

// Middleware to inject DB connection
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

// API Routes
app.use("/api/buildings", buildingRoutes);
app.use("/api/coordinates", coordinatesRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/routes", routesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ status: "API is running" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({ error: err.message });
});

// Start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
