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
      .ilike('status', 'new');

    const { count: underReviewRfqs } = await supabaseAdmin
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'under_review');

    const { count: quotedRfqs } = await supabaseAdmin
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'quoted');

    const { count: closedRfqs } = await supabaseAdmin
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'closed');

    // 3. Query total and active products count
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: activeProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 4. Query total and active customers count
    const { count: totalCustomers } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true });

    const { count: activeCustomers } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 5. Query total and active suppliers count
    const { count: totalSuppliers } = await supabaseAdmin
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    const { count: activeSuppliers } = await supabaseAdmin
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 6. Query total and status counts for quotations
    const { count: totalQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true });

    const { count: draftQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'draft');

    const { count: underReviewQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'under_review');

    const { count: approvedQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'approved');

    const { count: sentQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'sent');

    const { count: acceptedQuotations } = await supabaseAdmin
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'accepted');

    // 7. Query Sales Orders Metrics
    const { count: totalSalesOrders } = await supabaseAdmin
      .from('sales_orders')
      .select('*', { count: 'exact', head: true });

    const { count: draftSalesOrders } = await supabaseAdmin
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'draft');

    const { count: confirmedSalesOrders } = await supabaseAdmin
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'confirmed');

    const { count: inProductionSalesOrders } = await supabaseAdmin
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'in_production');

    const { count: completedSalesOrders } = await supabaseAdmin
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'completed');

    // 8. Query recent 5 RFQs
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
        underReviewRfqs: underReviewRfqs || 0,
        quotedRfqs: quotedRfqs || 0,
        closedRfqs: closedRfqs || 0,
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        totalSuppliers: totalSuppliers || 0,
        activeSuppliers: activeSuppliers || 0,
        totalQuotations: totalQuotations || 0,
        draftQuotations: draftQuotations || 0,
        underReviewQuotations: underReviewQuotations || 0,
        approvedQuotations: approvedQuotations || 0,
        sentQuotations: sentQuotations || 0,
        acceptedQuotations: acceptedQuotations || 0,
        totalSalesOrders: totalSalesOrders || 0,
        draftSalesOrders: draftSalesOrders || 0,
        confirmedSalesOrders: confirmedSalesOrders || 0,
        inProductionSalesOrders: inProductionSalesOrders || 0,
        completedSalesOrders: completedSalesOrders || 0,
        activeQuotations: (approvedQuotations || 0) + (sentQuotations || 0),
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
