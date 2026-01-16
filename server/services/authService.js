const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateTokens, verifyRefreshToken } = require("../utils/jwt");
const { ROLES } = require("../utils/constants");
const logger = require("../config/logger");

class AuthService {
  async signup(userData) {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user with Computer Science department
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || ROLES.STUDENT,
      department: "Computer Science", // Hardcoded department
    });

    await user.save();

    logger.info(`New user registered: ${user.email} (${user.role})`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update refresh token version
    user.refreshTokenVersion += 1;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        ...(user.role === ROLES.STUDENT && {
          semester: user.semester,
          rollNumber: user.rollNumber,
        }),
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Update refresh token version for rotation
    user.refreshTokenVersion += 1;
    await user.save();

    logger.info(`User logged in: ${user.email} (${user.role})`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        ...(user.role === ROLES.STUDENT && {
          semester: user.semester,
          rollNumber: user.rollNumber,
        }),
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Check token version for rotation
    if (user.refreshTokenVersion !== decoded.tokenVersion) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const tokens = generateTokens(user);

    // Rotate refresh token
    user.refreshTokenVersion += 1;
    await user.save();

    logger.info(`Token refreshed for user: ${user.email}`);

    return tokens;
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user) {
      // Increment token version to invalidate all existing refresh tokens
      user.refreshTokenVersion += 1;
      await user.save();
      logger.info(`User logged out: ${user.email}`);
    }
    return { message: "Logged out successfully" };
  }
}

module.exports = new AuthService();
