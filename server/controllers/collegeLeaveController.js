const collegeLeaveService = require("../services/collegeLeaveService");
const logger = require("../config/logger");

class CollegeLeaveController {
  async createCollegeLeave(req, res, next) {
    try {
      const collegeLeave = await collegeLeaveService.createCollegeLeave(
        req.body,
        req.user.id,
      );
      res.status(201).json(collegeLeave);
    } catch (error) {
      logger.error(`Create college leave error: ${error.message}`);
      next(error);
    }
  }

  async getCollegeLeaves(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        semester: req.query.semester ? parseInt(req.query.semester) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const collegeLeaves = await collegeLeaveService.getCollegeLeaves(filters);
      res.status(200).json(collegeLeaves);
    } catch (error) {
      logger.error(`Get college leaves error: ${error.message}`);
      next(error);
    }
  }

  async markSemesterCollegeLeave(req, res, next) {
    try {
      const collegeLeave = await collegeLeaveService.markSemesterCollegeLeave(
        req.body,
        req.user.id,
      );
      res.status(201).json(collegeLeave);
    } catch (error) {
      logger.error(`Mark semester college leave error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new CollegeLeaveController();
