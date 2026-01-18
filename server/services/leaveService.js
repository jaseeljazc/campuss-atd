const CollegeLeave = require("../models/CollegeLeave");
const ClassLeave = require("../models/ClassLeave");
const logger = require("../config/logger");

class LeaveService {
  // ============ CLASS LEAVE (Semester-Specific) ============

  async markClassLeave(data, markedBy) {
    const { semester, date, reason } = data;
    const department = "Computer Science";

    // Check if class leave already exists for this semester and date
    const existingLeave = await ClassLeave.findOne({
      department,
      semester,
      date: date,
    });

    if (existingLeave) {
      throw new Error(
        `Class leave already marked for Semester ${semester} on this date`,
      );
    }

    const classLeave = new ClassLeave({
      department,
      semester,
      date: date,
      reason,
      markedBy,
    });

    await classLeave.save();

    logger.info(
      `Class leave created: Semester ${semester} - ${date} by ${markedBy}`,
    );

    return classLeave;
  }

  async getClassLeaves(filters = {}) {
    const query = {};

    if (filters.semester) {
      query.semester = filters.semester;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate;
      }
    }

    const classLeaves = await ClassLeave.find(query)
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    return classLeaves;
  }

  // ============ COLLEGE LEAVE (Global) ============

  async markCollegeLeave(data, markedBy) {
    const { date, reason } = data;
    const department = "Computer Science";

    // Check if college leave already exists for this date
    const existingLeave = await CollegeLeave.findOne({
      department,
      date: date,
    });

    if (existingLeave) {
      throw new Error(`College leave already marked for this date`);
    }

    const collegeLeave = new CollegeLeave({
      department,
      date: date,
      reason,
      markedBy,
    });

    await collegeLeave.save();

    logger.info(`College leave created: ${date} by ${markedBy}`);

    return collegeLeave;
  }

  async getCollegeLeaves(filters = {}) {
    const query = {};

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate;
      }
    }

    const collegeLeaves = await CollegeLeave.find(query)
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    return collegeLeaves;
  }

  // ============ DELETE CLASS LEAVE ============

  async deleteClassLeave(semester, date) {
    const department = "Computer Science";

    const classLeave = await ClassLeave.findOneAndDelete({
      department,
      semester,
      date: date,
    });

    if (!classLeave) {
      throw new Error(
        `Class leave not found for Semester ${semester} on ${date}`,
      );
    }

    logger.info(`Class leave deleted: Semester ${semester} - ${date}`);

    return classLeave;
  }

  // ============ DELETE COLLEGE LEAVE ============

  async deleteCollegeLeave(date) {
    const department = "Computer Science";

    const collegeLeave = await CollegeLeave.findOneAndDelete({
      department,
      date: date,
    });

    if (!collegeLeave) {
      throw new Error(`College leave not found for ${date}`);
    }

    logger.info(`College leave deleted: ${date}`);

    return collegeLeave;
  }
}

module.exports = new LeaveService();
