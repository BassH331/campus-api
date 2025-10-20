// api/buildings/[id].js
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

// Flexible ID resolution helpers shared with /api/buildings
const buildLookupKeys = (id) => {
  const keys = [];
  const s = id != null ? String(id) : '';
  if (s && ObjectId.isValid(s)) keys.push({ _id: new ObjectId(s) });
  if (s) {
    keys.push({ providedid: s });  // lowercase variant
    keys.push({ providedId: s });  // camelCase variant
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
    const res = await db.collection('buildings').findOneAndUpdate(
      key,
      { $set: updatedData },
      { returnDocument: 'after' }
    );
    if (res && res.value) return res.value;
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
    const { id } = req.query; // dynamic path param /api/buildings/:id

    switch (method) {
      case 'GET': {
        const building = await findOneByAny(db, id);
        if (!building) {
          logError('GET /api/buildings/:id - not found', null, { id });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json(building);
      }

      case 'PUT': {
        const updated = await updateOneByAny(db, id, req.body);
        if (!updated) {
          logError('PUT /api/buildings/:id - not found', null, { id, body: req.body });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const deleted = await deleteOneByAny(db, id);
        if (!deleted) {
          logError('DELETE /api/buildings/:id - not found', null, { id });
          return res.status(404).json({ error: 'Building not found', providedId: id });
        }
        return res.status(200).json({ message: 'Building deleted successfully', deletedId: id });
      }

      default: {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (err) {
    logError('API Handler /api/buildings/:id', err, { method: req.method, query: req.query, body: req.body });
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}