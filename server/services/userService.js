const User = require("../models/User");
const { ROLES } = require("../utils/constants");
const logger = require("../config/logger");

class UserService {
  async getAllUsers(filters = {}) {
    const query = {};
    // Department is always 'Computer Science', no need to filter
    if (filters.role) {
      query.role = filters.role;
    }
    // Filter students by semester
    if (filters.semester) {
      query.semester = parseInt(filters.semester);
    }

    const users = await User.find(query)
      .select("-passwordHash -refreshTokenVersion")
      .sort({ createdAt: -1 });

    // Transform users to include virtual fields and proper formatting
    return users.map((user) => {
      const userObj = user.toObject();
      return {
        id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        department: userObj.department,
        // Add computed fields for students
        ...(userObj.role === "student" && {
          semester: userObj.semester,
          rollNumber: userObj.rollNumber,
        }),
      };
    });
  }

  async updateUserRole(userId, newRole, currentUserRole) {
    if (currentUserRole !== ROLES.HOD) {
      throw new Error("Only HOD can change user roles");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error("Invalid role");
    }

    const oldRole = user.role;
    user.role = newRole;

    // No need to clear assignments - teachers don't have assignments anymore

    await user.save();

    logger.info(
      `User role updated: ${user.email} from ${oldRole} to ${newRole}`
    );

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      ...(user.role === ROLES.STUDENT && {
        semester: user.semester,
        rollNumber: user.rollNumber,
      }),
    };
  }
}

module.exports = new UserService();
