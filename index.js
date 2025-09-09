const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Routes
const buildingRoutes = require("./routes/buildingRoutes");
const coordinatesRoutes = require("./routes/coordinatesRoutes");
const linksRoutes = require("./routes/linksRoutes");
const routesRoutes = require("./routes/routesRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
async function connectDB() {
  if (db) return db;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log("✅ Connected to MongoDB");
  return db;
}

// Middleware to inject DB
app.use(async (req, res, next) => {
  req.db = await connectDB();
  next();
});

// Routes
app.use("/api/buildings", buildingRoutes);
app.use("/api/coordinates", coordinatesRoutes);
app.use("/api/links", linksRoutes);


module.exports = app; // exported for Vercel
