const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Express Authentication Middleware
 * Validates Supabase JWT access token from Authorization: Bearer <token> header.
 * Fetches user profile & role directly from PostgreSQL database via service role client.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token is empty.',
      });
    }

    // Verify token with Supabase Auth
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication session.',
      });
    }

    const user = userData.user;

    // Retrieve trusted application profile and role from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        department,
        status,
        role_id,
        role:roles (
          id,
          name,
          description
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Associated staff profile not found.',
      });
    }

    // Check application profile status (active / inactive / suspended)
    if (profile.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `ERP access restricted. Staff profile status is '${profile.status}'.`,
      });
    }

    const role = Array.isArray(profile.role) ? profile.role[0] : profile.role;

    // Attach trusted security context to Express request object
    req.user = user;
    req.profile = profile;
    req.role = role;

    next();
  } catch (error) {
    console.error('Authentication middleware exception:', error);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to process authentication.',
    });
  }
};

module.exports = {
  authenticateUser,
};
