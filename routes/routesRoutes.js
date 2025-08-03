const { connectToDatabase } = require('../utils/mongoClient');

exports.getRouteByName = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const rawInput = req.params.name || '';
    const inputName = rawInput.trim().toLowerCase();

    console.log('📥 Received route lookup:', rawInput);
    console.log('🔍 Cleaned route name:', inputName);

    // 1️⃣ Try exact match (case-insensitive)
    const exactMatch = await db.collection('routes').findOne({
      name: { $regex: new RegExp(`^${inputName}$`, 'i') }
    });

    if (exactMatch) {
      console.log('✅ Exact route match found:', exactMatch.name);
      return res.json(exactMatch);
    }

    // 2️⃣ Fallback to flexible keyword-based match
    const [startKey, endKey] = inputName.split(' to ').map(k => k.trim());

    if (!startKey || !endKey) {
      console.warn('❌ Invalid format: Could not extract start or end keyword.');
      return res.status(400).json({ error: 'Invalid route format' });
    }

    console.log('🔎 Fuzzy matching with:', startKey, '→', endKey);

    const fuzzyMatch = await db.collection('routes').findOne({
      name: {
        $regex: new RegExp(`${startKey}.*to.*${endKey}`, 'i')
      }
    });

    if (fuzzyMatch) {
      console.log('✅ Fuzzy route match found:', fuzzyMatch.name);
      return res.json(fuzzyMatch);
    }

    console.warn('❌ No route matched at all.');
    res.status(404).json({ error: 'No matching route found' });

  } catch (err) {
    console.error('❌ Route lookup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
