const { connectToDatabase } = require('../utils/mongoClient');

exports.getCoordinates = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { name, buildingId } = req.query;

    // Handle lookup by buildingId
    if (buildingId) {
      console.log("📍 Searching coordinates for buildingId:", buildingId);

      const doc = await db.collection('coordinates').findOne({
        buildingId: String(buildingId)
      });

      if (doc) {
        console.log("✅ Coordinates found for buildingId:", buildingId);
        return res.json(doc);
      }

      console.warn("❌ No coordinates found for buildingId:", buildingId);
      return res.status(404).json({ error: 'No coordinates found for this buildingId' });
    }

    // Handle lookup by name
    if (name) {
      const inputName = name.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log("📥 Searching coordinates for name:", inputName);

      const doc = await db.collection('coordinates').findOne({
        name: { $regex: new RegExp(`^${inputName}$`, 'i') }
      });

      if (doc) {
        console.log("✅ Coordinates found for name:", doc.name);
        return res.json(doc);
      }

      console.warn("❌ No coordinates found for name:", inputName);
      return res.status(404).json({ error: 'No coordinates found for this name' });
    }

    // If no query params provided — return all
    console.log("📦 Fetching all coordinates...");
    const list = await db.collection('coordinates').find({}).toArray();
    res.json(list);

  } catch (err) {
    console.error('❌ Coordinates lookup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
