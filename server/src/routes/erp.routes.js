const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');
const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/erp/dashboard-summary
 * Accessible by all authenticated active ERP staff users
 * Returns live operational telemetry and real RFQ statistics
 */
router.get('/dashboard-summary', authenticateUser, async (req, res) => {
  try {
    // 1. Query total RFQ count
    const { count: totalRfqs, error: countError } = await supabaseAdmin
      .from('rfqs')
      .select('*', { count: 'exact', head: true });

    // 2. Query new RFQs count
    const { count: newRfqs, error: newCountError } = await supabaseAdmin
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    // 3. Query recent 5 RFQs
    const { data: recentRfqs, error: recentError } = await supabaseAdmin
      .from('rfqs')
      .select('id, rfq_number, company, full_name, email, requirement_type, component_name, quantity, unit, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (countError || newCountError || recentError) {
      console.warn('Database warning fetching ERP dashboard metrics:', countError || newCountError || recentError);
    }

    res.status(200).json({
      success: true,
      message: 'ERP Executive Dashboard Summary Telemetry',
      authenticatedUser: req.profile ? req.profile.full_name : 'Staff User',
      userRole: req.role ? req.role.name : 'staff',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRfqs: totalRfqs || 0,
        newRfqs: newRfqs || 0,
        activeQuotations: 0,
        openSalesOrders: 0,
        lowStockItems: 0,
        productionOrders: 0,
        qualityIssues: 0,
        machinesAttention: 0,
        pendingPurchaseOrders: 0,
      },
      recentRfqs: recentRfqs || [],
    });
  } catch (err) {
    console.error('Unhandled error in /api/erp/dashboard-summary:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Unable to retrieve dashboard summary telemetry.',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
});

/**
 * GET /api/erp/rfqs
 * Accessible by authenticated sales_manager and admin users
 */
router.get('/rfqs', authenticateUser, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  try {
    const { data: rfqs, error } = await supabaseAdmin
      .from('rfqs')
      .select('*, rfq_attachments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFQs list:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch quotation requests.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(200).json({
      success: true,
      count: rfqs ? rfqs.length : 0,
      data: rfqs || [],
    });
  } catch (err) {
    console.error('Unhandled error in GET /api/erp/rfqs:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal error fetching RFQs.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
});

/**
 * GET /api/erp/admin-only
 * Restricted strictly to users with 'admin' role
 */
router.get('/admin-only', authenticateUser, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted to Administrator security endpoint.',
    adminUser: req.profile ? req.profile.full_name : 'Admin',
    role: req.role,
  });
});

module.exports = router;
