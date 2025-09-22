// api/buildings.js
import { MongoClient, ObjectId } from 'mongodb';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    cachedDb = db;
    console.log('✅ Connected to DB');
    return db;
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
    throw err;
  }
}

// Helper for error logging
const logError = (context, err, extra = {}) => {
  console.error('❌ ERROR CONTEXT:', context);
  if (Object.keys(extra).length) console.error('Extra info:', JSON.stringify(extra, null, 2));
  console.error('Stack:', err.stack || err);
};

export default async function handler(req, res) {
  const db = await connectToDatabase();

  try {
    const { method } = req;
    const { id } = req.query; // works for /api/buildings?id=xyz

    switch (method) {
      case 'GET':
        if (id) {
          // GET by ID
          if (!ObjectId.isValid(id)) {
            logError('GET /api/buildings - invalid ObjectId', null, { id });
            return res.status(400).json({ error: 'Invalid building ID', providedId: id });
          }
          const building = await db.collection('buildings').findOne({ _id: new ObjectId(id) });
          if (!building) {
            logError('GET /api/buildings - not found', null, { id });
            return res.status(404).json({ error: 'Building not found', providedId: id });
          }
          return res.status(200).json(building);
        } else {
          // GET all
          const buildings = await db.collection('buildings').find({}).toArray();
          return res.status(200).json(buildings);
        }

      case 'POST':
        // CREATE
        const newBuilding = req.body;
        const insertResult = await db.collection('buildings').insertOne(newBuilding);
        return res.status(201).json(insertResult.ops?.[0] || { ...newBuilding, _id: insertResult.insertedId });

      case 'PUT':
        // UPDATE
        if (!id || !ObjectId.isValid(id)) {
          logError('PUT /api/buildings - invalid ObjectId', null, { id, body: req.body });
          return res.status(400).json({ error: 'Invalid building ID', providedId: id });
        }
        const updatedData = req.body;
        const updateResult = await db.collection('buildings').findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updatedData },
          { returnDocument: 'after' }
        );
        if (!updateResult.value) {
          logError('PUT /api/buildings - not found', null, { id, body: updatedData });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json(updateResult.value);

      case 'DELETE':
        // DELETE
        if (!id || !ObjectId.isValid(id)) {
          logError('DELETE /api/buildings - invalid ObjectId', null, { id });
          return res.status(400).json({ error: 'Invalid building ID', providedId: id });
        }
        const deleteResult = await db.collection('buildings').deleteOne({ _id: new ObjectId(id) });
        if (deleteResult.deletedCount === 0) {
          logError('DELETE /api/buildings - not found', null, { id });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json({ message: 'Building deleted successfully', deletedId: id });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    logError('API Handler /api/buildings', err, { method: req.method, query: req.query, body: req.body });
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
