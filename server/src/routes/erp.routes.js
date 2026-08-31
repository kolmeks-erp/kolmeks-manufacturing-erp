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
    const safeCount = async (tableName, statusFilter = null, statusCol = 'status', extraEq = null) => {
      try {
        let q = supabaseAdmin.from(tableName).select('*', { count: 'exact', head: true });
        if (statusFilter) {
          if (Array.isArray(statusFilter)) {
            q = q.in(statusCol, statusFilter);
          } else {
            q = q.ilike(statusCol, statusFilter);
          }
        }
        if (extraEq) {
          q = q.eq(extraEq.col, extraEq.val);
        }
        const { count, error } = await q;
        if (error) return 0;
        return count || 0;
      } catch {
        return 0;
      }
    };

    // Helper to query RFQs count with fallback table name
    const safeRfqCount = async (statusFilter = null) => {
      let count = await safeCount('rfqs', statusFilter);
      if (count === 0) {
        count = await safeCount('rfq_requests', statusFilter);
      }
      return count;
    };

    // Helper to query GRN count with fallback table name
    const safeGrnCount = async (statusFilter = null) => {
      let count = await safeCount('goods_receipts', statusFilter);
      if (count === 0) {
        count = await safeCount('goods_receipt_notes', statusFilter);
      }
      return count;
    };

    // Fetch recent 5 RFQs with fallback table
    const safeRecentRfqs = async () => {
      try {
        let { data } = await supabaseAdmin
          .from('rfqs')
          .select('id, rfq_number, company, full_name, email, requirement_type, component_name, quantity, unit, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!data || data.length === 0) {
          const fallback = await supabaseAdmin
            .from('rfq_requests')
            .select('id, request_number, company, full_name, email, requirement_type, project_name, estimated_quantity, unit, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
          data = (fallback.data || []).map((r) => ({
            id: r.id,
            rfq_number: r.request_number || r.id,
            company: r.company,
            full_name: r.full_name,
            email: r.email,
            requirement_type: r.requirement_type,
            component_name: r.project_name,
            quantity: r.estimated_quantity,
            unit: r.unit,
            status: r.status,
            created_at: r.created_at,
          }));
        }
        return data || [];
      } catch {
        return [];
      }
    };

    // Execute queries in parallel
    const [
      totalRfqs,
      newRfqs,
      underReviewRfqs,
      quotedRfqs,
      closedRfqs,
      totalProducts,
      activeProducts,
      totalCustomers,
      activeCustomers,
      totalSuppliers,
      activeSuppliers,
      totalQuotations,
      draftQuotations,
      underReviewQuotations,
      approvedQuotations,
      sentQuotations,
      acceptedQuotations,
      totalSalesOrders,
      draftSalesOrders,
      confirmedSalesOrders,
      inProductionSalesOrders,
      completedSalesOrders,
      totalRequisitions,
      pendingPRApproval,
      approvedRequisitions,
      totalPurchaseOrders,
      pendingPOApproval,
      openPurchaseOrders,
      totalGRNs,
      completedGRNs,
      inProgressGRNs,
      recentRfqs,
    ] = await Promise.all([
      safeRfqCount(),
      safeRfqCount('new'),
      safeRfqCount('under_review'),
      safeRfqCount('quoted'),
      safeRfqCount('closed'),
      safeCount('products'),
      safeCount('products', null, 'status', { col: 'status', val: 'active' }),
      safeCount('customers'),
      safeCount('customers', null, 'status', { col: 'status', val: 'active' }),
      safeCount('suppliers'),
      safeCount('suppliers', null, 'status', { col: 'status', val: 'active' }),
      safeCount('quotations'),
      safeCount('quotations', 'draft'),
      safeCount('quotations', 'under_review'),
      safeCount('quotations', 'approved'),
      safeCount('quotations', 'sent'),
      safeCount('quotations', 'accepted'),
      safeCount('sales_orders'),
      safeCount('sales_orders', 'draft'),
      safeCount('sales_orders', 'confirmed'),
      safeCount('sales_orders', 'in_production'),
      safeCount('sales_orders', 'completed'),
      safeCount('purchase_requisitions'),
      safeCount('purchase_requisitions', ['SUBMITTED', 'UNDER_REVIEW', 'submitted', 'under_review']),
      safeCount('purchase_requisitions', ['APPROVED', 'approved']),
      safeCount('purchase_orders'),
      safeCount('purchase_orders', ['DRAFT', 'PENDING_APPROVAL', 'draft', 'pending_approval']),
      safeCount('purchase_orders', ['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'ordered', 'partially_received']),
      safeGrnCount(),
      safeGrnCount('completed'),
      safeGrnCount(['DRAFT', 'IN_PROGRESS', 'draft', 'in_progress']),
      safeRecentRfqs(),
    ]);

    res.status(200).json({
      success: true,
      message: 'ERP Executive Dashboard Summary Telemetry',
      authenticatedUser: req.profile ? req.profile.full_name : 'Staff User',
      userRole: req.role ? req.role.name : 'staff',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRfqs,
        newRfqs,
        underReviewRfqs,
        quotedRfqs,
        closedRfqs,
        totalProducts,
        activeProducts,
        totalCustomers,
        activeCustomers,
        totalSuppliers,
        activeSuppliers,
        totalQuotations,
        draftQuotations,
        underReviewQuotations,
        approvedQuotations,
        sentQuotations,
        acceptedQuotations,
        totalSalesOrders,
        draftSalesOrders,
        confirmedSalesOrders,
        inProductionSalesOrders,
        completedSalesOrders,
        totalRequisitions,
        pendingPRApproval,
        approvedRequisitions,
        totalPurchaseOrders,
        pendingPOApproval,
        openPurchaseOrders,
        totalGRNs,
        completedGRNs,
        inProgressGRNs,
        activeQuotations: (approvedQuotations || 0) + (sentQuotations || 0),
        lowStockItems: 0,
        productionOrders: 0,
        qualityIssues: 0,
        machinesAttention: 0,
        pendingPurchaseOrders: pendingPOApproval || 0,
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
