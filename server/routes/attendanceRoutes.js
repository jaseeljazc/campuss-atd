const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const {
  markAttendanceSchema,
  updateAttendanceSchema,
  getStudentAttendanceSchema,
  getDepartmentAttendanceSchema,
} = require('../validators/attendanceValidators');
const { ROLES } = require('../utils/constants');

router.post(
  '/mark',
  authenticate,
  requireRole([ROLES.TEACHER]),
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);

router.put(
  '/:id',
  authenticate,
  requireRole([ROLES.TEACHER, ROLES.HOD]),
  validate(updateAttendanceSchema),
  attendanceController.updateAttendance
);

router.delete(
  '/:id',
  authenticate,
  requireRole([ROLES.HOD]),
  attendanceController.deleteAttendance
);

router.get(
  '/student/:studentId',
  authenticate,
  validate(getStudentAttendanceSchema),
  attendanceController.getStudentAttendance
);

router.get(
  '/department/:department',
  authenticate,
  requireRole([ROLES.TEACHER, ROLES.HOD]),
  validate(getDepartmentAttendanceSchema),
  attendanceController.getDepartmentAttendance
);

module.exports = router;
