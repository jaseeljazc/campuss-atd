const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      department: user.department,
      assignedSemesters: user.assignedSemesters || [],
      assignedPeriods: user.assignedPeriods || [],
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticate: authMiddleware,
};

