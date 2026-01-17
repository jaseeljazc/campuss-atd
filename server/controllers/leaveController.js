const leaveService = require("../services/leaveService");
const logger = require("../config/logger");

class LeaveController {
  // ============ CLASS LEAVE ============

  async markClassLeave(req, res, next) {
    try {
      const classLeave = await leaveService.markClassLeave(
        req.body,
        req.user.id,
      );
      res.status(201).json(classLeave);
    } catch (error) {
      logger.error(`Mark class leave error: ${error.message}`);
      next(error);
    }
  }

  async getClassLeaves(req, res, next) {
    try {
      const filters = {
        semester: req.query.semester ? parseInt(req.query.semester) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const classLeaves = await leaveService.getClassLeaves(filters);
      res.status(200).json(classLeaves);
    } catch (error) {
      logger.error(`Get class leaves error: ${error.message}`);
      next(error);
    }
  }

  // ============ COLLEGE LEAVE ============

  async markCollegeLeave(req, res, next) {
    try {
      const collegeLeave = await leaveService.markCollegeLeave(
        req.body,
        req.user.id,
      );
      res.status(201).json(collegeLeave);
    } catch (error) {
      logger.error(`Mark college leave error: ${error.message}`);
      next(error);
    }
  }

  async getCollegeLeaves(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const collegeLeaves = await leaveService.getCollegeLeaves(filters);
      res.status(200).json(collegeLeaves);
    } catch (error) {
      logger.error(`Get college leaves error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new LeaveController();
