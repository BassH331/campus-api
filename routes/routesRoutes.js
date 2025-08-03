const { connectToDatabase } = require('../utils/mongoClient');

exports.getRouteByName = async (req, res) => {
  try {
    const db = await connectToDatabase();
    
    // Normalize input name: lowercase, trimmed, and replace double spaces
    const inputName = req.params.name.toLowerCase().trim().replace(/\s+/g, ' ');

    // Log what's being received
    console.log("📥 Searching for route name:", inputName);

    // Try exact match with sanitized name
    const route = await db.collection('routes').findOne({
      name: { $regex: new RegExp(`^${inputName}$`, 'i') }
    });

    if (route) {
      console.log("✅ Route match found:", route.name);
      return res.json(route);
    }

    console.warn("❌ No route found for:", inputName);
    res.status(404).json({ error: 'No matching route found' });
    
  } catch (err) {
    console.error('❌ Route lookup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
