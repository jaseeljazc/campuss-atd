const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

async function checkDateRange() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const earliest = await Attendance.findOne().sort({ date: 1 });
    const latest = await Attendance.findOne().sort({ date: -1 });

    console.log("Earliest Date:", earliest ? earliest.date : "None");
    console.log("Latest Date:", latest ? latest.date : "None");

    // Check for records around Nov 10
    const novRecords = await Attendance.countDocuments({
      date: {
        $gte: new Date("2024-11-01"),
        $lt: new Date("2024-12-01"),
      },
    });
    console.log("Records in November 2024:", novRecords);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDateRange();
