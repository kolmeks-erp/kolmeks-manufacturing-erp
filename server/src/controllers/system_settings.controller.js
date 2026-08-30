const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * 1. Get all system feature flags (Public / Authenticated)
 */
const getSystemFeatureFlags = async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('system_feature_flags')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.warn('System feature flags fetch error (using fallback defaults):', error.message);
      // Return default flags if table doesn't exist yet
      return res.json({
        success: true,
        data: [
          { key: 'module_sales', label: 'Sales & Quotations', category: 'Sales', is_enabled: true },
          { key: 'module_procurement', label: 'Procurement & Purchasing', category: 'Procurement', is_enabled: true },
          { key: 'module_products', label: 'Products Master', category: 'Products', is_enabled: true },
          { key: 'module_inventory', label: 'Inventory & Warehouses', category: 'Inventory', is_enabled: true },
          { key: 'module_production', label: 'Production & Manufacturing', category: 'Production', is_enabled: true },
          { key: 'module_quality', label: 'Quality Management', category: 'Quality', is_enabled: true },
          { key: 'module_maintenance', label: 'Maintenance & Asset Mgmt', category: 'Maintenance', is_enabled: true },
          { key: 'module_hr', label: 'HR & Operations', category: 'HR & Operations', is_enabled: true },
          { key: 'module_finance', label: 'Finance & Accounting', category: 'Finance & Accounting', is_enabled: true },
          { key: 'module_self_service', label: 'Employee Self-Service', category: 'Self Service', is_enabled: true },
        ]
      });
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

    // Upsert feature flag
    const { data, error } = await client
      .from('system_feature_flags')
      .upsert({
        key,
        is_enabled,
        updated_at: new Date().toISOString(),
        updated_by: req.user?.id || null
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
      message: `Module "${key}" has been turned ${is_enabled ? 'ON' : 'OFF'}`
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
