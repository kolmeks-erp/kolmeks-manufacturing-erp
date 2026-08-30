const { supabase, supabaseAdmin } = require('../config/supabase');

const DEFAULT_FEATURE_FLAGS = [
  { key: 'module_sales', label: 'Sales & Quotations', category: 'Sales', description: 'Controls RFQs, Quotations, Sales Orders, and Invoicing', is_enabled: true },
  { key: 'module_procurement', label: 'Procurement & Purchasing', category: 'Procurement', description: 'Controls Suppliers, Requisitions, Purchase Orders, and GRNs', is_enabled: true },
  { key: 'module_products', label: 'Products Master', category: 'Products', description: 'Controls Catalog Products, Categories, and BOM Materials', is_enabled: true },
  { key: 'module_inventory', label: 'Inventory & Warehouses', category: 'Inventory', description: 'Controls Inventory balances, Warehouses, and Stock Movements', is_enabled: true },
  { key: 'module_production', label: 'Production & Manufacturing', category: 'Production', description: 'Controls Production Orders, BOMs, Routings, and Work Centers', is_enabled: true },
  { key: 'module_quality', label: 'Quality Management', category: 'Quality', description: 'Controls Inspections, Plans, NCR, and Quality Holds', is_enabled: true },
  { key: 'module_maintenance', label: 'Maintenance & Asset Mgmt', category: 'Maintenance', description: 'Controls Equipment Assets, Maintenance Schedules, and Work Orders', is_enabled: true },
  { key: 'module_hr', label: 'HR & Operations', category: 'HR & Operations', description: 'Controls Employees, Attendance, Shifts, and Leaves', is_enabled: true },
  { key: 'module_finance', label: 'Finance & Accounting', category: 'Finance & Accounting', description: 'Controls Chart of Accounts, General Ledger, Accounts Payable/Receivable, and Budgets', is_enabled: true },
  { key: 'module_self_service', label: 'Employee Self-Service', category: 'Self Service', description: 'Controls Employee My HR self-service portal', is_enabled: true },
];

/**
 * 1. Get all system feature flags (Public / Authenticated)
 */
const getSystemFeatureFlags = async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    let { data, error } = await client
      .from('system_feature_flags')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      // Auto-seed default flags if table is empty or error occurs
      try {
        const seedResult = await client
          .from('system_feature_flags')
          .upsert(DEFAULT_FEATURE_FLAGS, { onConflict: 'key' })
          .select();

        if (!seedResult.error && seedResult.data) {
          data = seedResult.data;
        } else {
          data = DEFAULT_FEATURE_FLAGS;
        }
      } catch (seedErr) {
        data = DEFAULT_FEATURE_FLAGS;
      }
    }

    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getSystemFeatureFlags Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch system feature flags', error: err.message });
  }
};

/**
 * 2. Toggle module feature flag ON/OFF (Master Admin / Admin)
 */
const toggleFeatureFlag = async (req, res) => {
  try {
    const { key, is_enabled } = req.body;

    if (!key || typeof is_enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Module key and boolean is_enabled status are required.' });
    }

    const client = supabaseAdmin || supabase;
    const meta = DEFAULT_FEATURE_FLAGS.find((f) => f.key === key) || {};

    // Upsert feature flag with required non-null fields
    const { data, error } = await client
      .from('system_feature_flags')
      .upsert(
        {
          key,
          label: meta.label || key,
          category: meta.category || 'General',
          description: meta.description || '',
          is_enabled,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id || null,
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
      message: `Module "${key}" has been turned ${is_enabled ? 'ON' : 'OFF'}`,
    });
  } catch (err) {
    console.error('toggleFeatureFlag Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update module toggle', error: err.message });
  }
};

/**
 * 3. Get all user profiles for Master Admin access management
 */
const getUsersForAdminControl = async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        is_active,
        is_master_admin,
        created_at,
        role:roles(id, name, description)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getUsersForAdminControl Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
};

/**
 * 4. Toggle User Active Status (Enable / Disable User Account)
 */
const toggleUserActiveStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active boolean flag is required' });
    }

    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('profiles')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, email, full_name, is_active')
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
      message: `User account has been ${is_active ? 'enabled' : 'disabled'}`
    });
  } catch (err) {
    console.error('toggleUserActiveStatus Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user active status', error: err.message });
  }
};

module.exports = {
  getSystemFeatureFlags,
  toggleFeatureFlag,
  getUsersForAdminControl,
  toggleUserActiveStatus
};
