const User = require("../models/User");
const Attendance = require("../models/Attendance");
const CollegeLeave = require("../models/CollegeLeave");
const {
  ROLES,
  ATTENDANCE_STATUS,
  DAY_PRESENT_THRESHOLD,
} = require("../utils/constants");

class AnalyticsService {
  async getLowAttendanceStudents(filters = {}) {
    const threshold = filters.threshold ? parseFloat(filters.threshold) : 75.0;
    const query = { role: ROLES.STUDENT }; // All students are Computer Science

    const students = await User.find(query);
    const lowAttendanceStudents = [];

    for (const student of students) {
      const stats = await this.calculateStudentAttendancePercentage(
        student._id,
        filters.semester ? parseInt(filters.semester) : null
      );

      Object.keys(stats).forEach((semester) => {
        const percentage = parseFloat(stats[semester].attendancePercentage);
        if (percentage < threshold) {
          lowAttendanceStudents.push({
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              department: student.department,
            },
            semester: parseInt(semester),
            attendancePercentage: percentage,
            presentDays: stats[semester].presentDays,
            absentDays: stats[semester].absentDays,
            totalDays: stats[semester].totalDays,
          });
        }
      });
    }

    return lowAttendanceStudents.sort(
      (a, b) => a.attendancePercentage - b.attendancePercentage
    );
  }

  async getSemesterSummary(filters = {}) {
    const query = {}; // All records are Computer Science

    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    const attendanceRecords = await Attendance.find(query);
    const collegeLeaves = await CollegeLeave.find({});

    const leaveDates = new Set(
      collegeLeaves.map((leave) => leave.date.toISOString().split("T")[0])
    );

    // Get all students (all Computer Science)
    const studentQuery = { role: ROLES.STUDENT };
    const students = await User.find(studentQuery);

    // Group attendance by date and semester
    const dateMap = new Map();
    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      const semesterKey = record.semester;

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {});
      }
      if (!dateMap.get(dateKey)[semesterKey]) {
        dateMap.get(dateKey)[semesterKey] = {};
      }

      record.records.forEach((rec) => {
        const studentId = rec.studentId.toString();
        if (!dateMap.get(dateKey)[semesterKey][studentId]) {
          dateMap.get(dateKey)[semesterKey][studentId] = {
            present: 0,
            absent: 0,
          };
        }
        if (rec.status === ATTENDANCE_STATUS.PRESENT) {
          dateMap.get(dateKey)[semesterKey][studentId].present += 1;
        } else {
          dateMap.get(dateKey)[semesterKey][studentId].absent += 1;
        }
      });
    });

    // Calculate statistics per semester
    const semesterStats = {};
    students.forEach((student) => {
      dateMap.forEach((semesters, date) => {
        if (leaveDates.has(date)) {
          return; // Skip college leave days
        }

        Object.keys(semesters).forEach((sem) => {
          if (!semesterStats[sem]) {
            semesterStats[sem] = {
              totalStudents: students.filter((s) =>
                filters.semester ? true : s.department === student.department
              ).length,
              totalDays: 0,
              averageAttendance: 0,
              periodCompletion: {},
            };
          }

          const studentData = semesters[sem][student._id.toString()];
          if (studentData) {
            const { present, absent } = studentData;
            const totalPeriods = present + absent;

            if (totalPeriods >= DAY_PRESENT_THRESHOLD) {
              semesterStats[sem].totalDays += 1;
            }
          }
        });
      });
    });

    // Calculate period completion
    const periodMap = new Map();
    attendanceRecords.forEach((record) => {
      const key = `${record.semester}-${record.period}`;
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          semester: record.semester,
          period: record.period,
          count: 0,
        });
      }
      periodMap.get(key).count += 1;
    });

    Object.keys(semesterStats).forEach((sem) => {
      const periods = [1, 2, 3, 4, 5];
      periods.forEach((period) => {
        const key = `${sem}-${period}`;
        const periodData = periodMap.get(key);
        semesterStats[sem].periodCompletion[period] = periodData
          ? periodData.count
          : 0;
      });
    });

    return semesterStats;
  }

  async calculateStudentAttendancePercentage(studentId, semester = null) {
    const student = await User.findById(studentId);
    if (!student) {
      return {};
    }

    const query = {
      "records.studentId": studentId,
    };

    if (semester) {
      query.semester = semester;
    }

    const attendanceRecords = await Attendance.find(query);
    const collegeLeaves = await CollegeLeave.find({});

    const leaveDates = new Set(
      collegeLeaves.map((leave) => leave.date.toISOString().split("T")[0])
    );

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

    const semesterStats = {};
    dateMap.forEach((semesters, date) => {
      if (leaveDates.has(date)) {
        return;
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

    Object.keys(semesterStats).forEach((sem) => {
      const stats = semesterStats[sem];
      stats.attendancePercentage =
        stats.totalDays > 0
          ? ((stats.presentDays / stats.totalDays) * 100).toFixed(2)
          : 0;
    });

    return semesterStats;
  }

  async getStudentsWithAttendance(filters = {}) {
    const query = { role: ROLES.STUDENT };

    // If semester filter is provided, only get students in that semester
    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    const students = await User.find(query).sort({ name: 1 }).lean();

    // Fetch all attendance records in one query
    const attendanceQuery = {};
    if (filters.semester) {
      attendanceQuery.semester = parseInt(filters.semester);
    }

    const attendanceRecords = await Attendance.find(attendanceQuery).lean();
    const collegeLeaves = await CollegeLeave.find({}).lean();

    const leaveDates = new Set(
      collegeLeaves.map(
        (leave) => new Date(leave.date).toISOString().split("T")[0]
      )
    );

    // Build a map of student attendance data
    const studentAttendanceMap = new Map();

    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split("T")[0];
      const semesterKey = record.semester;

      // Skip college leave days
      if (leaveDates.has(dateKey)) {
        return;
      }

      record.records.forEach((rec) => {
        const studentId = rec.studentId.toString();

        if (!studentAttendanceMap.has(studentId)) {
          studentAttendanceMap.set(studentId, {});
        }

        const studentData = studentAttendanceMap.get(studentId);
        if (!studentData[semesterKey]) {
          studentData[semesterKey] = {};
        }

        if (!studentData[semesterKey][dateKey]) {
          studentData[semesterKey][dateKey] = { present: 0, absent: 0 };
        }

        if (rec.status === ATTENDANCE_STATUS.PRESENT) {
          studentData[semesterKey][dateKey].present += 1;
        } else {
          studentData[semesterKey][dateKey].absent += 1;
        }
      });
    });

    // Calculate stats for each student
    const studentsWithAttendance = [];

    students.forEach((student) => {
      const studentId = student._id.toString();
      const studentData = studentAttendanceMap.get(studentId) || {};

      // If semester filter is provided, only include that semester's data
      if (filters.semester) {
        const semesterKey = filters.semester.toString();
        const semesterData = studentData[semesterKey] || {};

        let totalDays = 0;
        let presentDays = 0;
        let absentDays = 0;

        Object.values(semesterData).forEach((dayData) => {
          const totalPeriods = dayData.present + dayData.absent;
          if (totalPeriods >= DAY_PRESENT_THRESHOLD) {
            totalDays += 1;
            if (dayData.present >= DAY_PRESENT_THRESHOLD) {
              presentDays += 1;
            } else {
              absentDays += 1;
            }
          }
        });

        const attendancePercentage =
          totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        studentsWithAttendance.push({
          id: student._id,
          name: student.name,
          email: student.email,
          rollNumber:
            student.rollNumber ||
            `CS2024${student._id.toString().slice(-6).toUpperCase()}`,
          semester: parseInt(semesterKey),
          department: student.department,
          attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
          presentDays,
          absentDays,
          totalDays,
        });
      } else {
        // Include all semesters
        Object.keys(studentData).forEach((semesterKey) => {
          const semesterData = studentData[semesterKey];

          let totalDays = 0;
          let presentDays = 0;
          let absentDays = 0;

          Object.values(semesterData).forEach((dayData) => {
            const totalPeriods = dayData.present + dayData.absent;
            if (totalPeriods >= DAY_PRESENT_THRESHOLD) {
              totalDays += 1;
              if (dayData.present >= DAY_PRESENT_THRESHOLD) {
                presentDays += 1;
              } else {
                absentDays += 1;
              }
            }
          });

          const attendancePercentage =
            totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

          studentsWithAttendance.push({
            id: student._id,
            name: student.name,
            email: student.email,
            rollNumber:
              student.rollNumber ||
              `CS2024${student._id.toString().slice(-6).toUpperCase()}`,
            semester: parseInt(semesterKey),
            department: student.department,
            attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
            presentDays,
            absentDays,
            totalDays,
          });
        });
      }
    });

    return { students: studentsWithAttendance };
  }

  async getStudentAttendanceCalendar(studentId, filters = {}) {
    const student = await User.findById(studentId);
    if (!student) {
      const error = new Error("Student not found");
      error.statusCode = 404;
      throw error;
    }

    // Convert studentId to ObjectId for proper comparison
    const studentObjectId = student._id;

    const query = {
      "records.studentId": studentObjectId,
    };

    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: 1 });
    const collegeLeaves = await CollegeLeave.find({});

    const collegeLeaveDays = collegeLeaves.map(
      (leave) => leave.date.toISOString().split("T")[0]
    );

    // Group records by date
    const dateMap = new Map();
    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          periods: [],
          presentCount: 0,
          absentCount: 0,
        });
      }

      // Find the specific student's record in this attendance document
      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === studentObjectId.toString()
      );

      // Only process if this student has a record for this period

      if (studentRecord) {
        const dayData = dateMap.get(dateKey);
        dayData.periods.push({
          period: record.period,
          status: studentRecord.status,
        });

        if (studentRecord.status === ATTENDANCE_STATUS.PRESENT) {
          dayData.presentCount += 1;
        } else {
          dayData.absentCount += 1;
        }
      }
    });

    // Convert to array and determine day status
    const attendanceCalendar = [];
    dateMap.forEach((dayData) => {
      const totalPeriods = dayData.presentCount + dayData.absentCount;
      let status = "not-marked";

      if (totalPeriods >= DAY_PRESENT_THRESHOLD) {
        status =
          dayData.presentCount >= DAY_PRESENT_THRESHOLD ? "present" : "absent";
      } else if (totalPeriods > 0) {
        status = "partial";
      }

      attendanceCalendar.push({
        date: dayData.date,
        status,
        periods: dayData.periods.sort((a, b) => a.period - b.period),
      });
    });

    return {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber:
          student.rollNumber ||
          `${student.department.substring(0, 2).toUpperCase()}${student._id
            .toString()
            .substring(0, 3)}`,
        semester: filters.semester ? parseInt(filters.semester) : null,
        department: student.department,
      },
      attendanceRecords: attendanceCalendar,
      collegeLeaveDays,
    };
  }
}

module.exports = new AnalyticsService();
