const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Kolmeks Central Database Service
 * Provides abstraction for Supabase PostgreSQL data access.
 */
class DatabaseService {
  /**
   * Health check query to verify database table accessibility
   */
  async checkDatabaseHealth() {
    try {
      // Query roles table as baseline connectivity test
      const { data, error, count } = await supabaseAdmin
        .from('roles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          connected: false,
          status: 'error',
          message: error.message,
          tablesVerified: false,
        };
      }

      return {
        connected: true,
        status: 'online',
        message: 'Successfully connected to Supabase PostgreSQL database',
        tablesVerified: true,
        rolesCount: count || 0,
      };
    } catch (err) {
      return {
        connected: false,
        status: 'exception',
        message: err.message,
        tablesVerified: false,
      };
    }
  }

  /**
   * Universal helper for administrative queries using server-side service client
   */
  getAdminClient() {
    return supabaseAdmin;
  }

  /**
   * Universal helper for standard public/anon queries
   */
  getClient() {
    return supabase;
  }
}

module.exports = new DatabaseService();
