const { supabaseAdmin } = require('../config/supabase');

class SecurityService {
  /**
   * Helper to log a security event immutably
   */
  async logSecurityEvent(eventData) {
    try {
      const {
        actorId,
        actorEmail,
        eventType,
        category = 'AUTHENTICATION',
        severity = 'INFO',
        module = 'Security',
        targetEntity,
        targetId,
        ipAddress,
        details = {}
      } = eventData;

      const { data, error } = await supabaseAdmin
        .from('security_events')
        .insert([
          {
            actor_id: actorId || null,
            actor_email: actorEmail || null,
            event_type: eventType,
            category,
            severity,
            module,
            target_entity: targetEntity || null,
            target_id: targetId ? String(targetId) : null,
            ip_address: ipAddress || '127.0.0.1',
            details
          }
        ])
        .select()
        .single();

      if (error) console.error('Failed to insert security event:', error.message);
      return data;
    } catch (err) {
      console.error('Error logging security event:', err.message);
    }
  }

  /**
   * Calculate Real System Security Overview Metrics
   */
  async getSecurityOverviewMetrics() {
    try {
      // 1. Fetch user status distribution from profiles
      const { data: profiles, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id, status, role_id');

      if (profileErr) throw profileErr;

      const totalUsers = profiles?.length || 0;
      const activeUsers = profiles?.filter((p) => p.status === 'active').length || 0;
      const suspendedUsers = profiles?.filter((p) => p.status === 'suspended').length || 0;
      const inactiveUsers = profiles?.filter((p) => p.status === 'inactive').length || 0;

      // 2. Fetch active sessions count
      const { count: activeSessionsCount, error: sessionErr } = await supabaseAdmin
        .from('user_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      // 3. Fetch recent security events in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: secEvents, error: eventsErr } = await supabaseAdmin
        .from('security_events')
        .select('id, severity, category, event_type')
        .gte('created_at', thirtyDaysAgo);

      const totalSecurityEvents = secEvents?.length || 0;
      const criticalEvents = secEvents?.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length || 0;
      const failedLogins = secEvents?.filter((e) => e.event_type === 'LOGIN_FAILED').length || 0;
      const privilegeChanges = secEvents?.filter((e) => e.category === 'AUTHORIZATION').length || 0;
      const exportActivities = secEvents?.filter((e) => e.category === 'EXPORT').length || 0;

      // 4. Fetch recent security policy configurations
      const { data: policies } = await supabaseAdmin.from('security_policies').select('*');

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          inactive: inactiveUsers
        },
        sessions: {
          activeCount: activeSessionsCount || activeUsers // Fallback to active users if no session table records yet
        },
        events: {
          totalLast30Days: totalSecurityEvents,
          criticalCount: criticalEvents,
          failedLoginAttempts: failedLogins,
          privilegeChangesCount: privilegeChanges,
          exportActivitiesCount: exportActivities
        },
        policiesCount: policies?.length || 0
      };
    } catch (err) {
      console.error('Error fetching security metrics:', err);
      throw err;
    }
  }

  /**
   * Fetch Access Control Records (Users, Roles, Statuses)
   */
  async getAccessControlRecords(params = {}) {
    const { search, status, roleId } = params;

    let query = supabaseAdmin.from('profiles').select(`
      id,
      full_name,
      email,
      phone,
      department,
      status,
      created_at,
      role:roles (
        id,
        name,
        description
      )
    `);

    if (status) query = query.eq('status', status);
    if (roleId) query = query.eq('role_id', roleId);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Update User Account Status (Suspend, Reactivate, Deactivate) with Audit Event & Safeguards
   */
  async updateUserStatus(targetUserId, newStatus, currentAdminId, ipAddress) {
    if (targetUserId === currentAdminId) {
      throw new Error('Privilege Escalation Protection: You cannot suspend or deactivate your own admin account.');
    }

    const { data: targetProfile, error: getErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, status, full_name')
      .eq('id', targetUserId)
      .single();

    if (getErr || !targetProfile) throw new Error('Target user account profile not found.');

    const oldStatus = targetProfile.status;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log Security Event
    await this.logSecurityEvent({
      actorId: currentAdminId,
      eventType: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_STATUS_UPDATED',
      category: 'AUTHORIZATION',
      severity: newStatus === 'suspended' ? 'HIGH' : 'MEDIUM',
      module: 'AccessControl',
      targetEntity: 'UserProfile',
      targetId: targetUserId,
      ipAddress,
      details: {
        targetEmail: targetProfile.email,
        oldStatus,
        newStatus
      }
    });

    return updated;
  }

  /**
   * Fetch Active Devices & User Sessions
   */
  async getUserSessions(params = {}) {
    const { userId, status } = params;

    let query = supabaseAdmin.from('user_sessions').select(`
      id,
      user_id,
      device_info,
      browser,
      ip_address,
      status,
      last_activity,
      created_at,
      user:profiles (
        id,
        full_name,
        email
      )
    `);

    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('last_activity', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Revoke an Active Session
   */
  async revokeUserSession(sessionId, currentAdminId, ipAddress) {
    const { data: updated, error } = await supabaseAdmin
      .from('user_sessions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: currentAdminId
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    await this.logSecurityEvent({
      actorId: currentAdminId,
      eventType: 'SESSION_REVOKED',
      category: 'SESSION',
      severity: 'MEDIUM',
      module: 'SessionSecurity',
      targetEntity: 'UserSession',
      targetId: sessionId,
      ipAddress
    });

    return updated;
  }

  /**
   * Fetch Stream of Security Events with Filters
   */
  async getSecurityEvents(filters = {}) {
    const { category, severity, dateRange, limit = 100 } = filters;

    let query = supabaseAdmin.from('security_events').select(`
      id,
      event_timestamp,
      actor_id,
      actor_email,
      event_type,
      category,
      severity,
      module,
      target_entity,
      target_id,
      ip_address,
      details,
      created_at
    `);

    if (category) query = query.eq('category', category);
    if (severity) query = query.eq('severity', severity);

    const { data, error } = await query.order('event_timestamp', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  /**
   * Security Policies Management
   */
  async getSecurityPolicies() {
    const { data, error } = await supabaseAdmin.from('security_policies').select('*').order('category');
    if (error) throw error;
    return data || [];
  }

  async updateSecurityPolicy(policyKey, value, currentAdminId, ipAddress) {
    const { data, error } = await supabaseAdmin
      .from('security_policies')
      .update({
        value,
        updated_by: currentAdminId,
        updated_at: new Date().toISOString()
      })
      .eq('policy_key', policyKey)
      .select()
      .single();

    if (error) throw error;

    await this.logSecurityEvent({
      actorId: currentAdminId,
      eventType: 'POLICY_UPDATED',
      category: 'SECURITY_POLICY',
      severity: 'HIGH',
      module: 'SecurityPolicies',
      targetEntity: 'SecurityPolicy',
      targetId: policyKey,
      ipAddress,
      details: { policyKey, newValue: value }
    });

    return data;
  }

  /**
   * System Audit Logs Stream (Immutable)
   */
  async getAuditTrailLogs(filters = {}) {
    const { module, severity, search, limit = 100 } = filters;

    let query = supabaseAdmin.from('system_audit_logs').select(`
      id,
      created_at,
      action,
      module,
      entity_type,
      entity_id,
      severity,
      actor_id,
      old_data,
      new_data,
      ip_address,
      actor:profiles (
        id,
        full_name,
        email
      )
    `);

    if (module) query = query.eq('module', module);
    if (severity) query = query.eq('severity', severity);
    if (search) query = query.ilike('action', `%${search}%`);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
}

module.exports = new SecurityService();
