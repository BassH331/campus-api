const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log('🔗 Connected to MongoDB');
  }
  return db;
}

module.exports = { connectToDatabase };