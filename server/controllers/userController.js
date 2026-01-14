const userService = require('../services/userService');
const logger = require('../config/logger');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        role: req.query.role,
      };
      const users = await userService.getAllUsers(filters);
      res.status(200).json(users);
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
      res.status(200).json(user);
    } catch (error) {
      logger.error(`Update user role error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new UserController();
