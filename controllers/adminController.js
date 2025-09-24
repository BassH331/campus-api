const { ObjectId } = require("mongodb");

// controllers/adminController.js
// Simple controller: just return all admins

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await req.db.collection("admins").find({}).toArray();
    res.json(admins); // send full array of admins
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

