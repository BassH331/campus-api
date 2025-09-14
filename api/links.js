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

    if (req.method === "GET") {
      const { name } = req.query;

      if (name) {
        const link = await db.collection("links").findOne({ name });
        if (!link) {
          return res.status(404).json({ error: "Link not found" });
        }
        return res.status(200).json(link);
      } else {
        const links = await db.collection("links").find({}).toArray();
        return res.status(200).json(links);
      }
    }

    else if (req.method === "POST") {
      const { name, imageurl } = req.body;

      if (!name || !imageurl) {
        return res.status(400).json({ error: "Name and imageurl are required" });
      }

      const result = await db.collection("links").insertOne({ name, imageurl });
      return res.status(201).json({ id: result.insertedId, name, imageurl });
    }

    else {
      return res.status(405).json({ error: "Method not allowed" });
    }

  } catch (err) {
    console.error("❌ Error in /api/links:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
