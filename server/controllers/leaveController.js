const leaveService = require("../services/leaveService");
const logger = require("../config/logger");
const ResponseHandler = require("../utils/responseHandler");

class LeaveController {
  // ============ CLASS LEAVE ============

  async markClassLeave(req, res, next) {
    try {
      const classLeave = await leaveService.markClassLeave(
        req.body,
        req.user.id,
      );
      ResponseHandler.created(
        res,
        classLeave,
        "Class leave marked successfully",
      );
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
      ResponseHandler.success(
        res,
        classLeaves,
        "Class leaves retrieved successfully",
      );
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
      ResponseHandler.created(
        res,
        collegeLeave,
        "College leave marked successfully",
      );
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
      ResponseHandler.success(
        res,
        collegeLeaves,
        "College leaves retrieved successfully",
      );
    } catch (error) {
      logger.error(`Get college leaves error: ${error.message}`);
      next(error);
    }
  }

  async deleteClassLeave(req, res, next) {
    try {
      const { semester, date } = req.params;
      const classLeave = await leaveService.deleteClassLeave(
        parseInt(semester),
        date,
      );
      ResponseHandler.success(
        res,
        classLeave,
        "Class leave deleted successfully",
      );
    } catch (error) {
      logger.error(`Delete class leave error: ${error.message}`);
      next(error);
    }
  }

  async deleteCollegeLeave(req, res, next) {
    try {
      const { date } = req.params;
      const collegeLeave = await leaveService.deleteCollegeLeave(date);
      ResponseHandler.success(
        res,
        collegeLeave,
        "College leave deleted successfully",
      );
    } catch (error) {
      logger.error(`Delete college leave error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new LeaveController();
