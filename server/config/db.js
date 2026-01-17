const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
    });

    isConnected = db.connections[0].readyState;
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  }
}

module.exports = connectDB;
