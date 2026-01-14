const analyticsService = require('../services/analyticsService');
const logger = require('../config/logger');

class AnalyticsController {
  async getLowAttendanceStudents(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        semester: req.query.semester,
        threshold: req.query.threshold,
      };
      const students = await analyticsService.getLowAttendanceStudents(filters);
      res.status(200).json(students);
    } catch (error) {
      logger.error(`Get low attendance students error: ${error.message}`);
      next(error);
    }
  }

  async getSemesterSummary(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        semester: req.query.semester,
      };
      const summary = await analyticsService.getSemesterSummary(filters);
      res.status(200).json(summary);
    } catch (error) {
      logger.error(`Get semester summary error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
