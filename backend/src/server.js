const path = require("path");

// Local only: load ../../.env. Must run before anything requires ./config/env.
// Vercel injects env vars itself, and a missing file is harmless.
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });