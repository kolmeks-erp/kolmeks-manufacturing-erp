const { supabaseAdmin, supabase } = require('../config/supabase');

class ReportsService {
  getClient() {
    return supabaseAdmin || supabase;
  }

  // Parse standard date range filters into Start and End timestamps
  getDateBounds(range, customStartDate, customEndDate) {
    const now = new Date();
    let startDate = new Date(0); // Epoch start by default
    let endDate = new Date();

    if (range === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (range === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      startDate = new Date(y.setHours(0, 0, 0, 0));
      endDate = new Date(y.setHours(23, 59, 59, 999));
    } else if (range === 'last_7_days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'last_30_days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'previous_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (range === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
    } else if (range === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    }

    return {
      startDateStr: startDate.toISOString(),
      endDateStr: endDate.toISOString()
    };
  }

  // 1. EXECUTIVE DASHBOARD KPIS
  async getExecutiveDashboard(filters = {}) {
    const client = this.getClient();
    const { startDateStr, endDateStr } = this.getDateBounds(filters.date_range, filters.start_date, filters.end_date);

    // Run parallel queries across modules for real metrics
    const [
      salesRes,
      openOrdersRes,
      poRes,
      invRes,
      prodRes,
      qualityRes,
      maintRes,
      wfTasksRes
    ] = await Promise.all([
      client.from('sales_orders').select('total_amount').gte('created_at', startDateStr).lte('created_at', endDateStr),
      client.from('sales_orders').select('id', { count: 'exact' }).in('status', ['draft', 'pending', 'approved', 'in_progress', 'processing']),
      client.from('purchase_orders').select('total_amount').not('status', 'in', '("cancelled","closed")'),
      client.from('products').select('stock_quantity, unit_cost, unit_price'),
      client.from('production_orders').select('id', { count: 'exact' }).in('status', ['released', 'in_progress']),
      client.from('quality_inspections').select('id', { count: 'exact' }).eq('status', 'failed'),
      client.from('maintenance_work_orders').select('id', { count: 'exact' }).lt('due_date', new Date().toISOString()).not('status', 'in', '("completed","closed")'),
      client.from('workflow_tasks').select('id', { count: 'exact' }).eq('status', 'pending')
    ]);

    const totalSales = (salesRes.data || []).reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const purchaseCommitments = (poRes.data || []).reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const inventoryValue = (invRes.data || []).reduce((sum, item) => sum + (Number(item.stock_quantity || 0) * Number(item.unit_cost || item.unit_price || 0)), 0);

    return {
      totalSales,
      openOrdersCount: openOrdersRes.count || (openOrdersRes.data ? openOrdersRes.data.length : 0),
      purchaseCommitments,
      inventoryValue,
      productionOrdersCount: prodRes.count || (prodRes.data ? prodRes.data.length : 0),
      qualityIssuesCount: qualityRes.count || (qualityRes.data ? qualityRes.data.length : 0),
      maintenanceOverdueCount: maintRes.count || (maintRes.data ? maintRes.data.length : 0),
      pendingApprovalsCount: wfTasksRes.count || (wfTasksRes.data ? wfTasksRes.data.length : 0)
    };
  }

  // 2. SALES REPORT
  async getSalesReport(filters = {}) {
    const client = this.getClient();
    const { startDateStr, endDateStr } = this.getDateBounds(filters.date_range, filters.start_date, filters.end_date);

    let query = client.from('sales_orders').select('*, customer:customers(name)');
    if (filters.date_range && filters.date_range !== 'all') {
      query = query.gte('created_at', startDateStr).lte('created_at', endDateStr);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    const { data: orders = [], error } = await query.order('created_at', { ascending: false });
    if (error) console.error('Sales report query error:', error);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const openOrders = orders.filter(o => ['draft', 'pending', 'approved', 'in_progress'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status)).length;

    // Monthly aggregation
    const monthlyMap = {};
    orders.forEach(o => {
      const month = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyMap[month] = (monthlyMap[month] || 0) + Number(o.total_amount || 0);
    });
    const monthlyChart = Object.keys(monthlyMap).map(m => ({ period: m, revenue: monthlyMap[m] }));

    // Customer aggregation
    const custMap = {};
    orders.forEach(o => {
      const name = o.customer?.name || 'Standard Client';
      custMap[name] = (custMap[name] || 0) + Number(o.total_amount || 0);
    });
    const customerChart = Object.keys(custMap).map(c => ({ name: c, revenue: custMap[c] })).sort((a, b) => b.revenue - a.revenue).slice(0, 7);

    return {
      metrics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        openOrders,
        deliveredOrders,
        returnsCount: 0,
        creditNotesTotal: 0
      },
      monthlyChart,
      customerChart,
      ordersTable: orders.slice(0, 50)
    };
  }

  // 3. PROCUREMENT REPORT
  async getProcurementReport(filters = {}) {
    const client = this.getClient();
    const { startDateStr, endDateStr } = this.getDateBounds(filters.date_range, filters.start_date, filters.end_date);

    let query = client.from('purchase_orders').select('*, supplier:suppliers(name)');
    if (filters.date_range && filters.date_range !== 'all') {
      query = query.gte('created_at', startDateStr).lte('created_at', endDateStr);
    }
    if (filters.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }

    const { data: pos = [] } = await query.order('created_at', { ascending: false });

    const totalSpend = pos.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const openPOs = pos.filter(p => ['draft', 'issued', 'sent', 'partial'].includes(p.status)).length;
    const completedPOs = pos.filter(p => ['received', 'closed', 'completed'].includes(p.status)).length;

    const suppMap = {};
    pos.forEach(p => {
      const name = p.supplier?.name || 'Primary Supplier';
      suppMap[name] = (suppMap[name] || 0) + Number(p.total_amount || 0);
    });
    const supplierChart = Object.keys(suppMap).map(s => ({ name: s, spend: suppMap[s] })).sort((a, b) => b.spend - a.spend).slice(0, 7);

    return {
      metrics: {
        totalSpend,
        totalPOs: pos.length,
        openPOs,
        completedPOs,
        pendingReceipts: openPOs
      },
      supplierChart,
      ordersTable: pos.slice(0, 50)
    };
  }

  // 4. INVENTORY REPORT
  async getInventoryReport(filters = {}) {
    const client = this.getClient();

    let query = client.from('products').select('*');
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const [productsRes, warehousesRes] = await Promise.all([
      query,
      client.from('warehouses').select('*')
    ]);

    const products = productsRes.data || [];
    const warehouses = warehousesRes.data || [];

    const totalItems = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + Number(p.stock_quantity || 0), 0);
    const totalValuation = products.reduce((sum, p) => sum + (Number(p.stock_quantity || 0) * Number(p.unit_cost || p.unit_price || 0)), 0);
    const lowStockItems = products.filter(p => Number(p.stock_quantity || 0) <= Number(p.reorder_level || p.min_stock || 10)).length;

    return {
      metrics: {
        totalItems,
        totalQuantity,
        totalValuation,
        lowStockItems,
        warehouseCount: warehouses.length
      },
      productsTable: products.slice(0, 50),
      warehousesTable: warehouses
    };
  }

  // 5. PRODUCTION REPORT
  async getProductionReport(filters = {}) {
    const client = this.getClient();
    const { startDateStr, endDateStr } = this.getDateBounds(filters.date_range, filters.start_date, filters.end_date);

    const { data: orders = [] } = await client.from('production_orders').select('*').order('created_at', { ascending: false });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const inProgressOrders = orders.filter(o => ['released', 'in_progress'].includes(o.status)).length;
    const delayedOrders = orders.filter(o => o.due_date && new Date(o.due_date) < new Date() && o.status !== 'completed').length;

    return {
      metrics: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        delayedOrders
      },
      ordersTable: orders.slice(0, 50)
    };
  }

  // 6. QUALITY REPORT
  async getQualityReport(filters = {}) {
    const client = this.getClient();

    const [inspectionsRes, ncrRes, capaRes] = await Promise.all([
      client.from('quality_inspections').select('*'),
      client.from('ncrs').select('*'),
      client.from('capas').select('*')
    ]);

    const inspections = inspectionsRes.data || [];
    const ncrs = ncrRes.data || [];
    const capas = capaRes.data || [];

    const totalInspections = inspections.length;
    const passedCount = inspections.filter(i => i.status === 'passed' || i.result === 'Pass').length;
    const failedCount = inspections.filter(i => i.status === 'failed' || i.result === 'Fail').length;

    return {
      metrics: {
        totalInspections,
        passedCount,
        failedCount,
        ncrCount: ncrs.length,
        openCAPA: capas.filter(c => c.status !== 'closed').length
      },
      inspectionsTable: inspections.slice(0, 50)
    };
  }

  // 7. MAINTENANCE REPORT
  async getMaintenanceReport(filters = {}) {
    const client = this.getClient();

    const [workOrdersRes, assetsRes] = await Promise.all([
      client.from('maintenance_work_orders').select('*, asset:maintenance_assets(name)'),
      client.from('maintenance_assets').select('*')
    ]);

    const workOrders = workOrdersRes.data || [];
    const assets = assetsRes.data || [];

    const openWorkOrders = workOrders.filter(w => ['open', 'in_progress', 'scheduled'].includes(w.status)).length;
    const completedWorkOrders = workOrders.filter(w => ['completed', 'closed'].includes(w.status)).length;
    const overdueWorkOrders = workOrders.filter(w => w.due_date && new Date(w.due_date) < new Date() && !['completed', 'closed'].includes(w.status)).length;

    return {
      metrics: {
        totalWorkOrders: workOrders.length,
        openWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        activeAssetsCount: assets.length
      },
      workOrdersTable: workOrders.slice(0, 50)
    };
  }

  // 8. HR REPORT
  async getHRReport(filters = {}) {
    const client = this.getClient();

    const [empRes, deptRes, leaveRes] = await Promise.all([
      client.from('employees').select('*, department:departments(name)'),
      client.from('departments').select('*'),
      client.from('leave_requests').select('*')
    ]);

    const employees = empRes.data || [];
    const departments = deptRes.data || [];
    const leaveRequests = leaveRes.data || [];

    const activeEmployees = employees.filter(e => e.status !== 'inactive').length;
    const deptHeadcount = departments.map(d => {
      const count = employees.filter(e => e.department_id === d.id || e.department?.name === d.name).length;
      return { department: d.name, headcount: count };
    });

    return {
      metrics: {
        totalEmployees: employees.length,
        activeEmployees,
        departmentCount: departments.length,
        leaveRequestsCount: leaveRequests.length
      },
      deptHeadcount,
      employeesTable: employees.slice(0, 50)
    };
  }

  // 9. FINANCE REPORT
  async getFinanceReport(filters = {}) {
    const client = this.getClient();

    const [recRes, payRes, expRes] = await Promise.all([
      client.from('customer_invoices').select('total_amount, status'),
      client.from('supplier_invoices').select('total_amount, status'),
      client.from('expense_claims').select('amount, status')
    ]);

    const receivables = (recRes.data || []).reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const payables = (payRes.data || []).reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const expenses = (expRes.data || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      metrics: {
        receivables,
        payables,
        expenses,
        outstandingCustomerInvoices: (recRes.data || []).filter(r => r.status !== 'paid').length,
        outstandingSupplierBills: (payRes.data || []).filter(p => p.status !== 'paid').length
      }
    };
  }

  // 10. CRM REPORT
  async getCRMReport(filters = {}) {
    const client = this.getClient();

    const [leadsRes, oppsRes] = await Promise.all([
      client.from('leads').select('*'),
      client.from('crm_opportunities').select('*')
    ]);

    const leads = leadsRes.data || [];
    const opps = oppsRes.data || [];

    const totalLeads = leads.length;
    const totalOpps = opps.length;
    const pipelineValue = opps.reduce((sum, o) => sum + Number(o.expected_revenue || o.amount || 0), 0);
    const wonCount = opps.filter(o => o.stage === 'won' || o.stage === 'Closed Won').length;
    const lostCount = opps.filter(o => o.stage === 'lost' || o.stage === 'Closed Lost').length;

    return {
      metrics: {
        totalLeads,
        totalOpps,
        pipelineValue,
        wonCount,
        lostCount
      },
      oppsTable: opps.slice(0, 50)
    };
  }

  // 11. DOCUMENT REPORT
  async getDocumentReport(filters = {}) {
    const client = this.getClient();

    const { data: docs = [] } = await client.from('documents').select('*');

    const totalDocs = docs.length;
    const pendingApproval = docs.filter(d => d.status === 'pending_approval' || d.approval_status === 'pending').length;
    const expiringSoon = docs.filter(d => {
      if (!d.expiration_date) return false;
      const diffDays = (new Date(d.expiration_date) - new Date()) / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 30;
    }).length;
    const expired = docs.filter(d => d.expiration_date && new Date(d.expiration_date) < new Date()).length;

    return {
      metrics: {
        totalDocs,
        pendingApproval,
        expiringSoon,
        expired
      },
      docsTable: docs.slice(0, 50)
    };
  }

  // 12. WORKFLOW REPORT
  async getWorkflowReport(filters = {}) {
    const client = this.getClient();

    const [instancesRes, tasksRes] = await Promise.all([
      client.from('workflow_instances').select('*'),
      client.from('workflow_tasks').select('*')
    ]);

    const instances = instancesRes.data || [];
    const tasks = tasksRes.data || [];

    const activeWorkflows = instances.filter(i => i.status === 'in_progress' || i.status === 'pending').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedWorkflows = instances.filter(i => i.status === 'approved' || i.status === 'completed').length;
    const rejectedWorkflows = instances.filter(i => i.status === 'rejected').length;

    return {
      metrics: {
        activeWorkflows,
        pendingTasks,
        completedWorkflows,
        rejectedWorkflows
      },
      instancesTable: instances.slice(0, 50)
    };
  }

  // 13. AUDIT REPORT
  async getAuditReport(filters = {}) {
    const client = this.getClient();

    const { data: logs = [] } = await client.from('system_audit_logs').select('*, actor:profiles(full_name, email)').order('created_at', { ascending: false }).limit(100);

    const totalLogs = logs.length;
    const securityEvents = logs.filter(l => l.severity === 'SECURITY' || l.severity === 'CRITICAL').length;

    return {
      metrics: {
        totalLogs,
        securityEvents
      },
      logsTable: logs
    };
  }

  // 14. SAVED REPORTS & SCHEDULES CRUD
  async getSavedReports(userId) {
    const client = this.getClient();
    const { data, error } = await client.from('saved_reports').select('*').or(`user_id.eq.${userId},is_shared.eq.true`).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSavedReport(userId, payload) {
    const client = this.getClient();
    const { data, error } = await client.from('saved_reports').insert({
      user_id: userId,
      name: payload.name,
      report_type: payload.report_type,
      filters: payload.filters || {},
      grouping: payload.grouping,
      sorting: payload.sorting || {},
      visible_columns: payload.visible_columns || [],
      is_shared: payload.is_shared || false
    }).select().single();

    if (error) throw error;
    return data;
  }

  async deleteSavedReport(userId, id) {
    const client = this.getClient();
    const { error } = await client.from('saved_reports').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  }

  async getReportSchedules(userId) {
    const client = this.getClient();
    const { data, error } = await client.from('report_schedules').select('*, saved_report:saved_reports(name)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createReportSchedule(userId, payload) {
    const client = this.getClient();
    const { data, error } = await client.from('report_schedules').insert({
      user_id: userId,
      saved_report_id: payload.saved_report_id || null,
      report_type: payload.report_type,
      frequency: payload.frequency || 'weekly',
      recipients: payload.recipients || [],
      format: payload.format || 'csv',
      is_active: payload.is_active !== false
    }).select().single();

    if (error) throw error;
    return data;
  }

  async deleteReportSchedule(userId, id) {
    const client = this.getClient();
    const { error } = await client.from('report_schedules').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  }
}

module.exports = new ReportsService();
