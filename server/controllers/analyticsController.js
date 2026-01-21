const analyticsService = require("../services/analyticsService");
const logger = require("../config/logger");
const ResponseHandler = require("../utils/responseHandler");

class AnalyticsController {
  async getLowAttendanceStudents(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        semester: req.query.semester,
        threshold: req.query.threshold,
      };
      const students = await analyticsService.getLowAttendanceStudents(filters);
      ResponseHandler.success(
        res,
        students,
        "Low attendance students retrieved successfully",
      );
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
      ResponseHandler.success(
        res,
        summary,
        "Semester summary retrieved successfully",
      );
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
      ResponseHandler.success(
        res,
        data,
        "Students attendance data retrieved successfully",
      );
    } catch (error) {
      logger.error(`Get students attendance error: ${error.message}`);
      next(error);
    }
  }

  async getStudentAttendanceCalendar(req, res, next) {
    try {
      const { studentId } = req.params;
      const user = req.user; // From auth middleware

      // Students can only access their own attendance data
      // Convert both to strings for comparison since one might be ObjectId
      if (
        user.role === "student" &&
        user.id.toString() !== studentId.toString()
      ) {
        const error = new Error(
          "Unauthorized: You can only access your own attendance",
        );
        error.statusCode = 403;
        throw error;
      }

      const filters = {
        semester: req.query.semester ? parseInt(req.query.semester) : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const data = await analyticsService.getStudentAttendanceCalendar(
        studentId,
        filters,
      );
      ResponseHandler.success(
        res,
        data,
        "Student attendance calendar retrieved successfully",
      );
    } catch (error) {
      logger.error(`Get student attendance calendar error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
