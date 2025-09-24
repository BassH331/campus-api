// routes/adminRoutes.js
const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// READ all admins
router.get("/", async (req, res) => {
  try {
    const admins = await req.db.collection("admin_users").find({}).toArray();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single admin by ID
router.get("/:id", async (req, res) => {
  try {
    const admin = await req.db.collection("admin_users").findOne({ _id: new ObjectId(req.params.id) });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new admin
router.post("/", async (req, res) => {
  try {
    const newAdmin = {
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      department: req.body.department || "Admin",
      password: req.body.password, // ⚠️ hash in production!
    };
    const result = await req.db.collection("admin_users").insertOne(newAdmin);
    res.status(201).json({ message: "Admin created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE admin
router.put("/:id", async (req, res) => {
  try {
    const updateData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.surname && { surname: req.body.surname }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.department && { department: req.body.department }),
      ...(req.body.password && { password: req.body.password }),
    };
    const result = await req.db.collection("admin_users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE admin
router.delete("/:id", async (req, res) => {
  try {
    const result = await req.db.collection("admin_users").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
