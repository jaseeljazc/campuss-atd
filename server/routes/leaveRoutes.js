const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const {
  markClassLeaveSchema,
  getClassLeavesSchema,
  markCollegeLeaveSchema,
  getCollegeLeavesSchema,
} = require("../validators/leaveValidators");
const { ROLES } = require("../utils/constants");

// ============ CLASS LEAVE ROUTES ============

router.post(
  "/class-leave",
  authenticate,
  requireRole([ROLES.HOD]),
  validate(markClassLeaveSchema),
  leaveController.markClassLeave,
);

router.get(
  "/class-leave",
  authenticate,
  validate(getClassLeavesSchema),
  leaveController.getClassLeaves,
);

// ============ COLLEGE LEAVE ROUTES ============

router.post(
  "/college-leave",
  authenticate,
  requireRole([ROLES.HOD]),
  validate(markCollegeLeaveSchema),
  leaveController.markCollegeLeave,
);

router.get(
  "/college-leave",
  authenticate,
  validate(getCollegeLeavesSchema),
  leaveController.getCollegeLeaves,
);

router.delete(
  "/class-leave/:semester/:date",
  authenticate,
  requireRole([ROLES.HOD]),
  leaveController.deleteClassLeave,
);

router.delete(
  "/college-leave/:date",
  authenticate,
  requireRole([ROLES.HOD]),
  leaveController.deleteCollegeLeave,
);

module.exports = router;
