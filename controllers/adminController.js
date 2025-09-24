const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

// GET all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await req.db.collection("admin_users").find({}).toArray();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// GET admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await req.db.collection("admin_users").findOne({ _id: new ObjectId(req.params.id) });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin" });
  }
};

// CREATE new admin
exports.createAdmin = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newAdmin = {
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      department: req.body.department || "Admin",
      password: hashedPassword
    };

    const result = await req.db.collection("admin_users").insertOne(newAdmin);
    res.status(201).json({ message: "Admin created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin" });
  }
};

// UPDATE admin
exports.updateAdmin = async (req, res) => {
  try {
    const updateData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.surname && { surname: req.body.surname }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.department && { department: req.body.department }),
    };

    // Hash new password if provided
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const result = await req.db.collection("admin_users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

// DELETE admin
exports.deleteAdmin = async (req, res) => {
  try {
    const result = await req.db.collection("admin_users").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
};
