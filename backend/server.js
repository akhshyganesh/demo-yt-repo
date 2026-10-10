import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./db.js";

const port = process.env.PORT || 5000;

try {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Todo API listening on port ${port}`);
  });
} catch (error) {
  console.error("Unable to start the API:", error);
  process.exitCode = 1;
}
