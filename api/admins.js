// api/admins.js
import { MongoClient, ObjectId } from "mongodb";

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection("admin_users");

  try {
    switch (req.method) {
      // GET all admins or one by ID
      case "GET":
        if (req.query.id) {
          const admin = await collection.findOne({ _id: new ObjectId(req.query.id) });
          if (!admin) return res.status(404).json({ error: "Admin not found" });
          return res.status(200).json(admin);
        }
        const admins = await collection.find({}).toArray();
        return res.status(200).json(admins);

      // POST create new admin
      case "POST":
        const newAdmin = {
          name: req.body.name,
          surname: req.body.surname,
          email: req.body.email,
          department: req.body.department || "Admin",
          password: req.body.password, // 🔒 TODO: hash password in production!
        };
        const insertResult = await collection.insertOne(newAdmin);
        return res.status(201).json({ message: "Admin created", id: insertResult.insertedId });

      // PUT update admin
      case "PUT":
        if (!req.query.id) return res.status(400).json({ error: "ID required for update" });
        const updateData = {
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.surname && { surname: req.body.surname }),
          ...(req.body.email && { email: req.body.email }),
          ...(req.body.department && { department: req.body.department }),
          ...(req.body.password && { password: req.body.password }),
        };
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(req.query.id) },
          { $set: updateData }
        );
        if (updateResult.matchedCount === 0) return res.status(404).json({ error: "Admin not found" });
        return res.status(200).json({ message: "Admin updated" });

      // DELETE admin
      case "DELETE":
        if (!req.query.id) return res.status(400).json({ error: "ID required for deletion" });
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(req.query.id) });
        if (deleteResult.deletedCount === 0) return res.status(404).json({ error: "Admin not found" });
        return res.status(200).json({ message: "Admin deleted" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error("❌ Admin API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
