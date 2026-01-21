const Attendance = require("../models/Attendance");
const CollegeLeave = require("../models/CollegeLeave");
const User = require("../models/User");
const {
  ROLES,
  ATTENDANCE_STATUS,
  DAY_PRESENT_THRESHOLD,
} = require("../utils/constants");
const logger = require("../config/logger");

class AttendanceService {
  async markAttendance(data, teacherId) {
    const { semester, date, period, records } = data;
    const department = "Computer Science";

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // No assignment validation - teachers can mark for any semester/period

    // Check if attendance already exists - if yes, update it instead
    const existingAttendance = await Attendance.findOne({
      semester,
      date: new Date(date),
      period,
    });

    if (existingAttendance) {
      // Update existing record
      existingAttendance.records = records;
      existingAttendance.teacherId = teacherId;
      await existingAttendance.save();
      logger.info(
        `Attendance updated: CS - Semester ${semester} - ${date} - Period ${period} by ${teacher.email}`,
      );
      return existingAttendance;
    }

    // Validate all student IDs exist
    const studentIds = records.map((r) => r.studentId);
    const students = await User.find({
      _id: { $in: studentIds },
      role: ROLES.STUDENT,
    });

    if (students.length !== studentIds.length) {
      throw new Error(
        "Some students not found or do not belong to this department",
      );
    }

    const attendance = new Attendance({
      department,
      semester,
      date: new Date(date),
      period,
      teacherId,
      records,
    });

    await attendance.save();

    logger.info(
      `Attendance marked: ${department} - Semester ${semester} - ${date} - Period ${period} by ${teacher.email}`,
    );

    return attendance;
  }

  async updateAttendance(attendanceId, records, userId, userRole) {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    // No time-based or ownership restrictions - any teacher/HOD can edit

    // Validate student IDs
    const studentIds = records.map((r) => r.studentId);
    const students = await User.find({
      _id: { $in: studentIds },
      role: ROLES.STUDENT,
    });

    if (students.length !== studentIds.length) {
      throw new Error(
        "Some students not found or do not belong to this department",
      );
    }

    attendance.records = records;
    await attendance.save();

    logger.info(`Attendance updated: ${attendanceId} by user ${userId}`);

    return attendance;
  }

  async deleteAttendance(attendanceId) {
    const attendance = await Attendance.findByIdAndDelete(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    logger.info(`Attendance deleted: ${attendanceId}`);

    return { message: "Attendance deleted successfully" };
  }

  async getStudentAttendance(studentId, filters = {}) {
    const student = await User.findById(studentId);
    if (!student || student.role !== ROLES.STUDENT) {
      throw new Error("Student not found");
    }

    const query = {
      department: student.department,
      "records.studentId": studentId,
    };

    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("teacherId", "name email")
      .sort({ date: -1, period: 1 });

    // Calculate statistics
    const semesterStats = await this.calculateStudentStats(
      studentId,
      filters.semester,
    );

    // Get Active Date Metadata for Calendar Rendering
    // 1. Global Active Dates (Any attendance in department)
    // 2. Semester Active Dates (Attendance for this semester)

    // Fetch distinct dates for valid semesters to build metadata
    const semesterMetaQuery = {};
    if (Object.keys(query.date || {}).length > 0) {
      semesterMetaQuery.date = query.date;
    }
    if (filters.semester) {
      semesterMetaQuery.semester = parseInt(filters.semester);
    }

    const activeDatesPerSemester = await Attendance.aggregate([
      { $match: semesterMetaQuery },
      {
        $group: {
          _id: "$semester",
          dates: {
            $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
      },
    ]);

    const semesterActiveDates = {};
    const globalActiveDates = new Set();

    activeDatesPerSemester.forEach((item) => {
      semesterActiveDates[item._id] = item.dates.sort();
      item.dates.forEach((d) => globalActiveDates.add(d));
    });

    return {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
      },
      records: attendanceRecords,
      statistics: semesterStats,
      metadata: {
        globalActiveDates: Array.from(globalActiveDates).sort(),
        semesterActiveDates,
      },
    };
  }

  async getDepartmentAttendance(filters = {}) {
    const query = {}; // All records are Computer Science

    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("teacherId", "name email")
      .sort({ date: -1, semester: 1, period: 1 });

    return attendanceRecords;
  }

  async calculateStudentStats(studentId, semester = null) {
    const student = await User.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // 1. Get Active Dates Per Semester (The Denominator)
    const semesterQuery = {};
    if (semester) {
      semesterQuery.semester = parseInt(semester);
    }

    const activeDatesPerSemester = await Attendance.aggregate([
      { $match: semesterQuery },
      {
        $group: {
          _id: "$semester",
          dates: {
            $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
      },
    ]);

    const semesterActiveDatesMap = {};
    activeDatesPerSemester.forEach((item) => {
      semesterActiveDatesMap[item._id] = new Set(item.dates);
    });

    // 2. Get Student's Records (The Numerator Data)
    const query = {
      department: student.department,
      "records.studentId": studentId,
    };
    if (semester) {
      query.semester = parseInt(semester);
    }

    const studentRecords = await Attendance.find(query);

    // 3. Calculate Stats
    const semesterStats = {};

    Object.keys(semesterActiveDatesMap).forEach((sem) => {
      if (!semesterStats[sem]) {
        semesterStats[sem] = { totalDays: 0, presentDays: 0, absentDays: 0 };
      }

      const activeDates = semesterActiveDatesMap[sem];
      semesterStats[sem].totalDays = activeDates.size;

      const relevantRecords = studentRecords.filter((r) => r.semester == sem);

      activeDates.forEach((dateStr) => {
        const dailyRecords = relevantRecords.filter(
          (r) => r.date.toISOString().split("T")[0] === dateStr,
        );

        let presentPeriods = 0;
        // Check if student was present in enough periods
        dailyRecords.forEach((rec) => {
          const studentRecord = rec.records.find(
            (r) => r.studentId.toString() === studentId.toString(),
          );
          if (
            studentRecord &&
            studentRecord.status === ATTENDANCE_STATUS.PRESENT
          ) {
            presentPeriods++;
          }
        });

        if (presentPeriods >= DAY_PRESENT_THRESHOLD) {
          semesterStats[sem].presentDays += 1;
        } else {
          semesterStats[sem].absentDays += 1;
        }
      });

      semesterStats[sem].attendancePercentage =
        semesterStats[sem].totalDays > 0
          ? (
              (semesterStats[sem].presentDays / semesterStats[sem].totalDays) *
              100
            ).toFixed(2)
          : 0;
    });

    return semesterStats;
  }
}

module.exports = new AttendanceService();
