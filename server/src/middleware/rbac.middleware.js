/**
 * Express Role-Based Authorization Middleware (RBAC)
 * Verifies that the authenticated request user's role is included in allowedRoles.
 * MUST be placed after authenticateUser middleware.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role || !req.role.name) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. Security role context missing.',
      });
    }

    const userRole = req.role.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Role '${userRole}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
