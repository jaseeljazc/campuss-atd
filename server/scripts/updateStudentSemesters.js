require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const env = require("../config/env");
const logger = require("../config/logger");

// Mapping of student emails to their semesters (from the seed data)
const studentSemesters = {
  // Semester 1
  "aarav.sharma@student.com": 1,
  "priya.patel@student.com": 1,
  "rohit.kumar@student.com": 1,
  "ananya.reddy@student.com": 1,
  "vikram.singh@student.com": 1,

  // Semester 2
  "sneha.gupta@student.com": 2,
  "arjun.nair@student.com": 2,
  "kavya.iyer@student.com": 2,
  "siddharth.mehta@student.com": 2,
  "riya.agarwal@student.com": 2,

  // Semester 3
  "rahul.verma@student.com": 3,
  "meera.joshi@student.com": 3,
  "aditya.rao@student.com": 3,
  "ishita.malhotra@student.com": 3,
  "varun.kapoor@student.com": 3,
  "anjali.deshmukh@student.com": 3,

  // Semester 4
  "karan.thakur@student.com": 4,
  "pooja.shah@student.com": 4,
  "rohan.bhatia@student.com": 4,
  "divya.menon@student.com": 4,
  "sanjay.pillai@student.com": 4,

  // Semester 5
  "neha.krishnan@student.com": 5,
  "amitabh.nair@student.com": 5,
  "shreya.iyer@student.com": 5,
  "vivek.menon@student.com": 5,
  "rajesh.nair@student.com": 5,
  "lakshmi.devi@student.com": 5,

  // Semester 6
  "suresh.kumar@student.com": 6,
  "ramesh.pillai@student.com": 6,
  "geetha.nair@student.com": 6,
  "manoj.reddy@student.com": 6,
  "priya.yadav@student.com": 6,
};

async function updateStudentSemesters() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB");

    console.log("\n🔄 Updating student semesters...\n");
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [email, semester] of Object.entries(studentSemesters)) {
      try {
        const student = await User.findOne({ email, role: "student" });

        if (!student) {
          console.log(`⚠️  Student not found: ${email}`);
          notFoundCount++;
          continue;
        }

        student.semester = semester;
        await student.save();
        updatedCount++;
        console.log(`✅ Updated ${student.name} to semester ${semester}`);
      } catch (error) {
        logger.error(`Error updating student ${email}: ${error.message}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 UPDATE SUMMARY");
    console.log("=".repeat(50));
    console.log(`\n✅ Students updated: ${updatedCount}`);
    console.log(`⚠️  Students not found: ${notFoundCount}`);
    console.log("\n✅ Update completed successfully!\n");

    process.exit(0);
  } catch (error) {
    logger.error("Error updating student semesters:", error);
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateStudentSemesters();
