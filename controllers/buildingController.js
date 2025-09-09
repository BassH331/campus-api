// controllers/buildingsController.js
const { connectToDatabase } = require('../utils/mongoClient');

exports.getAllBuildings = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const buildings = await db.collection('buildings').find({}).toArray();
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
};
