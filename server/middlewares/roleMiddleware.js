const { ROLES } = require('../utils/constants');

function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    next();
  };
}

const teacherOnly = roleMiddleware(ROLES.TEACHER);
const hodOnly = roleMiddleware(ROLES.HOD);

function requireRole(allowedRoles) {
  return roleMiddleware(...allowedRoles);
}

module.exports = {
  roleMiddleware,
  requireRole,
  teacherOnly,
  hodOnly,
};

