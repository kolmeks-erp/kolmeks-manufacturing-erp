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

    const rawRole = (req.role.name || '').toLowerCase().trim();

    // Superusers always have full access to all system modules
    if (rawRole === 'admin' || rawRole === 'master_admin' || rawRole === 'system_admin') {
      return next();
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());

    // If 'hr' is allowed, allow all HR role variants
    if (normalizedAllowed.includes('hr')) {
      normalizedAllowed.push('hr_manager', 'hr_admin', 'hr_executive', 'human_resources', 'hr_officer');
    }

    // If 'finance' is allowed, allow all Finance role variants
    if (normalizedAllowed.includes('finance')) {
      normalizedAllowed.push('finance_manager', 'accountant', 'finance_executive');
    }

    if (
      normalizedAllowed.includes(rawRole) ||
      (rawRole.includes('hr') && normalizedAllowed.includes('hr')) ||
      (rawRole.includes('human') && normalizedAllowed.includes('hr')) ||
      (rawRole.includes('finance') && normalizedAllowed.includes('finance')) ||
      (rawRole.includes('account') && normalizedAllowed.includes('finance'))
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: `Access denied. Role '${req.role.name}' is not authorized to access this resource.`,
    });
  };
};

module.exports = {
  authorizeRoles,
};
