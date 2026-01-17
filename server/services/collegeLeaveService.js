const CollegeLeave = require("../models/CollegeLeave");
const Attendance = require("../models/Attendance");
const logger = require("../config/logger");

class CollegeLeaveService {
  async createCollegeLeave(data, markedBy) {
    const { date, reason } = data;
    const department = "Computer Science"; // Hardcoded department

    // Check if attendance already exists for this date
    const dateObj = new Date(date);
    const existingAttendance = await Attendance.findOne({
      department,
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      },
    });

    if (existingAttendance) {
      throw new Error(
        "Attendance already exists for this date. Cannot mark as college leave.",
      );
    }

    // Check if college leave already exists
    const existingLeave = await CollegeLeave.findOne({
      department,
      date: dateObj,
    });

    if (existingLeave) {
      throw new Error("College leave already marked for this date");
    }

    const collegeLeave = new CollegeLeave({
      department,
      date: dateObj,
      reason,
      markedBy,
    });

    await collegeLeave.save();

    logger.info(
      `College leave created: ${department} - ${date} by ${markedBy}`,
    );

    return collegeLeave;
  }

  async markSemesterCollegeLeave(data, markedBy) {
    const { semester, date, reason } = data;
    const department = "Computer Science"; // Hardcoded department

    // Use date directly as string (YYYY-MM-DD format)
    // No Date conversion to avoid timezone issues

    // Check if college leave already exists for this semester and date
    const existingLeave = await CollegeLeave.findOne({
      department,
      semester,
      date: date, // Direct string comparison
    });

    if (existingLeave) {
      throw new Error(
        `College leave already marked for Semester ${semester} on this date`,
      );
    }

    // Create college leave with date as string
    const collegeLeave = new CollegeLeave({
      department,
      semester,
      date: date, // Store as string directly
      reason,
      markedBy,
    });

    await collegeLeave.save();

    logger.info(
      `Semester-specific college leave created: Semester ${semester} - ${date} by ${markedBy}`,
    );

    return collegeLeave;
  }

  async getCollegeLeaves(filters = {}) {
    const query = {};
    // Department is always 'Computer Science', no filtering needed

    if (filters.semester) {
      query.semester = filters.semester;
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

    const collegeLeaves = await CollegeLeave.find(query)
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    return collegeLeaves;
  }

  async checkAndCreateCollegeLeave(date) {
    const department = "Computer Science"; // Hardcoded department
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Check if attendance exists for any period on this date
    const attendanceExists = await Attendance.findOne({
      department,
      date: {
        $gte: dateObj,
        $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // If no attendance exists, create college leave
    if (!attendanceExists) {
      const existingLeave = await CollegeLeave.findOne({
        department,
        date: dateObj,
      });

      if (!existingLeave) {
        const collegeLeave = new CollegeLeave({
          department,
          date: dateObj,
          reason: "Automated college leave - No attendance marked",
          markedBy: null, // System generated
        });

        await collegeLeave.save();
        logger.info(
          `Auto-created college leave: ${department} - ${
            dateObj.toISOString().split("T")[0]
          }`,
        );
        return collegeLeave;
      }
    }

    return null;
  }
}

module.exports = new CollegeLeaveService();
