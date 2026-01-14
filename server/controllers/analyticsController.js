const analyticsService = require("../services/analyticsService");
const logger = require("../config/logger");

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

  async getStudentsAttendance(req, res, next) {
    try {
      const filters = {
        semester: req.query.semester,
      };
      const data = await analyticsService.getStudentsWithAttendance(filters);
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Get students attendance error: ${error.message}`);
      next(error);
    }
  }

  async getStudentAttendanceCalendar(req, res, next) {
    try {
      const { studentId } = req.params;
      const filters = {
        semester: req.query.semester,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const data = await analyticsService.getStudentAttendanceCalendar(
        studentId,
        filters
      );
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Get student attendance calendar error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
