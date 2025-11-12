const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../utils/mongoClient');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCK_TIME_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || '15', 10);
const LOCK_TIME_MS = LOCK_TIME_MINUTES * 60 * 1000;

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  if (rest._id instanceof ObjectId) {
    rest._id = rest._id.toString();
  }
  return rest;
};

const unlockIfExpired = async (collection, user) => {
  if (!user.accountLocked) return user;
  if (!user.lockUntil || user.lockUntil <= new Date()) {
    const result = await collection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          accountLocked: false,
          lockUntil: null,
          loginAttempts: 0,
        },
      },
      { returnDocument: 'after' }
    );
    return result.value || user;
  }
  return user;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const freshUser = await unlockIfExpired(usersCollection, user);

    if (freshUser.accountLocked) {
      return res.status(423).json({
        error: 'Account locked due to multiple failed login attempts. Try again later.',
        lockUntil: freshUser.lockUntil,
      });
    }

    const passwordMatches = await bcrypt.compare(password, freshUser.password || '');

    if (!passwordMatches) {
      const updates = {
        $inc: { loginAttempts: 1 },
        $set: {},
      };

      const upcomingAttempts = (freshUser.loginAttempts || 0) + 1;

      if (upcomingAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.$set.accountLocked = true;
        updates.$set.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }

      const updatePayload = Object.keys(updates.$set).length ? updates : { $inc: updates.$inc };

      await usersCollection.updateOne({ _id: freshUser._id }, updatePayload);

      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!freshUser.isVerified) {
      return res.status(403).json({ error: 'Account is not verified.' });
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: freshUser._id },
      {
        $set: {
          lastLogin: new Date(),
          loginAttempts: 0,
          accountLocked: false,
          lockUntil: null,
        },
      },
      { returnDocument: 'after' }
    );

    return res.json({ user: sanitizeUser(result.value) });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
