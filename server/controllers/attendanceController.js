const attendanceService = require('../services/attendanceService');
const logger = require('../config/logger');

class AttendanceController {
  async markAttendance(req, res, next) {
    try {
      const attendance = await attendanceService.markAttendance(req.body, req.user.id);
      res.status(201).json(attendance);
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
        req.user.role
      );
      res.status(200).json(attendance);
    } catch (error) {
      logger.error(`Update attendance error: ${error.message}`);
      next(error);
    }
  }

  async deleteAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const result = await attendanceService.deleteAttendance(id);
      res.status(200).json(result);
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
      const result = await attendanceService.getStudentAttendance(studentId, filters);
      res.status(200).json(result);
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
      const attendance = await attendanceService.getDepartmentAttendance(department, filters);
      res.status(200).json(attendance);
    } catch (error) {
      logger.error(`Get department attendance error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AttendanceController();
