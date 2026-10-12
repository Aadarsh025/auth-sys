const mongoose = require("mongoose");
const env = require("./env");

const cached = global.mongooseConn || (global.mongooseConn = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = env.mongoUri || process.env.MONGO_URI;
    if (!uri) throw new Error("MongoDB connection string is missing (MONGO_URI).");

    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow a retry on the next request
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;