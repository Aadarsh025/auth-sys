require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

async function start() {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`Gatehouse running at http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Failed to start Gatehouse:", error.message);
  process.exit(1);
});