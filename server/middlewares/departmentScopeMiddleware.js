const { ROLES } = require('../utils/constants');

// Ensures teachers operate only within their own department, semesters and periods.
function departmentScopeMiddleware(req, res, next) {
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (user.role === ROLES.HOD) {
    // HOD is already constrained at the department-level per design (single department per user)
    return next();
  }

  if (user.role === ROLES.TEACHER) {
    const { department, semester, period } = req.body.department
      ? req.body
      : req.query.department
      ? req.query
      : req.params;

    if (department && department !== user.department) {
      return res.status(403).json({ error: 'Forbidden: cross-department access' });
    }

    if (semester && !user.assignedSemesters.includes(Number(semester))) {
      return res.status(403).json({ error: 'Forbidden: semester not assigned' });
    }

    if (period && !user.assignedPeriods.includes(Number(period))) {
      return res.status(403).json({ error: 'Forbidden: period not assigned' });
    }
  }

  // Students are implicitly limited to their own data via controllers/services
  return next();
}

module.exports = departmentScopeMiddleware;

