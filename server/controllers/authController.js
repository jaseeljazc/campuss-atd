const authService = require("../services/authService");
const logger = require("../config/logger");
const ResponseHandler = require("../utils/responseHandler");

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      ResponseHandler.created(res, result, "User registered successfully");
    } catch (error) {
      logger.error(`Signup error: ${error.message}`);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      ResponseHandler.success(res, result, "Login successful");
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      ResponseHandler.success(res, tokens, "Token refreshed successfully");
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.logout(req.user.id, refreshToken);
      ResponseHandler.success(res, result, "Logout successful");
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AuthController();
