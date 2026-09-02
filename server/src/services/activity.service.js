const { supabaseAdmin } = require('../config/supabase');

class ActivityService {
  /**
   * Helper to parse date preset filter into ISO timestamps
   */
  getDateBounds(preset, customStart, customEnd) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (preset) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate = new Date(customEnd);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return {
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString()
    };
  }

  /**
   * Fetch Unified Activity Stream (My Activity, Team Activity, System Activity)
   */
  async getActivityStream(params, userRole, userProfile) {
    const { view = 'my', datePreset = 'last_30_days', customStart, customEnd, module, action, limit = 50 } = params;
    const { startIso, endIso } = this.getDateBounds(datePreset, customStart, customEnd);

    let activityList = [];

    // 1. SYSTEM AUDIT LOGS QUERY
    let auditQuery = supabaseAdmin
      .from('system_audit_logs')
      .select(`
        id,
        created_at,
        action,
        module,
        entity_type,
        entity_id,
        severity,
        actor_id,
        ip_address,
        actor:profiles(id, full_name, email, department)
      `)
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (view === 'my' && userProfile?.id) {
      auditQuery = auditQuery.eq('actor_id', userProfile.id);
    } else if (view === 'team' && userProfile?.department) {
      // Filter by department if available
      // Or fallback to normal fetch
    }

    if (module) auditQuery = auditQuery.eq('module', module);

    const { data: auditLogs } = await auditQuery;

    if (auditLogs && auditLogs.length > 0) {
      const formattedAudit = auditLogs.map((log) => ({
        id: `audit_${log.id}`,
        timestamp: log.created_at,
        actorName: log.actor?.full_name || log.actor?.email || 'System User',
        actorEmail: log.actor?.email || '',
        actorId: log.actor_id,
        department: log.actor?.department || 'Operations',
        action: log.action,
        module: log.module || 'ERP Operations',
        entityType: log.entity_type,
        entityId: log.entity_id,
        severity: log.severity || 'INFO',
        source: 'audit',
        description: `Executed ${log.action} on ${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`,
        route: this.resolveEntityRoute(log.entity_type, log.entity_id, log.module)
      }));
      activityList.push(...formattedAudit);
    }

    // 2. SECURITY EVENTS QUERY (Only if view === 'system' and role is admin/security)
    const allowedSecurityRoles = ['admin', 'master_admin', 'security_officer'];
    if (view === 'system' && allowedSecurityRoles.includes(userRole)) {
      const { data: secEvents } = await supabaseAdmin
        .from('security_events')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (secEvents && secEvents.length > 0) {
        const formattedSec = secEvents.map((sec) => ({
          id: `sec_${sec.id}`,
          timestamp: sec.event_timestamp,
          actorName: sec.actor_email || 'System / Security',
          actorEmail: sec.actor_email || '',
          actorId: sec.actor_id,
          department: 'Security & Compliance',
          action: sec.event_type,
          module: 'Security',
          entityType: sec.target_entity || 'SecurityEvent',
          entityId: sec.target_id,
          severity: sec.severity || 'HIGH',
          source: 'security',
          description: `Security Event: ${sec.event_type} (${sec.category})`,
          route: `/secure-kolmeks-x0y0/security/events`
        }));
        activityList.push(...formattedSec);
      }
    }

    // Sort aggregated activity stream by timestamp descending
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      view,
      count: activityList.length,
      activities: activityList.slice(0, limit)
    };
  }

  /**
   * Helper to map entity type and ID to existing detail page route
   */
  resolveEntityRoute(entityType, entityId, module) {
    if (!entityId) return `/secure-kolmeks-x0y0/dashboard`;
    const typeLower = String(entityType || '').toLowerCase();

    if (typeLower.includes('customer')) return `/secure-kolmeks-x0y0/customers/${entityId}`;
    if (typeLower.includes('supplier')) return `/secure-kolmeks-x0y0/suppliers/${entityId}`;
    if (typeLower.includes('product')) return `/secure-kolmeks-x0y0/products/${entityId}`;
    if (typeLower.includes('sales_order') || typeLower.includes('salesorder')) return `/secure-kolmeks-x0y0/sales/orders/${entityId}`;
    if (typeLower.includes('purchase_order') || typeLower.includes('purchaseorder')) return `/secure-kolmeks-x0y0/procurement/orders/${entityId}`;
    if (typeLower.includes('production_order')) return `/secure-kolmeks-x0y0/production/orders/${entityId}`;
    if (typeLower.includes('quality') || typeLower.includes('inspection')) return `/secure-kolmeks-x0y0/quality/inspections/${entityId}`;
    if (typeLower.includes('work_order') || typeLower.includes('maintenance')) return `/secure-kolmeks-x0y0/maintenance/work-orders/${entityId}`;
    if (typeLower.includes('employee')) return `/secure-kolmeks-x0y0/employees/${entityId}`;
    if (typeLower.includes('document')) return `/secure-kolmeks-x0y0/documents/${entityId}`;
    if (typeLower.includes('workflow')) return `/secure-kolmeks-x0y0/workflows/instances/${entityId}`;

    return `/secure-kolmeks-x0y0/dashboard`;
  }
}

module.exports = new ActivityService();
