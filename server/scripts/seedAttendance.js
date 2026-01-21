const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const env = require("../config/env");
const logger = require("../config/logger");
const { ROLES, PERIODS, ATTENDANCE_STATUS } = require("../utils/constants");

/**
 * Seed Attendance Data
 * Generates mock attendance from December 14, 2024 to today
 * - Only working days (Monday-Friday)
 * - All semesters (1-6)
 * - All periods (1-5)
 * - 70-85% present probability
 */

// Helper function to check if date is a weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

// Helper function to get all working days between two dates
function getWorkingDays(startDate, endDate) {
  const workingDays = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (!isWeekend(current)) {
      workingDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

// Helper function to get random teacher ID
function getRandomTeacher(teachers) {
  return teachers[Math.floor(Math.random() * teachers.length)]._id;
}

// Helper function to determine attendance status with probability
function getAttendanceStatus() {
  // 70-85% present probability
  const presentProbability = 0.7 + Math.random() * 0.15; // Random between 0.70 and 0.85
  return Math.random() < presentProbability
    ? ATTENDANCE_STATUS.PRESENT
    : ATTENDANCE_STATUS.ABSENT;
}

async function seedAttendance() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Connected to MongoDB");

    console.log("\n" + "=".repeat(60));
    console.log("📅 ATTENDANCE SEEDING SCRIPT");
    console.log("=".repeat(60));

    // Fetch all teachers and students
    console.log("\n📊 Fetching users from database...\n");
    const teachers = await User.find({ role: ROLES.TEACHER });
    const students = await User.find({ role: ROLES.STUDENT });

    if (teachers.length === 0) {
      console.error("❌ No teachers found! Please run seedUsers.js first.");
      process.exit(1);
    }

    if (students.length === 0) {
      console.error("❌ No students found! Please run seedUsers.js first.");
      process.exit(1);
    }

    console.log(`✅ Found ${teachers.length} teachers`);
    console.log(`✅ Found ${students.length} students`);

    // Group students by semester
    const studentsBySemester = {};
    students.forEach((student) => {
      const sem = student.semester || 1;
      if (!studentsBySemester[sem]) {
        studentsBySemester[sem] = [];
      }
      studentsBySemester[sem].push(student);
    });

    console.log("\n📚 Students per semester:");
    Object.keys(studentsBySemester)
      .sort((a, b) => a - b)
      .forEach((sem) => {
        console.log(
          `   Semester ${sem}: ${studentsBySemester[sem].length} students`,
        );
      });

    // Define date range: December 14, 2024 to today
    const startDate = new Date("2024-12-14");
    const endDate = new Date(); // Today
    endDate.setHours(0, 0, 0, 0); // Reset to start of day

    console.log(
      `\n📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`,
    );

    // Get all working days
    const workingDays = getWorkingDays(startDate, endDate);
    console.log(`✅ Total working days (Mon-Fri): ${workingDays.length}`);

    // Generate attendance data
    console.log("\n🔄 Generating attendance data...\n");

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const semesters = Object.keys(studentsBySemester)
      .map(Number)
      .sort((a, b) => a - b);

    for (const date of workingDays) {
      const dateStr = date.toISOString().split("T")[0];

      for (const semester of semesters) {
        const semesterStudents = studentsBySemester[semester];

        for (const period of PERIODS) {
          try {
            // Check if attendance already exists for this combination
            const existing = await Attendance.findOne({
              semester,
              date,
              period,
            });

            if (existing) {
              totalSkipped++;
              continue;
            }

            // Generate attendance records for all students in this semester
            const records = semesterStudents.map((student) => ({
              studentId: student._id,
              status: getAttendanceStatus(),
            }));

            // Create attendance document
            const attendance = new Attendance({
              department: "Computer Science",
              semester,
              date,
              period,
              teacherId: getRandomTeacher(teachers),
              records,
            });

            await attendance.save();
            totalCreated++;

            // Log progress every 50 records
            if (totalCreated % 50 === 0) {
              console.log(
                `   ✅ Created ${totalCreated} attendance records...`,
              );
            }
          } catch (error) {
            if (error.code === 11000) {
              // Duplicate key error - already exists
              totalSkipped++;
            } else {
              totalErrors++;
              logger.error(
                `Error creating attendance for ${dateStr}, Sem ${semester}, Period ${period}: ${error.message}`,
              );
            }
          }
        }
      }
    }

    // Calculate statistics
    const totalPossible =
      workingDays.length * semesters.length * PERIODS.length;

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`\n📅 Date Range:`);
    console.log(`   Start: ${startDate.toDateString()}`);
    console.log(`   End: ${endDate.toDateString()}`);
    console.log(`   Working Days: ${workingDays.length}`);
    console.log(`\n📚 Semesters: ${semesters.join(", ")}`);
    console.log(`📝 Periods: ${PERIODS.join(", ")}`);
    console.log(`\n👥 Students:`);
    semesters.forEach((sem) => {
      console.log(
        `   Semester ${sem}: ${studentsBySemester[sem].length} students`,
      );
    });
    console.log(`\n📊 Attendance Records:`);
    console.log(`   Total possible: ${totalPossible}`);
    console.log(`   Created: ${totalCreated}`);
    console.log(`   Skipped (already exist): ${totalSkipped}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`\n📈 Attendance Probability: 70-85% present`);
    console.log(`🏫 Department: Computer Science`);
    console.log(`\n✅ Attendance seeding completed successfully!\n`);

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding attendance:", error);
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the seed function
seedAttendance();
