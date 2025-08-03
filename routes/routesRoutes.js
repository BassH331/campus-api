const { connectToDatabase } = require('../utils/mongoClient');

exports.getRouteByName = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const inputName = req.params.name.toLowerCase();

    // 1️⃣ Try exact match first
    const exactMatch = await db.collection('routes').findOne({
      name: { $regex: new RegExp(`^${inputName}$`, 'i') }
    });

    if (exactMatch) return res.json(exactMatch);

    // 2️⃣ Fallback to flexible keyword-based match
    const [startKey, endKey] = inputName.split(' to ').map(k => k.trim());

    const fuzzyMatch = await db.collection('routes').findOne({
      name: {
        $regex: new RegExp(`${startKey}.*to.*${endKey}`, 'i')
      }
    });

    if (fuzzyMatch) return res.json(fuzzyMatch);

    res.status(404).json({ error: 'No matching route found' });
  } catch (err) {
    console.error('❌ Route lookup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
