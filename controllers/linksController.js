const { connectToDatabase } = require('../utils/mongoClient');

exports.getLinkByName = async (req, res) => {
  try {
    const { name } = req.query;
    const db = await connectToDatabase();
    const link = await db.collection('links').findOne({ name });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch link' });
  }
};