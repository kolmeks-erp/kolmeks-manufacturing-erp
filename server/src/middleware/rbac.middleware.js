/**
 * Express Role-Based Authorization Middleware (RBAC)
 * Verifies that the authenticated request user's role is included in allowedRoles.
 * MUST be placed after authenticateUser middleware.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let roleObj = req.role;
    if (!roleObj && req.profile && req.profile.role) {
      roleObj = req.profile.role;
    }
    if (!roleObj && req.user && req.user.user_metadata && req.user.user_metadata.role) {
      roleObj = { name: req.user.user_metadata.role };
    }

    let roleName = '';
    if (typeof roleObj === 'string') {
      roleName = roleObj;
    } else if (roleObj && roleObj.name) {
      roleName = roleObj.name;
    }

    console.log(`[RBAC LOG] Path: ${req.originalUrl} | Role: ${roleName} | Allowed: ${JSON.stringify(allowedRoles)}`);

    if (!roleName) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied. Security role context missing.',
      });
    }

    const rawRole = roleName.toLowerCase().trim();

    // Superusers always have full access to all system modules
    if (rawRole === 'admin' || rawRole === 'master_admin' || rawRole === 'system_admin') {
      return next();
    }

    // Flatten allowedRoles (in case arrays are passed, e.g. authorizeRoles(['admin', 'hr']))
    const flatAllowed = allowedRoles.flat(Infinity).map((r) => String(r).toLowerCase().trim());

    // Expand HR role variants
    const isHrAllowed = flatAllowed.includes('hr') || flatAllowed.some((r) => r.includes('hr') || r.includes('human'));
    const isHrUser = rawRole === 'hr' || rawRole.includes('hr') || rawRole.includes('human');

    if (isHrAllowed && isHrUser) {
      return next();
    }

    // Expand Finance role variants
    const isFinanceAllowed = flatAllowed.includes('finance') || flatAllowed.some((r) => r.includes('finance') || r.includes('account'));
    const isFinanceUser = rawRole === 'finance' || rawRole.includes('finance') || rawRole.includes('account');

    if (isFinanceAllowed && isFinanceUser) {
      return next();
    }

    if (flatAllowed.includes(rawRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: `Access denied. Role '${roleName}' is not authorized to access this resource.`,
    });
  };
};

module.exports = {
  authorizeRoles,
};
