const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validateMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  loginSchema,
  signupSchema,
  refreshTokenSchema,
  logoutSchema,
} = require('../validators/authValidators');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, validate(logoutSchema), authController.logout);

module.exports = router;
