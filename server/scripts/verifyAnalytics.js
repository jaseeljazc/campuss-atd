const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const analyticsService = require("../services/analyticsService");
const User = require("../models/User");

async function verifyAnalytics() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if students exist
    const students = await User.countDocuments({ role: "student" });
    console.log(`Total Students in DB: ${students}`);

    console.log("Fetching Students with Attendance...");
    const result = await analyticsService.getStudentsWithAttendance({});

    console.log(
      `Students returned by Analytics Service: ${result.students.length}`,
    );

    if (result.students.length > 0) {
      console.log(
        "Sample Student:",
        JSON.stringify(result.students[0], null, 2),
      );
    } else {
      console.log(
        "WARNING: No students returned. Check calculation logic or data.",
      );
    }

    console.log("Fetching Semester Summary...");
    const summary = await analyticsService.getSemesterSummary({});
    console.log("Semester Summary:", JSON.stringify(summary, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyAnalytics();
