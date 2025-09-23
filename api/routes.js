import { connectToDatabase } from "../utils/mongoClient";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("routes");

    switch (req.method) {
      // ✅ GET → fetch all or one route
      case "GET": {
        const { name } = req.query;

        if (name) {
          const route = await collection.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") }
          });

          if (!route) {
            return res.status(404).json({ error: "Route not found" });
          }
          return res.status(200).json(route);
        }

        const routes = await collection.find({}).toArray();
        return res.status(200).json(routes);
      }

      // ✅ POST → create a new route
      case "POST": {
        const newRoute = req.body;
        if (!newRoute.name || !newRoute.pathPoints) {
          return res.status(400).json({ error: "Missing fields: name, pathPoints" });
        }

        const result = await collection.insertOne(newRoute);
        return res.status(201).json({ _id: result.insertedId, ...newRoute });
      }

      // ✅ PUT → update a route (by id or name)
      case "PUT": {
        const { id, name } = req.query;
        if (!id && !name) {
          return res.status(400).json({ error: "Provide route id or name to update" });
        }

        const filter = id
          ? { _id: new ObjectId(id) }
          : { name: { $regex: new RegExp(`^${name}$`, "i") } };

        const update = { $set: req.body };
        const result = await collection.findOneAndUpdate(filter, update, { returnDocument: "after" });

        if (!result.value) {
          return res.status(404).json({ error: "Route not found" });
        }

        return res.status(200).json(result.value);
      }

      // ✅ DELETE → remove a route
      case "DELETE": {
        const { id, name } = req.query;
        if (!id && !name) {
          return res.status(400).json({ error: "Provide route id or name to delete" });
        }

        const filter = id
          ? { _id: new ObjectId(id) }
          : { name: { $regex: new RegExp(`^${name}$`, "i") } };

        const result = await collection.deleteOne(filter);
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Route not found" });
        }

        return res.status(200).json({ message: "Route deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("❌ Routes API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
