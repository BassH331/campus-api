// controllers/buildingsController.js
const { connectToDatabase } = require('../utils/mongoClient');
const { ObjectId } = require('mongodb');

// Get all buildings
exports.getAllBuildings = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const buildings = await db.collection('buildings').find({}).toArray();
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
};

// Get building by ID
exports.getBuildingById = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const building = await db.collection('buildings').findOne({ _id: new ObjectId(req.params.id) });
    if (!building) return res.status(404).json({ error: 'Building not found' });
    res.json(building);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch building' });
  }
};

// Create new building
exports.createBuilding = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const newBuilding = {
      name: req.body.name,
      description: req.body.description || '',
      distance: req.body.distance || '',
      contact: req.body.contact || '',
      operatingHours: req.body.operatingHours || req.body.hours || ''
    };
    const result = await db.collection('buildings').insertOne(newBuilding);
    res.status(201).json({ message: 'Building created', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create building' });
  }
};

// Update building
exports.updateBuilding = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const updatedData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.distance && { distance: req.body.distance }),
      ...(req.body.contact && { contact: req.body.contact }),
      ...(req.body.operatingHours && { operatingHours: req.body.operatingHours }),
      ...(req.body.hours && { operatingHours: req.body.hours })
    };
    const result = await db.collection('buildings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Building not found' });
    res.json({ message: 'Building updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update building' });
  }
};

// Delete building
exports.deleteBuilding = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection('buildings').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Building not found' });
    res.json({ message: 'Building deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete building' });
  }
};
