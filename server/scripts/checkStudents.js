require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const env = require("../config/env");

async function checkStudents() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB\n");

    const students = await User.find({ role: "student" })
      .select("name email semester")
      .sort({ semester: 1, name: 1 });

    console.log("📚 STUDENTS BY SEMESTER\n");
    console.log("=".repeat(60));

    let currentSemester = null;
    students.forEach((student) => {
      if (student.semester !== currentSemester) {
        currentSemester = student.semester;
        console.log(`\n📖 SEMESTER ${currentSemester}:`);
        console.log("-".repeat(60));
      }
      console.log(`  ${student.name.padEnd(25)} ${student.email}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 SUMMARY:");
    for (let sem = 1; sem <= 8; sem++) {
      const count = students.filter((s) => s.semester === sem).length;
      if (count > 0) {
        console.log(`  Semester ${sem}: ${count} students`);
      }
    }
    console.log(`\n  Total: ${students.length} students\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkStudents();
