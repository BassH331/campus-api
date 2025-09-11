// api/routes.js
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
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Query parameter 'name' is required" });
    }

    const db = await connectToDatabase();
    const route = await db.collection("routes").findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });

    if (!route) {
      return res.status(404).json({ error: "Route not found" })};

    res.status(200).json(route);
  } catch (err) {
    console.error("❌ Error fetching route:", err);
    res.status(500).json({ error: "Internal Server Error, fix this ish!!" });
  }
}