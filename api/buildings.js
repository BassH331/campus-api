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
  if (extra && Object.keys(extra).length) {
    console.error('Extra info:', JSON.stringify(extra, null, 2));
  }
  if (err) {
    console.error('Stack:', err.stack || err);
  } else {
    console.error('No error object provided.');
  }
};

// Flexible ID resolution helpers
const buildLookupKeys = (id) => {
  const keys = [];
  if (id && ObjectId.isValid(id)) keys.push({ _id: new ObjectId(id) });
  if (id) {
    keys.push({ providedid: id });  // lowercase variant
    keys.push({ providedId: id });  // camelCase variant
  }
  return keys;
};

const findOneByAny = async (db, id) => {
  for (const key of buildLookupKeys(id)) {
    const doc = await db.collection('buildings').findOne(key);
    if (doc) return doc;
  }
  return null;
};

const updateOneByAny = async (db, id, updatedData) => {
  for (const key of buildLookupKeys(id)) {
    await db.collection('buildings').updateOne(key, { $set: updatedData });
    const updated = await db.collection('buildings').findOne(key);
    if (updated) return updated;
  }
  return null;
};

const deleteOneByAny = async (db, id) => {
  for (const key of buildLookupKeys(id)) {
    const res = await db.collection('buildings').deleteOne(key);
    if (res.deletedCount === 1) return true;
  }
  return false;
};

export default async function handler(req, res) {
  const db = await connectToDatabase();

  try {
    const { method } = req;
    const { id } = req.query; // /api/buildings?id=xyz

    switch (method) {
      case 'GET': {
        if (id) {
          const building = await findOneByAny(db, id);
          if (!building) {
            logError('GET /api/buildings - not found', null, { id });
            return res.status(404).json({ error: 'Building not found', providedId: id });
          }
          return res.status(200).json(building);
        }
        const buildings = await db.collection('buildings').find({}).toArray();
        return res.status(200).json(buildings);
      }

      case 'POST': {
        const newBuilding = req.body;
        const insertResult = await db.collection('buildings').insertOne(newBuilding);
        return res
          .status(201)
          .json(insertResult.ops?.[0] || { ...newBuilding, _id: insertResult.insertedId });
      }

      case 'PUT': {
        if (!id) {
          logError('PUT /api/buildings - missing id', null, { body: req.body });
          return res.status(400).json({ error: 'Missing building ID', providedId: id });
        }
        await updateOneByAny(db, id, req.body);
        const after = await findOneByAny(db, id);
        if (!after) {
          logError('PUT /api/buildings - not found after update', null, { id, body: req.body });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json(after);
      }

      case 'DELETE': {
        if (!id) {
          logError('DELETE /api/buildings - missing id');
          return res.status(400).json({ error: 'Missing building ID', providedId: id });
        }
        const deleted = await deleteOneByAny(db, id);
        if (!deleted) {
          logError('DELETE /api/buildings - not found', null, { id });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json({ message: 'Building deleted successfully', deletedId: id });
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (err) {
    logError('API Handler /api/buildings', err, { method: req.method, query: req.query, body: req.body });
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}