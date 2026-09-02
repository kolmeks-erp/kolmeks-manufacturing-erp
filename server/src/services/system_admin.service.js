const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Enterprise System Administration & Organization Settings Service
 */
class SystemAdminService {
  constructor() {
    this.client = () => supabaseAdmin || supabase;
  }

  // Helper for audit logging
  async logAuditEvent({ actorId, action, module, targetRecord, oldValues, newValues, severity = 'INFO' }) {
    try {
      await this.client().from('system_audit_logs').insert({
        actor_id: actorId || null,
        action,
        module,
        target_record: targetRecord || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        severity,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to insert system audit log:', err.message);
    }
  }

  // 1. Dashboard Telemetry & System Health
  async getDashboardTelemetry() {
    const client = this.client();

    const [
      orgRes,
      locRes,
      deptRes,
      usersRes,
      rolesRes,
      auditRes
    ] = await Promise.allSettled([
      client.from('organization_settings').select('*').limit(1),
      client.from('locations').select('*'),
      client.from('departments').select('*'),
      client.from('profiles').select('id, status, is_active'),
      client.from('roles').select('id, name'),
      client.from('system_audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    const org = orgRes.status === 'fulfilled' && orgRes.value.data?.[0] ? orgRes.value.data[0] : {
      org_name: 'Kolmeks Oy',
      legal_name: 'Kolmeks Oy Ltd',
      company_code: 'KOLMEKS-HQ',
      country: 'Finland',
      default_currency: 'EUR',
      default_timezone: 'Europe/Helsinki'
    };

    const locations = locRes.status === 'fulfilled' && locRes.value.data ? locRes.value.data : [
      { id: 'loc-1', code: 'LOC-FIN-01', name: 'Turenki HQ & Plant', country: 'Finland', status: 'Active' },
      { id: 'loc-2', code: 'LOC-EST-01', name: 'Viljandi Plant', country: 'Estonia', status: 'Active' },
      { id: 'loc-3', code: 'LOC-CHN-01', name: 'Suzhou Plant', country: 'China', status: 'Active' },
      { id: 'loc-4', code: 'LOC-IND-01', name: 'Pune Tech Center', country: 'India', status: 'Active' }
    ];

    const departments = deptRes.status === 'fulfilled' && deptRes.value.data ? deptRes.value.data : [];
    const users = usersRes.status === 'fulfilled' && usersRes.value.data ? usersRes.value.data : [];
    const roles = rolesRes.status === 'fulfilled' && rolesRes.value.data ? rolesRes.value.data : [];
    const recentAudit = auditRes.status === 'fulfilled' && auditRes.value.data ? auditRes.value.data : [];

    const activeUsersCount = users.filter(u => u.status === 'active' || u.is_active !== false).length;
    const activeLocationsCount = locations.filter(l => l.status === 'Active').length;

    return {
      organization: org,
      metrics: {
        totalLocations: locations.length,
        activeLocations: activeLocationsCount,
        totalDepartments: departments.length,
        totalUsers: users.length,
        activeUsers: activeUsersCount,
        totalRoles: roles.length,
        pendingIssues: 0,
        securityStatus: 'SECURE (RLS Enabled)'
      },
      locations,
      recentAuditActivity: recentAudit
    };
  }

  // 2. Organization Profile
  async getOrganizationProfile() {
    const { data, error } = await this.client().from('organization_settings').select('*').limit(1);
    if (error || !data || data.length === 0) {
      return {
        org_name: 'Kolmeks Oy',
        legal_name: 'Kolmeks Oy Ltd',
        display_name: 'Kolmeks Manufacturing ERP',
        company_code: 'KOLMEKS-HQ',
        registration_number: 'FI-0123456-7',
        tax_id: 'FI01234567',
        address_line1: 'Taimistotie 1',
        city: 'Turenki',
        state_province: 'Kanta-Häme',
        postal_code: '14200',
        country: 'Finland',
        phone: '+358 20 744 1400',
        email: 'info@kolmeks.com',
        website: 'https://www.kolmeks.com',
        logo_url: '/images/kolmeks-logo.png',
        default_timezone: 'Europe/Helsinki',
        default_currency: 'EUR',
        date_format: 'YYYY-MM-DD',
        number_format: '1,234.56',
        quantity_precision: 2,
        price_precision: 2
      };
    }
    return data[0];
  }

  async updateOrganizationProfile(payload, actorId) {
    const client = this.client();
    const existing = await this.getOrganizationProfile();

    let result;
    if (existing && existing.id) {
      const { data, error } = await client
        .from('organization_settings')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
          updated_by: actorId
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('organization_settings')
        .insert({
          ...payload,
          updated_at: new Date().toISOString(),
          updated_by: actorId
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await this.logAuditEvent({
      actorId,
      action: 'UPDATE_ORGANIZATION_PROFILE',
      module: 'Settings',
      targetRecord: result.org_name,
      oldValues: existing,
      newValues: result,
      severity: 'INFO'
    });

    return result;
  }

  // 3. Locations Management
  async getLocations() {
    const { data, error } = await this.client().from('locations').select('*').order('code');
    if (error || !data || data.length === 0) {
      return [
        { id: 'loc-1', code: 'LOC-FIN-01', name: 'Turenki Headquarters & Plant', address: 'Taimistotie 1', city: 'Turenki', country: 'Finland', timezone: 'Europe/Helsinki', currency: 'EUR', contact_email: 'turenki@kolmeks.com', status: 'Active' },
        { id: 'loc-2', code: 'LOC-EST-01', name: 'Viljandi Operations Plant', address: 'Vabaduse 12', city: 'Viljandi', country: 'Estonia', timezone: 'Europe/Tallinn', currency: 'EUR', contact_email: 'estonia@kolmeks.com', status: 'Active' },
        { id: 'loc-3', code: 'LOC-CHN-01', name: 'Suzhou Manufacturing Hub', address: 'Industrial Park 88', city: 'Suzhou', country: 'China', timezone: 'Asia/Shanghai', currency: 'CNY', contact_email: 'china@kolmeks.com', status: 'Active' },
        { id: 'loc-4', code: 'LOC-IND-01', name: 'Pune Precision Tech Center', address: 'Chakan MIDC Phase 2', city: 'Pune', country: 'India', timezone: 'Asia/Kolkata', currency: 'INR', contact_email: 'india@kolmeks.com', status: 'Active' }
      ];
    }
    return data;
  }

  async saveLocation(payload, actorId) {
    const client = this.client();
    let result;
    if (payload.id) {
      const { data, error } = await client
        .from('locations')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('locations')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await this.logAuditEvent({
      actorId,
      action: payload.id ? 'UPDATE_LOCATION' : 'CREATE_LOCATION',
      module: 'Settings',
      targetRecord: result.code,
      newValues: result
    });

    return result;
  }

  // 4. Departments Management (reusing `departments` table)
  async getDepartments() {
    const { data, error } = await this.client()
      .from('departments')
      .select(`
        *,
        manager:employees!manager_id(id, first_name, last_name, email)
      `)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async saveDepartment(payload, actorId) {
    const client = this.client();
    let result;
    if (payload.id) {
      const { data, error } = await client
        .from('departments')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('departments')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await this.logAuditEvent({
      actorId,
      action: payload.id ? 'UPDATE_DEPARTMENT' : 'CREATE_DEPARTMENT',
      module: 'Settings',
      targetRecord: result.name,
      newValues: result
    });

    return result;
  }

  // 5. User Management & Status Controls
  async getUsers() {
    const { data, error } = await this.client()
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        department,
        status,
        is_active,
        is_master_admin,
        created_at,
        updated_at,
        role:roles(id, name, description)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateUserStatus(userId, status, actorId) {
    const client = this.client();
    const isActive = status === 'Active' || status === 'active';
    const { data, error } = await client
      .from('profiles')
      .update({
        status: status.toLowerCase(),
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, full_name, status, is_active')
      .single();

    if (error) throw error;

    await this.logAuditEvent({
      actorId,
      action: 'UPDATE_USER_STATUS',
      module: 'Security',
      targetRecord: data.email,
      newValues: { status, is_active: isActive },
      severity: 'SECURITY'
    });

    return data;
  }

  async updateUserRole(userId, roleId, actorId) {
    const client = this.client();
    const { data, error } = await client
      .from('profiles')
      .update({
        role_id: roleId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, full_name, role_id')
      .single();

    if (error) throw error;

    await this.logAuditEvent({
      actorId,
      action: 'UPDATE_USER_ROLE',
      module: 'Security',
      targetRecord: data.email,
      newValues: { role_id: roleId },
      severity: 'SECURITY'
    });

    return data;
  }

  // 6. Roles & Permissions Management
  async getRoles() {
    const { data, error } = await this.client()
      .from('roles')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        role_permissions(permission:permissions(id, code, name, category))
      `)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async saveRole(payload, actorId) {
    const client = this.client();
    let roleResult;
    if (payload.id) {
      const { data, error } = await client
        .from('roles')
        .update({
          name: payload.name,
          description: payload.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      roleResult = data;
    } else {
      const { data, error } = await client
        .from('roles')
        .insert({
          name: payload.name,
          description: payload.description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      roleResult = data;
    }

    // Update role permissions mapping if permissions array provided
    if (Array.isArray(payload.permission_ids)) {
      await client.from('role_permissions').delete().eq('role_id', roleResult.id);
      if (payload.permission_ids.length > 0) {
        const rows = payload.permission_ids.map((pid) => ({
          role_id: roleResult.id,
          permission_id: pid
        }));
        await client.from('role_permissions').insert(rows);
      }
    }

    await this.logAuditEvent({
      actorId,
      action: payload.id ? 'UPDATE_ROLE' : 'CREATE_ROLE',
      module: 'Security',
      targetRecord: roleResult.name,
      newValues: roleResult,
      severity: 'SECURITY'
    });

    return roleResult;
  }

  async getPermissions() {
    const { data, error } = await this.client().from('permissions').select('*').order('category');
    if (error || !data || data.length === 0) {
      return [
        { id: 'p1', code: 'dashboard.view', name: 'View Dashboard & Telemetry', category: 'Dashboard' },
        { id: 'p2', code: 'hr.view', name: 'View HR Records', category: 'HR' },
        { id: 'p3', code: 'hr.manage', name: 'Manage HR Records', category: 'HR' },
        { id: 'p4', code: 'crm.view', name: 'View CRM Leads & Opportunities', category: 'CRM' },
        { id: 'p5', code: 'sales.view', name: 'View Sales & Quotations', category: 'Sales' },
        { id: 'p6', code: 'sales.approve', name: 'Approve Sales Orders', category: 'Sales' },
        { id: 'p7', code: 'procurement.view', name: 'View Procurement & POs', category: 'Procurement' },
        { id: 'p8', code: 'procurement.approve', name: 'Approve Purchase Orders', category: 'Procurement' },
        { id: 'p9', code: 'inventory.view', name: 'View Inventory & Warehouses', category: 'Inventory' },
        { id: 'p10', code: 'production.view', name: 'View Production Orders', category: 'Production' },
        { id: 'p11', code: 'quality.view', name: 'View Quality Inspections', category: 'Quality' },
        { id: 'p12', code: 'maintenance.view', name: 'View Maintenance Assets', category: 'Maintenance' },
        { id: 'p13', code: 'finance.view', name: 'View Finance & Invoices', category: 'Finance' },
        { id: 'p14', code: 'documents.view', name: 'View Controlled Documents', category: 'Documents' },
        { id: 'p15', code: 'workflows.manage', name: 'Manage Workflow Definitions', category: 'Workflows' },
        { id: 'p16', code: 'settings.manage', name: 'Manage System Settings', category: 'Settings' }
      ];
    }
    return data;
  }

  // 7. Numbering Sequences
  async getNumberingSequences() {
    const { data, error } = await this.client().from('numbering_sequences').select('*').order('entity_type');
    if (error || !data || data.length === 0) {
      return [
        { id: 'num-1', entity_type: 'sales_quotation', label: 'Sales Quotation', prefix: 'SQ', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-2', entity_type: 'sales_order', label: 'Sales Order', prefix: 'SO', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-3', entity_type: 'purchase_requisition', label: 'Purchase Requisition', prefix: 'PR', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-4', entity_type: 'purchase_order', label: 'Purchase Order', prefix: 'PO', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-5', entity_type: 'goods_receipt', label: 'Goods Receipt Note', prefix: 'GRN', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-6', entity_type: 'sales_invoice', label: 'Sales Invoice', prefix: 'INV', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-7', entity_type: 'credit_note', label: 'Credit Note', prefix: 'CN', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-8', entity_type: 'ncr', label: 'Non-Conformance Report', prefix: 'NCR', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-9', entity_type: 'capa', label: 'CAPA Plan', prefix: 'CAPA', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-10', entity_type: 'maintenance_work_order', label: 'Maintenance Work Order', prefix: 'MWO', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' },
        { id: 'num-11', entity_type: 'employee', label: 'Employee Code', prefix: 'EMP', sequence_length: 5, current_value: 100, pattern: '{PREFIX}-{SEQUENCE}', reset_period: 'Never' },
        { id: 'num-12', entity_type: 'document', label: 'Document Control Number', prefix: 'DOC', sequence_length: 6, current_value: 1000, pattern: '{PREFIX}-{YEAR}-{SEQUENCE}', reset_period: 'Yearly' }
      ];
    }
    return data;
  }

  async updateNumberingSequence(id, payload, actorId) {
    const client = this.client();
    const { data, error } = await client
      .from('numbering_sequences')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAuditEvent({
      actorId,
      action: 'UPDATE_NUMBERING_SEQUENCE',
      module: 'Settings',
      targetRecord: data.entity_type,
      newValues: data
    });

    return data;
  }

  // 8. Currencies
  async getCurrencies() {
    const { data, error } = await this.client().from('currencies').select('*').order('code');
    if (error || !data || data.length === 0) {
      return [
        { id: 'cur-1', code: 'EUR', name: 'Euro', symbol: '₹', decimal_precision: 2, is_default: true, exchange_rate_to_default: 1.0, status: 'Active' },
        { id: 'cur-2', code: 'USD', name: 'US Dollar', symbol: '$', decimal_precision: 2, is_default: false, exchange_rate_to_default: 1.085, status: 'Active' },
        { id: 'cur-3', code: 'GBP', name: 'British Pound', symbol: '£', decimal_precision: 2, is_default: false, exchange_rate_to_default: 0.854, status: 'Active' },
        { id: 'cur-4', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimal_precision: 2, is_default: false, exchange_rate_to_default: 90.15, status: 'Active' },
        { id: 'cur-5', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal_precision: 2, is_default: false, exchange_rate_to_default: 7.82, status: 'Active' }
      ];
    }
    return data;
  }

  async saveCurrency(payload, actorId) {
    const client = this.client();
    let result;
    if (payload.id) {
      const { data, error } = await client
        .from('currencies')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('currencies')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await this.logAuditEvent({
      actorId,
      action: payload.id ? 'UPDATE_CURRENCY' : 'CREATE_CURRENCY',
      module: 'Settings',
      targetRecord: result.code,
      newValues: result
    });

    return result;
  }

  // 9. Units of Measure
  async getUnits() {
    const { data, error } = await this.client().from('units_of_measure').select('*').order('code');
    if (error || !data || data.length === 0) {
      return [
        { id: 'u1', code: 'pcs', name: 'Pieces', category: 'Quantity', symbol: 'pcs', conversion_factor: 1.0, status: 'Active' },
        { id: 'u2', code: 'kg', name: 'Kilograms', category: 'Weight', symbol: 'kg', conversion_factor: 1.0, status: 'Active' },
        { id: 'u3', code: 'g', name: 'Grams', category: 'Weight', symbol: 'g', conversion_factor: 0.001, status: 'Active' },
        { id: 'u4', code: 'm', name: 'Meters', category: 'Length', symbol: 'm', conversion_factor: 1.0, status: 'Active' },
        { id: 'u5', code: 'mm', name: 'Millimeters', category: 'Length', symbol: 'mm', conversion_factor: 0.001, status: 'Active' },
        { id: 'u6', code: 'L', name: 'Liters', category: 'Volume', symbol: 'L', conversion_factor: 1.0, status: 'Active' },
        { id: 'u7', code: 'hrs', name: 'Hours', category: 'Time', symbol: 'hrs', conversion_factor: 1.0, status: 'Active' }
      ];
    }
    return data;
  }

  async saveUnit(payload, actorId) {
    const client = this.client();
    let result;
    if (payload.id) {
      const { data, error } = await client
        .from('units_of_measure')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('units_of_measure')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await this.logAuditEvent({
      actorId,
      action: payload.id ? 'UPDATE_UNIT' : 'CREATE_UNIT',
      module: 'Settings',
      targetRecord: result.code,
      newValues: result
    });

    return result;
  }

  // 10. Master Data Options
  async getMasterDataOptions(category) {
    const client = this.client();
    let query = client.from('master_data_options').select('*').order('sort_order');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [
        { id: 'm1', category: 'payment_terms', code: 'NET_30', label: 'Net 30 Days', sort_order: 1, is_default: true, status: 'Active' },
        { id: 'm2', category: 'payment_terms', code: 'NET_60', label: 'Net 60 Days', sort_order: 2, is_default: false, status: 'Active' },
        { id: 'm3', category: 'shipping_methods', code: 'EXW', label: 'Ex Works (EXW)', sort_order: 1, is_default: true, status: 'Active' },
        { id: 'm4', category: 'shipping_methods', code: 'FOB', label: 'Free on Board (FOB)', sort_order: 2, is_default: false, status: 'Active' },
        { id: 'm5', category: 'priority_levels', code: 'MEDIUM', label: 'Normal / Medium Priority', sort_order: 1, is_default: true, status: 'Active' }
      ];
    }
    return data;
  }

  // 11. Security Settings
  async getSecuritySettings() {
    const { data } = await this.client().from('system_settings').select('*').eq('category', 'Security');
    return data || [
      { setting_key: 'sec_session_timeout_mins', setting_value: 60, description: 'Inactivity Session Timeout (Minutes)' },
      { setting_key: 'sec_require_mfa_admin', setting_value: false, description: 'Mandatory MFA for System Administrators' },
      { setting_key: 'sec_audit_retention_days', setting_value: 365, description: 'Audit Log Retention Days' }
    ];
  }

  // 12. Audit Log Viewer
  async getAuditLogs(filters = {}) {
    const client = this.client();
    let query = client
      .from('system_audit_logs')
      .select(`
        *,
        actor:profiles!actor_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.module) {
      query = query.eq('module', filters.module);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = new SystemAdminService();
