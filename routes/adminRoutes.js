// routes/adminRoutes.js
const express = require("express");
const { getAllAdmins } = require("../controllers/adminController");

const router = express.Router();

// GET /api/admins -> return all admins
router.get("/", getAllAdmins);

module.exports = router;
