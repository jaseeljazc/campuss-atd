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
        `Attendance updated: CS - Semester ${semester} - ${date} - Period ${period} by ${teacher.email}`
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
        "Some students not found or do not belong to this department"
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
      `Attendance marked: ${department} - Semester ${semester} - ${date} - Period ${period} by ${teacher.email}`
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
        "Some students not found or do not belong to this department"
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
      filters.semester
    );

    return {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
      },
      records: attendanceRecords,
      statistics: semesterStats,
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

    const query = {
      department: student.department,
      "records.studentId": studentId,
    };

    if (semester) {
      query.semester = parseInt(semester);
    }

    const attendanceRecords = await Attendance.find(query);
    const collegeLeaves = await CollegeLeave.find({
      date: {
        $gte:
          attendanceRecords.length > 0
            ? attendanceRecords[attendanceRecords.length - 1].date
            : new Date(),
      },
    });

    const leaveDates = new Set(
      collegeLeaves.map((leave) => leave.date.toISOString().split("T")[0])
    );

    // Group by date and semester
    const dateMap = new Map();
    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      const semesterKey = record.semester;

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {});
      }
      if (!dateMap.get(dateKey)[semesterKey]) {
        dateMap.get(dateKey)[semesterKey] = { present: 0, absent: 0 };
      }

      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === studentId.toString()
      );
      if (studentRecord) {
        if (studentRecord.status === ATTENDANCE_STATUS.PRESENT) {
          dateMap.get(dateKey)[semesterKey].present += 1;
        } else {
          dateMap.get(dateKey)[semesterKey].absent += 1;
        }
      }
    });

    // Calculate statistics per semester
    const semesterStats = {};
    dateMap.forEach((semesters, date) => {
      if (leaveDates.has(date)) {
        return; // Skip college leave days
      }

      Object.keys(semesters).forEach((sem) => {
        if (!semesterStats[sem]) {
          semesterStats[sem] = { totalDays: 0, presentDays: 0, absentDays: 0 };
        }

        const { present, absent } = semesters[sem];
        const totalPeriods = present + absent;

        if (totalPeriods >= DAY_PRESENT_THRESHOLD) {
          semesterStats[sem].totalDays += 1;
          if (present >= DAY_PRESENT_THRESHOLD) {
            semesterStats[sem].presentDays += 1;
          } else {
            semesterStats[sem].absentDays += 1;
          }
        }
      });
    });

    // Calculate percentages
    Object.keys(semesterStats).forEach((sem) => {
      const stats = semesterStats[sem];
      stats.attendancePercentage =
        stats.totalDays > 0
          ? ((stats.presentDays / stats.totalDays) * 100).toFixed(2)
          : 0;
    });

    return semesterStats;
  }
}

module.exports = new AttendanceService();
