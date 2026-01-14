const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

function generateTokens(user) {
  const accessPayload = {
    sub: user._id.toString(),
    role: user.role,
    department: user.department,
  };

  const refreshPayload = {
    userId: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
};

