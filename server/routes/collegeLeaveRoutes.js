const express = require('express');
const router = express.Router();
const collegeLeaveController = require('../controllers/collegeLeaveController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const {
  createCollegeLeaveSchema,
  getCollegeLeaveSchema,
} = require('../validators/collegeLeaveValidators');
const { ROLES } = require('../utils/constants');

router.post(
  '/',
  authenticate,
  requireRole([ROLES.HOD]),
  validate(createCollegeLeaveSchema),
  collegeLeaveController.createCollegeLeave
);

router.get(
  '/',
  authenticate,
  validate(getCollegeLeaveSchema),
  collegeLeaveController.getCollegeLeaves
);

module.exports = router;
