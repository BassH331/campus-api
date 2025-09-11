// api/coordinates.js
import { MongoClient } from 'mongodb';

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedDb = client.db(process.env.DB_NAME);
  return cachedDb;
}

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const { name } = req.query;

    let coordinates;
    if (name) {
      coordinates = await db.collection('coordinates').findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (!coordinates) {
        return res.status(404).json({ error: 'No coordinates found for this name' });
      }
    } else {
      // No name provided → return all
      coordinates = await db.collection('coordinates').find({}).toArray();
    }

    res.status(200).json(coordinates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
