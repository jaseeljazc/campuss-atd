const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { updateRoleSchema } = require('../validators/userValidators');
const { ROLES } = require('../utils/constants');

router.get('/', authenticate, userController.getAllUsers);
router.patch(
  '/:id/role',
  authenticate,
  requireRole([ROLES.HOD]),
  validate(updateRoleSchema),
  userController.updateUserRole
);

module.exports = router;
