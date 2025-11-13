const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectToDatabase } = require("./utils/mongoClient");

// Routes
const buildingRoutes = require("./routes/buildingRoutes");
const coordinatesRoutes = require("./routes/coordinatesRoutes");
const linksRoutes = require("./routes/linksRoutes");
const routesRoutes = require("./routes/routesRoutes");
const uploadRoutes = require("./routes/uploads");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to inject DB
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    console.log("📦 MONGO_URI present:", !!process.env.MONGO_URI);
    console.log("📦 DB_NAME:", process.env.DB_NAME);
    next();
    console.log("📦 MONGO_URI present:", !!process.env.MONGO_URI);
    console.log("📦 DB_NAME:", process.env.DB_NAME);
  } catch (err) {
    console.log("📦 MONGO_URI present:", !!process.env.MONGO_URI);
    console.log("📦 DB_NAME:", process.env.DB_NAME);
    next(err); // let error handler catch it
  }
});

// Routes
app.use("/api/buildings", buildingRoutes);
app.use("/api/coordinates", coordinatesRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);


//So it can handle file uploads
//app.use(fileUpload());


// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({ error: err.message });
});
console.log("📦 MONGO_URI present:", !!process.env.MONGO_URI);
console.log("📦 DB_NAME:", process.env.DB_NAME);
module.exports = app;
