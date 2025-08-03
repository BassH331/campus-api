const { connectToDatabase } = require('../utils/mongoClient');

// GET /api/routes/:name
exports.getRouteByName = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const route = await db.collection('routes').findOne({
      name: { $regex: new RegExp(req.params.name, 'i') }
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    console.error('❌ Failed to fetch route:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
