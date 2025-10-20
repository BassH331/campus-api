// controllers/buildingController.js
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../utils/mongoClient.js';

const logError = (context, err, extra = {}) => {
  console.error('❌ ERROR CONTEXT:', context);
  if (extra && Object.keys(extra).length) {
    console.error('Details:', JSON.stringify(extra, null, 2));
  }
  if (err) {
    console.error('Stack trace:', err.stack || err);
  }
};

const getIdFromReq = (req) => req.params?.id || req.query?.id || req.body?.id || null;

const buildLookup = (id) => {
  const keys = [];
  const s = id != null ? String(id) : '';

  if (s && ObjectId.isValid(s)) keys.push({ _id: new ObjectId(s) });
  if (s) {
    // Support both spellings
    keys.push({ providedId: s }, { providedid: s });
  }

  return keys.length ? { $or: keys } : null;
};

// Get all buildings
export const getAllBuildings = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const buildings = await db.collection('buildings').find({}).toArray();
    res.json(buildings);
  } catch (err) {
    logError('getAllBuildings', err);
    res.status(500).json({ error: 'Failed to fetch buildings', details: err.message });
  }
};

// Get building by ID (supports ?id= and /:id, and providedId/providedid)
export const getBuildingById = async (req, res) => {
  const id = getIdFromReq(req);
  try {
    const db = await connectToDatabase();

    const criteria = buildLookup(id);
    if (!criteria) {
      logError('getBuildingById - Invalid ID', null, { id });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const building = await db.collection('buildings').findOne(criteria);
    if (!building) {
      logError('getBuildingById - Not Found', null, { id });
      return res.status(404).json({ error: 'Building not found', providedId: id });
    }

    res.json(building);
  } catch (err) {
    logError('getBuildingById', err, { id });
    res.status(500).json({ error: 'Failed to fetch building', details: err.message });
  }
};

// Create a new building
export const createBuilding = async (req, res) => {
  const newBuilding = req.body;
  try {
    const db = await connectToDatabase();
    const result = await db.collection('buildings').insertOne(newBuilding);
    res.status(201).json({ ...newBuilding, _id: result.insertedId });
  } catch (err) {
    logError('createBuilding', err, { newBuilding });
    res.status(500).json({ error: 'Failed to create building', details: err.message });
  }
};

// Update a building (supports ?id= and /:id, resolves by _id or providedId/providedid)
export const updateBuilding = async (req, res) => {
  const id = getIdFromReq(req);
  const updatedData = req.body || {};
  try {
    const db = await connectToDatabase();

    const criteria = buildLookup(id);
    if (!criteria) {
      logError('updateBuilding - Invalid ID', null, { id, updatedData });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const result = await db.collection('buildings').findOneAndUpdate(
      criteria,
      { $set: updatedData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      logError('updateBuilding - Not Found', null, { id, updatedData });
      return res.status(404).json({ error: 'Building not found', providedId: id });
    }

    res.json(result.value);
  } catch (err) {
    logError('updateBuilding', err, { id, updatedData });
    res.status(500).json({ error: 'Failed to update building', details: err.message });
  }
};

// Delete a building (supports ?id= and /:id, resolves by _id or providedId/providedid)
export const deleteBuilding = async (req, res) => {
  const id = getIdFromReq(req);
  try {
    const db = await connectToDatabase();

    const criteria = buildLookup(id);
    if (!criteria) {
      logError('deleteBuilding - Invalid ID', null, { id });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const result = await db.collection('buildings').deleteOne(criteria);
    if (result.deletedCount === 0) {
      logError('deleteBuilding - Not Found', null, { id });
      return res.status(404).json({ error: 'Building not found', providedId: id });
    }

    res.json({ message: 'Building deleted successfully', deletedId: id });
  } catch (err) {
    logError('deleteBuilding', err, { id });
    res.status(500).json({ error: 'Failed to delete building', details: err.message });
  }
};