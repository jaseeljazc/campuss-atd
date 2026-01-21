const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const attendanceService = require("../services/attendanceService");
const { ROLES, ATTENDANCE_STATUS, PERIODS } = require("../utils/constants");

async function verifyLogic() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear Attendance
    await Attendance.deleteMany({});
    console.log("Cleared Attendance");

    // 1. Create Test Student (Sem 1) and Teacher
    // Reuse existing if possible or create new

    // Find a student
    let student = await User.findOne({ role: ROLES.STUDENT, semester: 1 });
    if (!student) {
      console.log("Creating test student...");
      student = await User.create({
        name: "Test Student",
        email: "teststudent@example.com",
        password: "password",
        role: ROLES.STUDENT,
        department: "Computer Science",
        semester: 1,
        profile: { studentId: "TS001", admissionYear: 2025 },
      });
    }

    let teacher = await User.findOne({ role: ROLES.TEACHER });
    if (!teacher) {
      console.log("Creating test teacher...");
      teacher = await User.create({
        name: "Test Teacher",
        email: "testteacher@example.com",
        password: "password",
        role: ROLES.TEACHER,
        department: "Computer Science",
        profile: { employeeId: "TT001", qualification: "MTech" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Scenario 1: Yesterday - Mark attendance for Semester 3 ONLY.
    // Student is Sem 1. So for Student: Global Active YES, Sem Active NO -> Semester Leave.

    console.log(
      `\n--- Scenario 1: Marking attendance for Sem 3, checking Sem 1 (Semester Leave) ---`,
    );
    await attendanceService.markAttendance(
      {
        semester: 3,
        date: yesterday,
        period: 1,
        records: [], // Empty records just to trigger "Active Day" for sem 3
      },
      teacher._id,
    );

    let result = await attendanceService.getStudentAttendance(student._id, {
      startDate: yesterday,
      endDate: yesterday,
    });

    console.log("Global Active Dates:", result.metadata.globalActiveDates);
    console.log("Semester Active Dates:", result.metadata.semesterActiveDates);

    const isGlobalActive =
      result.metadata.globalActiveDates.includes(yesterday);
    const isSemActive =
      result.metadata.semesterActiveDates[1]?.includes(yesterday);

    console.log(
      `Date: ${yesterday} - Global Active: ${isGlobalActive} (Expect TRUE), Sem 1 Active: ${isSemActive} (Expect FALSE)`,
    );

    if (isGlobalActive && !isSemActive) {
      console.log("PASS: Identified as Semester Leave");
    } else {
      console.log("FAIL: Logic incorrect");
    }

    // Scenario 2: Today - Mark attendance for Semester 1.
    // Student is Sem 1. So Active Day.

    console.log(
      `\n--- Scenario 2: Marking attendance for Sem 1, checking Sem 1 (Active) ---`,
    );
    await attendanceService.markAttendance(
      {
        semester: 1,
        date: today,
        period: 1,
        records: [
          { studentId: student._id, status: ATTENDANCE_STATUS.PRESENT },
        ],
      },
      teacher._id,
    );

    result = await attendanceService.getStudentAttendance(student._id, {
      startDate: today,
      endDate: today,
    });

    const isGlobalActiveToday =
      result.metadata.globalActiveDates.includes(today);
    const isSemActiveToday =
      result.metadata.semesterActiveDates[1]?.includes(today);

    console.log(
      `Date: ${today} - Global Active: ${isGlobalActiveToday} (Expect TRUE), Sem 1 Active: ${isSemActiveToday} (Expect TRUE)`,
    );

    if (isGlobalActiveToday && isSemActiveToday) {
      console.log("PASS: Identified as Active Day");
    } else {
      console.log("FAIL: Logic incorrect");
    }

    // Scenario 3: Future Date - No attendance.
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    console.log(
      `\n--- Scenario 3: Future Day (No Marks) - Checking Sem 1 (College Leave) ---`,
    );

    result = await attendanceService.getStudentAttendance(student._id, {
      startDate: tomorrow,
      endDate: tomorrow,
    });
    // Note: If no records found, getStudentAttendance might return empty lists.
    // In "College Leave", both Global and Sem should be empty/false.

    const isGlobalActiveTom =
      result.metadata.globalActiveDates.includes(tomorrow);

    console.log(
      `Date: ${tomorrow} - Global Active: ${isGlobalActiveTom} (Expect FALSE)`,
    );

    if (!isGlobalActiveTom) {
      console.log("PASS: Identified as College Leave (No Active Data)");
    } else {
      console.log("FAIL: Logic incorrect");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyLogic();
