const { connectToDatabase } = require('../utils/mongoClient');

exports.getCoordinatesByName = async (req, res) => {
  try {
    const { name } = req.query;
    console.log("[📥 Incoming Request] name:", name);

    if (!name) {
      return res.status(400).json({ error: "Query parameter 'name' is required" });
    }

    const db = await connectToDatabase();

    const coordinates = await db.collection('coordinates').findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }  // Case-insensitive exact match
    });

    if (!coordinates) {
      console.log("[❌ Not Found] No coordinates for:", name);
      return res.status(404).json({ error: 'No coordinates found for this name' });
    }

    console.log("[✅ Found] Coordinates:", coordinates);
    res.json(coordinates);
  } catch (err) {
    console.error("[💥 Error] Fetch failed:", err);
    res.status(500).json({ error: 'Failed to fetch coordinates' });
  }
};
