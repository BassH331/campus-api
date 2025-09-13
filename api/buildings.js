// api/buildings.js
import { MongoClient, ObjectId } from 'mongodb';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection('buildings');

  try {
    switch (req.method) {
      // GET all buildings
      case 'GET':
        if (req.query.id) {
          const building = await collection.findOne({ _id: new ObjectId(req.query.id) });
          if (!building) return res.status(404).json({ error: 'Building not found' });
          return res.status(200).json(building);
        }
        const buildings = await collection.find({}).toArray();
        return res.status(200).json(buildings);

      // POST create a new building
      case 'POST':
        const newBuilding = {
          name: req.body.name,
          description: req.body.description || '',
          distance: req.body.distance || '',
          contact: req.body.contact || '',
          operatingHours: req.body.operatingHours || req.body.hours || ''
        };
        const insertResult = await collection.insertOne(newBuilding);
        return res.status(201).json({ message: 'Building created', id: insertResult.insertedId });

      // PUT update an existing building
      case 'PUT':
        if (!req.query.id) return res.status(400).json({ error: 'ID is required for update' });
        const updateData = {
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.description && { description: req.body.description }),
          ...(req.body.distance && { distance: req.body.distance }),
          ...(req.body.contact && { contact: req.body.contact }),
          ...(req.body.operatingHours && { operatingHours: req.body.operatingHours }),
          ...(req.body.hours && { operatingHours: req.body.hours })
        };
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(req.query.id) },
          { $set: updateData }
        );
        if (updateResult.matchedCount === 0) return res.status(404).json({ error: 'Building not found' });
        return res.status(200).json({ message: 'Building updated' });

      // DELETE a building
      case 'DELETE':
        if (!req.query.id) return res.status(400).json({ error: 'ID is required for deletion' });
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(req.query.id) });
        if (deleteResult.deletedCount === 0) return res.status(404).json({ error: 'Building not found' });
        return res.status(200).json({ message: 'Building deleted' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
