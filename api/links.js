// api/links.js
import { MongoClient } from "mongodb";

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedDb = client.db(process.env.DB_NAME);
  return cachedDb;
}

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const { name } = req.query;

    let link;
    if (name) {
      link = await db.collection("links").findOne({ name });
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }
    } else {
      link = await db.collection("links").find({}).toArray(); // return all links
    }

    res.status(200).json(link);
  } catch (err) {
    console.error("❌ Error fetching link:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
