const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../utils/mongoClient");

// ✅ GET by name
exports.getRouteByName = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const inputName = req.params.name.toLowerCase().trim().replace(/\s+/g, " ");

    console.log("📥 Searching for route name:", inputName);

    const route = await db.collection("routes").findOne({
      name: { $regex: new RegExp(`^${inputName}$`, "i") }
    });

    if (route) {
      console.log("✅ Route match found:", route.name);
      return res.json(route);
    }

    console.warn("❌ No route found for:", inputName);
    return res.status(404).json({ error: "No matching route found" });
  } catch (err) {
    console.error("❌ Route lookup error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ GET all
exports.getAllRoutes = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const routes = await db.collection("routes").find({}).toArray();
    res.json(routes);
  } catch (err) {
    console.error("❌ Error fetching routes:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ POST (create new route)
exports.createRoute = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const newRoute = req.body;

    if (!newRoute.name || !newRoute.pathPoints) {
      return res.status(400).json({ error: "Missing fields: name, pathPoints" });
    }

    const result = await db.collection("routes").insertOne(newRoute);
    res.status(201).json({ _id: result.insertedId, ...newRoute });
  } catch (err) {
    console.error("❌ Error creating route:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ PUT (update route by id or name)
exports.updateRoute = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id, name } = req.query;

    if (!id && !name) {
      return res.status(400).json({ error: "Provide id or name to update" });
    }

    const filter = id
      ? { _id: new ObjectId(id) }
      : { name: { $regex: new RegExp(`^${name}$`, "i") } };

    const update = { $set: req.body };
    const result = await db.collection("routes").findOneAndUpdate(
      filter,
      update,
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error("❌ Error updating route:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ DELETE (by id or name)
exports.deleteRoute = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id, name } = req.query;

    if (!id && !name) {
      return res.status(400).json({ error: "Provide id or name to delete" });
    }

    const filter = id
      ? { _id: new ObjectId(id) }
      : { name: { $regex: new RegExp(`^${name}$`, "i") } };

    const result = await db.collection("routes").deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting route:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
