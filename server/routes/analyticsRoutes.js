const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const {
  lowAttendanceSchema,
  semesterSummarySchema,
} = require("../validators/analyticsValidators");
const { ROLES } = require("../utils/constants");

router.get(
  "/low-attendance",
  authenticate,
  requireRole([ROLES.HOD]),
  validate(lowAttendanceSchema),
  analyticsController.getLowAttendanceStudents
);

router.get(
  "/semester-summary",
  authenticate,
  requireRole([ROLES.HOD]),
  validate(semesterSummarySchema),
  analyticsController.getSemesterSummary
);

router.get(
  "/students-attendance",
  authenticate,
  requireRole([ROLES.HOD]),
  analyticsController.getStudentsAttendance
);

router.get(
  "/student-attendance-calendar/:studentId",
  authenticate,
  requireRole([ROLES.HOD, ROLES.STUDENT]),
  analyticsController.getStudentAttendanceCalendar
);

module.exports = router;
