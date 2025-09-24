const { ObjectId } = require("mongodb");

// Centralized error handler
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const handleError = (res, err, message = "Something went wrong") => {
  console.error(err); // log details for debugging
  res.status(500).json({ error: message });
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await req.db.collection("admins").find({}).toArray();
    res.json(admins);
  } catch (err) {
    handleError(res, err, "Failed to fetch admins");
  }
};

// Get single admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await req.db
      .collection("admins")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json(admin);
  } catch (err) {
    handleError(res, err, "Failed to fetch admin");
  }
};

// Get admin by email
exports.getAdminByEmail = async (req, res) => {
  try {
    const rawEmail = req.params.email || "";
    console.log("getAdminByEmail called with:", rawEmail);

    const email = rawEmail.trim();
    if (!email) return res.status(400).json({ error: "Email required" });

    // case-insensitive exact match using anchored regex (safer than toLowerCase assumptions)
    const admin = await req.db.collection("admins").findOne({
      email: { $regex: `^${escapeRegExp(email)}$`, $options: "i" },
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json(admin);
  } catch (err) {
    handleError(res, err, "Failed to fetch admin by email");
  }
};


// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const newAdmin = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || "standard",
      createdAt: new Date()
    };

    const result = await req.db.collection("admins").insertOne(newAdmin);

    res.status(201).json({
      message: "Admin created",
      id: result.insertedId
    });
  } catch (err) {
    handleError(res, err, "Failed to create admin");
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const updatedData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.role && { role: req.body.role })
    };

    const result = await req.db.collection("admins").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Admin not found" });

    res.json({ message: "Admin updated" });
  } catch (err) {
    handleError(res, err, "Failed to update admin");
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const result = await req.db
      .collection("admins")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Admin not found" });

    res.json({ message: "Admin deleted" });
  } catch (err) {
    handleError(res, err, "Failed to delete admin");
  }
};
