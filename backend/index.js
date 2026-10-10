import app from "./app.js";
import { connectToDatabase } from "./db.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    return res.status(500).json({ message: "Database connection failed." });
  }
}
