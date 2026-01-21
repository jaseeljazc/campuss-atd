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
        filters.semester ? parseInt(filters.semester) : null,
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
      (a, b) => a.attendancePercentage - b.attendancePercentage,
    );
  }

  async getSemesterSummary(filters = {}) {
    const query = {}; // All records are Computer Science

    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    const attendanceRecords = await Attendance.find(query);

    // Build active dates set per semester
    const semesterActiveDates = {};
    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      const sem = record.semester;
      if (!semesterActiveDates[sem]) semesterActiveDates[sem] = new Set();
      semesterActiveDates[sem].add(dateKey);
    });

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

    // We iterate semesterActiveDates to ensure we count "Active Days" correctly
    // And we aggregate stats for all students in that semester

    // Initialize stats for all semesters found in active dates (or from students?)
    // Better to use active dates keys
    Object.keys(semesterActiveDates).forEach((sem) => {
      // Filter students belonging to this semester?
      // Actually, the summary might be for the whole department, broken down by semester.
      // So we filter students by semester.

      const semesterStudents = students.filter((s) => s.semester == sem);

      semesterStats[sem] = {
        totalStudents: semesterStudents.length,
        totalDays: semesterActiveDates[sem].size,
        averageAttendance: 0,
        periodCompletion: {},
      };

      // Calculate average attendance
      // Sum of (Student Present Days / Total Days) / Total Students

      let totalStudentAttendancePercentage = 0;
      const activeDates = Array.from(semesterActiveDates[sem]);

      semesterStudents.forEach((student) => {
        let presentDays = 0;
        activeDates.forEach((dateStr) => {
          const dayData = dateMap.get(dateStr)?.[sem]?.[student._id.toString()];
          if (dayData && dayData.present >= DAY_PRESENT_THRESHOLD) {
            presentDays++;
          }
        });

        const percentage =
          semesterStats[sem].totalDays > 0
            ? (presentDays / semesterStats[sem].totalDays) * 100
            : 0;
        totalStudentAttendancePercentage += percentage;
      });

      semesterStats[sem].averageAttendance =
        semesterStudents.length > 0
          ? (
              totalStudentAttendancePercentage / semesterStudents.length
            ).toFixed(2)
          : 0;
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

    // Ensure all semesters are covered for period completion
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

    // 1. Get Active Dates Per Semester (The Denominator)
    const semesterQuery = {};
    if (semester) {
      semesterQuery.semester = parseInt(semester);
    }

    // We can't use aggregate easily here if we need to filter by global/semester active dates derived from records only?
    // Actually, distinct dates per semester is enough for "Semester Active Days".

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
      "records.studentId": studentId,
    };

    if (semester) {
      query.semester = semester;
    }

    const attendanceRecords = await Attendance.find(query);

    // 3. Calculate Stats
    const semesterStats = {};

    Object.keys(semesterActiveDatesMap).forEach((sem) => {
      if (!semesterStats[sem]) {
        semesterStats[sem] = { totalDays: 0, presentDays: 0, absentDays: 0 };
      }

      const activeDates = semesterActiveDatesMap[sem];
      semesterStats[sem].totalDays = activeDates.size;

      const relevantRecords = attendanceRecords.filter(
        (r) => r.semester == sem,
      );

      activeDates.forEach((dateStr) => {
        const dailyRecords = relevantRecords.filter(
          (r) => r.date.toISOString().split("T")[0] === dateStr,
        );

        let presentPeriods = 0;
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

    // We do NOT use CollegeLeave anymore for count.

    // Build a map of semester active dates
    // Semester -> Set<DateString>
    const semesterActiveDates = {};
    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split("T")[0];
      const sem = record.semester;
      if (!semesterActiveDates[sem]) semesterActiveDates[sem] = new Set();
      semesterActiveDates[sem].add(dateKey);
    });

    // Build a map of student attendance data
    const studentAttendanceMap = new Map();

    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split("T")[0];
      const semesterKey = record.semester;

      // Note: We don't skip "College Leave" days anymore because "College Leave" is implicitly defined
      // by the ABSENCE of attendance records. If a record exists here, it is by definition NOT a College Leave.

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

      // STRICT: Only look at the student's actual semester
      // If a filter is applied, the query above ensures query.semester matches student.semester
      // so we can just use student.semester here safely.
      const targetSemester = student.semester;

      // STRICT: Filter validation
      if (filters.semester && targetSemester !== parseInt(filters.semester)) {
        return;
      }

      if (!targetSemester) return; // Skip if student has no semester assigned

      const semesterKey = targetSemester.toString();
      // Data specific to this student
      const semesterData = studentData[semesterKey] || {};

      // Calculate Total Days based on SEMESTER ACTIVE DATES loop, not just student records loop
      // This ensures if a student has NO record on an active day (e.g. absent and record missing? unlikely if full class), it still counts.
      // But more importantly, it aligns with "active days" definition.

      const activeDates = semesterActiveDates[targetSemester]
        ? Array.from(semesterActiveDates[targetSemester])
        : [];

      let totalDays = activeDates.length;
      let presentDays = 0;
      let absentDays = 0;

      // Iterate active dates to check presence
      activeDates.forEach((dateStr) => {
        const dayDataForStudent = semesterData[dateStr];
        if (dayDataForStudent) {
          const totalPeriods =
            dayDataForStudent.present + dayDataForStudent.absent;
          // If student has record entries equal to threshold?
          // Logic: If present >= threshold -> Present
          // Else -> Absent
          if (dayDataForStudent.present >= DAY_PRESENT_THRESHOLD) {
            presentDays++;
          } else {
            absentDays++;
          }
        } else {
          // Student has NO record on an active day.
          // Assume Absent?
          absentDays++;
        }
      });

      // If student has 0 active days, exclude?
      if (totalDays === 0) {
        return;
      }

      const attendancePercentage =
        totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      studentsWithAttendance.push({
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber:
          student.rollNumber ||
          `CS2024${student._id.toString().slice(-6).toUpperCase()}`,
        semester: targetSemester,
        department: student.department,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
        presentDays,
        absentDays,
        totalDays,
      });
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

    // Determine the semester to query
    const semesterToQuery = filters.semester
      ? parseInt(filters.semester)
      : student.semester;

    if (!semesterToQuery) {
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
          semester: null,
          department: student.department,
        },
        attendanceRecords: [],
        collegeLeaveDays: [],
      };
    }

    // Fetch ALL attendance records for this semester (not just for this student)
    const semesterAttendanceQuery = {
      semester: semesterToQuery,
    };

    const allSemesterRecords = await Attendance.find(
      semesterAttendanceQuery,
    ).sort({ date: 1 });

    // Fetch attendance records specifically for this student
    const studentAttendanceQuery = {
      "records.studentId": studentObjectId,
      semester: semesterToQuery,
    };

    const studentAttendanceRecords = await Attendance.find(
      studentAttendanceQuery,
    ).sort({ date: 1 });

    // Fetch BOTH leave types
    const CollegeLeave = require("../models/CollegeLeave");
    const ClassLeave = require("../models/ClassLeave");

    // Fetch global college leaves (no semester filter)
    const collegeLeaves = await CollegeLeave.find({});

    // Fetch class leaves for this semester
    const classLeaves = await ClassLeave.find({ semester: semesterToQuery });

    // Helper function to format date without timezone issues
    const formatDateUTC = (date) => {
      const d = new Date(date);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // College Leave dates (global, affects all semesters)
    const collegeLeaveDays = collegeLeaves.map((leave) => ({
      date: leave.date, // Already a string
      reason: leave.reason,
    }));

    // Class Leave dates (semester-specific)
    const classLeaveDays = classLeaves.map((leave) => ({
      date: leave.date, // Already a string
      semester: leave.semester,
      reason: leave.reason,
    }));

    // Build a set of dates where ANY attendance was marked for this semester
    const semesterAttendanceDates = new Set();
    allSemesterRecords.forEach((record) => {
      const dateKey = formatDateUTC(record.date);
      semesterAttendanceDates.add(dateKey);
    });

    // Build a map of student's specific attendance records by date
    const studentDateMap = new Map();
    studentAttendanceRecords.forEach((record) => {
      const dateKey = formatDateUTC(record.date);

      if (!studentDateMap.has(dateKey)) {
        studentDateMap.set(dateKey, {
          date: dateKey,
          periods: [],
          presentCount: 0,
          absentCount: 0,
        });
      }

      // Find the specific student's record in this attendance document
      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === studentObjectId.toString(),
      );

      if (studentRecord) {
        const dayData = studentDateMap.get(dateKey);
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

    // Helper function to check if a date is a weekend
    const isWeekend = (dateStr) => {
      const date = new Date(dateStr + "T00:00:00Z"); // Parse as UTC
      const day = date.getUTCDay();
      return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    };

    // Build complete calendar with all dates in the semester's range
    const attendanceCalendar = [];

    if (allSemesterRecords.length > 0) {
      // Get date range from semester attendance
      const firstDate = allSemesterRecords[0].date;
      const lastDate = allSemesterRecords[allSemesterRecords.length - 1].date;

      // Iterate through all dates in the range
      const currentDate = new Date(firstDate);
      const endDate = new Date(lastDate);

      while (currentDate <= endDate) {
        const dateKey = formatDateUTC(currentDate);

        // Skip weekends
        if (!isWeekend(dateKey)) {
          let status = "college-leave";
          let periods = [];

          // Priority check: College Leave > Class Leave > Attendance

          // 1. Check if this date is a COLLEGE LEAVE (global, highest priority)
          const collegeLeaveForDate = collegeLeaveDays.find(
            (cl) => cl.date === dateKey,
          );
          if (collegeLeaveForDate) {
            status = "college-leave";
            periods = [];
          }
          // 2. Check if this date is a CLASS LEAVE for this semester
          else if (classLeaveDays.find((cl) => cl.date === dateKey)) {
            status = "class-leave";
            periods = [];
          }
          // Check if ANY attendance was marked for this semester on this date
          else if (semesterAttendanceDates.has(dateKey)) {
            // Attendance was marked for the semester on this day
            // Build complete period array with auto-absent for unmarked periods

            const markedPeriods = studentDateMap.get(dateKey)?.periods || [];

            // Create all 5 periods, auto-filling unmarked ones as absent
            const allPeriods = [1, 2, 3, 4, 5].map((periodNum) => {
              const markedPeriod = markedPeriods.find(
                (p) => p.period === periodNum,
              );
              return {
                period: periodNum,
                status: markedPeriod
                  ? markedPeriod.status
                  : ATTENDANCE_STATUS.ABSENT,
              };
            });

            // Count present periods
            const presentCount = allPeriods.filter(
              (p) => p.status === ATTENDANCE_STATUS.PRESENT,
            ).length;

            // Calculate daily status based on 3+ present periods threshold
            status =
              presentCount >= DAY_PRESENT_THRESHOLD ? "present" : "absent";
            periods = allPeriods;
          } else {
            // No attendance was marked for this semester on this date
            status = "college-leave";
            periods = [];
          }

          attendanceCalendar.push({
            date: dateKey,
            status,
            periods,
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

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
        semester: semesterToQuery,
        department: student.department,
      },
      attendanceRecords: attendanceCalendar,
      collegeLeaveDays, // Global leaves
      classLeaveDays, // Semester-specific leaves
    };
  }
}

module.exports = new AnalyticsService();
