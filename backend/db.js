import mongoose from "mongoose";

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}
