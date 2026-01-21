const attendanceService = require("../services/attendanceService");
const logger = require("../config/logger");
const ResponseHandler = require("../utils/responseHandler");

class AttendanceController {
  async markAttendance(req, res, next) {
    try {
      const attendance = await attendanceService.markAttendance(
        req.body,
        req.user.id,
      );
      ResponseHandler.created(
        res,
        attendance,
        "Attendance marked successfully",
      );
    } catch (error) {
      logger.error(`Mark attendance error: ${error.message}`);
      next(error);
    }
  }

  async updateAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const { records } = req.body;
      const attendance = await attendanceService.updateAttendance(
        id,
        records,
        req.user.id,
        req.user.role,
      );
      ResponseHandler.success(
        res,
        attendance,
        "Attendance updated successfully",
      );
    } catch (error) {
      logger.error(`Update attendance error: ${error.message}`);
      next(error);
    }
  }

  async deleteAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const result = await attendanceService.deleteAttendance(id);
      ResponseHandler.success(res, result, "Attendance deleted successfully");
    } catch (error) {
      logger.error(`Delete attendance error: ${error.message}`);
      next(error);
    }
  }

  async getStudentAttendance(req, res, next) {
    try {
      const { studentId } = req.params;
      const filters = {
        semester: req.query.semester,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const result = await attendanceService.getStudentAttendance(
        studentId,
        filters,
      );
      ResponseHandler.success(
        res,
        result,
        "Student attendance retrieved successfully",
      );
    } catch (error) {
      logger.error(`Get student attendance error: ${error.message}`);
      next(error);
    }
  }

  async getDepartmentAttendance(req, res, next) {
    try {
      const { department } = req.params;
      const filters = {
        semester: req.query.semester,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const attendance = await attendanceService.getDepartmentAttendance(
        department,
        filters,
      );
      ResponseHandler.success(
        res,
        attendance,
        "Department attendance retrieved successfully",
      );
    } catch (error) {
      logger.error(`Get department attendance error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AttendanceController();
