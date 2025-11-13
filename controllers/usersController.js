const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../utils/mongoClient');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  if (rest._id instanceof ObjectId) {
    rest._id = rest._id.toString();
  }
  return rest;
};

const buildFilter = (query = {}) => {
  const filter = {};
  if (query.email) {
    filter.email = query.email.trim().toLowerCase();
  }
  if (query.studentNumber) {
    filter.studentNumber = String(query.studentNumber).trim();
  }
  if (query.userType) {
    filter.userType = query.userType.trim();
  }
  if (query.isVerified !== undefined) {
    if (query.isVerified === 'true' || query.isVerified === true) {
      filter.isVerified = true;
    } else if (query.isVerified === 'false' || query.isVerified === false) {
      filter.isVerified = false;
    }
  }
  return filter;
};

exports.listUsers = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const filter = buildFilter(req.query);
    const users = await usersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(users.map(sanitizeUser));
  } catch (err) {
    console.error('❌ Failed to list users:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('❌ Failed to fetch user by ID:', err);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};
