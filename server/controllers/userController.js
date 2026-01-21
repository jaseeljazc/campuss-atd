const userService = require("../services/userService");
const logger = require("../config/logger");
const ResponseHandler = require("../utils/responseHandler");

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        role: req.query.role,
      };
      const users = await userService.getAllUsers(filters);
      ResponseHandler.success(res, users, "Users retrieved successfully");
    } catch (error) {
      logger.error(`Get users error: ${error.message}`);
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await userService.updateUserRole(id, role, req.user.role);
      ResponseHandler.success(res, user, "User role updated successfully");
    } catch (error) {
      logger.error(`Update user role error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new UserController();
