require("dotenv").config();
const mongoose = require("mongoose");
const env = require("../config/env");
const logger = require("../config/logger");

async function cleanDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB");

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    console.log("\n🗑️  Cleaning database...\n");

    // Drop all collections
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`✅ Cleared collection: ${collection.collectionName}`);
    }

    console.log("\n✅ Database cleaned successfully!\n");
    process.exit(0);
  } catch (error) {
    logger.error("Error cleaning database:", error);
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanDatabase();
