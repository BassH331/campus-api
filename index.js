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
app.use(cors());
app.use(express.json());

// Middleware to inject DB
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (err) {
    next(err); // let error handler catch it
  }
});

// Routes
app.use("/api/buildings", buildingRoutes);
app.use("/api/coordinates", coordinatesRoutes);
app.use("/api/links", linksRoutes);

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
