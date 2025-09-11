// api/buildings.js
const { connectToDatabase } = require('../db'); // your module

module.exports = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const buildings = await db.collection('buildings').find({}).toArray();
    res.status(200).json(buildings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
