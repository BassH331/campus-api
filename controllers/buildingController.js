import { ObjectId } from 'mongodb';
const { connectToDatabase } = require('../utils/mongoClient');

const logError = (context, err, extra = {}) => {
  console.error('❌ ERROR CONTEXT:', context);
  console.error('Details:', JSON.stringify(extra, null, 2));
  console.error('Stack trace:', err.stack || err);
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

// Get building by ID
export const getBuildingById = async (req, res) => {
  const id = req.params.id;
  try {
    const db = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      logError('getBuildingById - Invalid ObjectId', null, { id });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const building = await db.collection('buildings').findOne({ _id: new ObjectId(String(id)) });
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

    res.status(201).json(result.ops?.[0] || { ...newBuilding, _id: result.insertedId });
  } catch (err) {
    logError('createBuilding', err, { newBuilding });
    res.status(500).json({ error: 'Failed to create building', details: err.message });
  }
};

// Update a building
export const updateBuilding = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const db = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      logError('updateBuilding - Invalid ObjectId', null, { id, updatedData });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const result = await db.collection('buildings').findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
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

// Delete a building
export const deleteBuilding = async (req, res) => {
  const id = req.params.id;
  try {
    const db = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      logError('deleteBuilding - Invalid ObjectId', null, { id });
      return res.status(400).json({ error: 'Invalid building ID', providedId: id });
    }

    const result = await db.collection('buildings').deleteOne({ _id: new ObjectId(String(id)) });
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
