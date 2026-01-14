require("dotenv").config();
const mongoose = require("mongoose");
const env = require("../config/env");
const logger = require("../config/logger");

async function dropOldIndexes() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB");

    const db = mongoose.connection.db;
    const attendanceCollection = db.collection("attendances");

    console.log(
      "\n🔍 Checking existing indexes on attendances collection...\n"
    );

    // Get all indexes
    const indexes = await attendanceCollection.indexes();
    console.log("Current indexes:");
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old index with subjectId if it exists
    const oldIndexName = "studentId_1_subjectId_1_date_1";
    try {
      await attendanceCollection.dropIndex(oldIndexName);
      console.log(`\n✅ Successfully dropped old index: ${oldIndexName}`);
    } catch (error) {
      if (error.code === 27) {
        console.log(
          `\n⚠️  Index ${oldIndexName} does not exist (already removed)`
        );
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    console.log("\n📊 Remaining indexes:");
    const remainingIndexes = await attendanceCollection.indexes();
    remainingIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n✅ Index cleanup completed successfully!\n");
    process.exit(0);
  } catch (error) {
    logger.error("Error dropping old indexes:", error);
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

dropOldIndexes();
