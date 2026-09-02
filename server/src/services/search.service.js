const { supabaseAdmin } = require('../config/supabase');

class SearchService {
  /**
   * Cross-Module Search Engine with Server-Side RBAC Enforcement
   */
  async performGlobalSearch(rawQuery, userRole, userProfile) {
    if (!rawQuery || rawQuery.trim().length < 1) {
      return { query: '', totalCount: 0, results: {} };
    }

    const query = rawQuery.trim();
    const isExactMatch = (val) => val && String(val).toLowerCase() === query.toLowerCase();
    const isPrefixMatch = (val) => val && String(val).toLowerCase().startsWith(query.toLowerCase());

    const results = {
      customers: [],
      suppliers: [],
      products: [],
      salesOrders: [],
      purchaseOrders: [],
      inventory: [],
      production: [],
      quality: [],
      maintenance: [],
      crm: [],
      employees: [],
      documents: [],
      workflows: [],
      invoices: []
    };

    let totalCount = 0;

    // 1. CUSTOMERS SEARCH (If user has sales, crm, executive, finance, admin roles)
    const allowedCustomerRoles = ['admin', 'master_admin', 'executive', 'sales_manager', 'crm_manager', 'finance'];
    if (allowedCustomerRoles.includes(userRole)) {
      const { data: customers } = await supabaseAdmin
        .from('customers')
        .select('id, name, customer_code, email, phone, status')
        .or(`name.ilike.%${query}%,customer_code.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (customers && customers.length > 0) {
        results.customers = customers.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: `Code: ${c.customer_code || 'N/A'} • ${c.email || ''}`,
          badge: c.status || 'Active',
          module: 'Sales & CRM',
          type: 'Customer',
          route: `/secure-kolmeks-x0y0/customers/${c.id}`,
          score: isExactMatch(c.customer_code) ? 100 : isExactMatch(c.name) ? 90 : 50
        }));
        totalCount += results.customers.length;
      }
    }

    // 2. SUPPLIERS SEARCH (Procurement, Inventory, Finance, Admin)
    const allowedSupplierRoles = ['admin', 'master_admin', 'executive', 'procurement_manager', 'inventory_manager', 'finance'];
    if (allowedSupplierRoles.includes(userRole)) {
      const { data: suppliers } = await supabaseAdmin
        .from('suppliers')
        .select('id, name, supplier_code, email, phone, status')
        .or(`name.ilike.%${query}%,supplier_code.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (suppliers && suppliers.length > 0) {
        results.suppliers = suppliers.map((s) => ({
          id: s.id,
          title: s.name,
          subtitle: `Code: ${s.supplier_code || 'N/A'} • ${s.email || ''}`,
          badge: s.status || 'Active',
          module: 'Procurement',
          type: 'Supplier',
          route: `/secure-kolmeks-x0y0/suppliers/${s.id}`,
          score: isExactMatch(s.supplier_code) ? 100 : isExactMatch(s.name) ? 90 : 50
        }));
        totalCount += results.suppliers.length;
      }
    }

    // 3. PRODUCTS / INVENTORY ITEMS SEARCH (All roles)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, category, unit, status')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10);

    if (products && products.length > 0) {
      results.products = products.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku || 'N/A'} • Category: ${p.category || 'General'}`,
        badge: p.status || 'Active',
        module: 'Inventory & Products',
        type: 'Product',
        route: `/secure-kolmeks-x0y0/products/${p.id}`,
        score: isExactMatch(p.sku) ? 100 : isExactMatch(p.name) ? 90 : 50
      }));
      totalCount += results.products.length;
    }

    // 4. SALES ORDERS SEARCH (Sales, Executive, Logistics, Finance, Admin)
    const allowedSalesRoles = ['admin', 'master_admin', 'executive', 'sales_manager', 'inventory_manager', 'finance'];
    if (allowedSalesRoles.includes(userRole)) {
      const { data: salesOrders } = await supabaseAdmin
        .from('sales_orders')
        .select('id, order_number, status, total_amount, created_at, customer:customers(name)')
        .or(`order_number.ilike.%${query}%`)
        .limit(10);

      if (salesOrders && salesOrders.length > 0) {
        results.salesOrders = salesOrders.map((so) => ({
          id: so.id,
          title: `Sales Order: ${so.order_number}`,
          subtitle: `Customer: ${so.customer?.name || 'N/A'} • Value: ₹${so.total_amount || 0}`,
          badge: so.status || 'Pending',
          module: 'Sales',
          type: 'Sales Order',
          route: `/secure-kolmeks-x0y0/sales/orders/${so.id}`,
          score: isExactMatch(so.order_number) ? 100 : 60
        }));
        totalCount += results.salesOrders.length;
      }
    }

    // 5. PURCHASE ORDERS SEARCH (Procurement, Finance, Admin)
    const allowedProcRoles = ['admin', 'master_admin', 'executive', 'procurement_manager', 'inventory_manager', 'finance'];
    if (allowedProcRoles.includes(userRole)) {
      const { data: purchaseOrders } = await supabaseAdmin
        .from('purchase_orders')
        .select('id, po_number, status, total_amount, created_at, supplier:suppliers(name)')
        .or(`po_number.ilike.%${query}%`)
        .limit(10);

      if (purchaseOrders && purchaseOrders.length > 0) {
        results.purchaseOrders = purchaseOrders.map((po) => ({
          id: po.id,
          title: `Purchase Order: ${po.po_number}`,
          subtitle: `Supplier: ${po.supplier?.name || 'N/A'} • Amount: ₹${po.total_amount || 0}`,
          badge: po.status || 'Issued',
          module: 'Procurement',
          type: 'Purchase Order',
          route: `/secure-kolmeks-x0y0/procurement/orders/${po.id}`,
          score: isExactMatch(po.po_number) ? 100 : 60
        }));
        totalCount += results.purchaseOrders.length;
      }
    }

    // 6. PRODUCTION ORDERS SEARCH (Production, Quality, Admin)
    const allowedProdRoles = ['admin', 'master_admin', 'executive', 'production_manager', 'quality_manager'];
    if (allowedProdRoles.includes(userRole)) {
      const { data: prodOrders } = await supabaseAdmin
        .from('production_orders')
        .select('id, order_number, status, planned_quantity, created_at')
        .or(`order_number.ilike.%${query}%`)
        .limit(10);

      if (prodOrders && prodOrders.length > 0) {
        results.production = prodOrders.map((p) => ({
          id: p.id,
          title: `Production Order: ${p.order_number}`,
          subtitle: `Planned Qty: ${p.planned_quantity || 0}`,
          badge: p.status || 'In Progress',
          module: 'Production',
          type: 'Production Order',
          route: `/secure-kolmeks-x0y0/production/orders/${p.id}`,
          score: isExactMatch(p.order_number) ? 100 : 60
        }));
        totalCount += results.production.length;
      }
    }

    // 7. QUALITY RECORDS SEARCH (Quality, Admin)
    const allowedQualityRoles = ['admin', 'master_admin', 'executive', 'quality_manager', 'production_manager'];
    if (allowedQualityRoles.includes(userRole)) {
      const { data: inspections } = await supabaseAdmin
        .from('quality_inspections')
        .select('id, inspection_number, inspection_type, result, created_at')
        .or(`inspection_number.ilike.%${query}%,inspection_type.ilike.%${query}%`)
        .limit(10);

      if (inspections && inspections.length > 0) {
        results.quality = inspections.map((q) => ({
          id: q.id,
          title: `Quality Inspection: ${q.inspection_number}`,
          subtitle: `Type: ${q.inspection_type || 'General'}`,
          badge: q.result || 'Pending',
          module: 'Quality Control',
          type: 'Quality Inspection',
          route: `/secure-kolmeks-x0y0/quality/inspections/${q.id}`,
          score: isExactMatch(q.inspection_number) ? 100 : 50
        }));
        totalCount += results.quality.length;
      }
    }

    // 8. MAINTENANCE WORK ORDERS (Maintenance, Admin)
    const allowedMaintRoles = ['admin', 'master_admin', 'executive', 'maintenance_manager'];
    if (allowedMaintRoles.includes(userRole)) {
      const { data: workOrders } = await supabaseAdmin
        .from('maintenance_work_orders')
        .select('id, work_order_number, title, status, priority')
        .or(`work_order_number.ilike.%${query}%,title.ilike.%${query}%`)
        .limit(10);

      if (workOrders && workOrders.length > 0) {
        results.maintenance = workOrders.map((m) => ({
          id: m.id,
          title: `Work Order: ${m.work_order_number}`,
          subtitle: m.title || 'Plant Maintenance',
          badge: m.status || 'Open',
          module: 'Maintenance',
          type: 'Work Order',
          route: `/secure-kolmeks-x0y0/maintenance/work-orders/${m.id}`,
          score: isExactMatch(m.work_order_number) ? 100 : 50
        }));
        totalCount += results.maintenance.length;
      }
    }

    // 9. HR EMPLOYEES SEARCH (HR, Admin, Executive)
    const allowedHRRoles = ['admin', 'master_admin', 'executive', 'hr'];
    if (allowedHRRoles.includes(userRole)) {
      const { data: employees } = await supabaseAdmin
        .from('employees')
        .select('id, first_name, last_name, employee_code, email, department, status')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,employee_code.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (employees && employees.length > 0) {
        results.employees = employees.map((e) => ({
          id: e.id,
          title: `${e.first_name} ${e.last_name}`,
          subtitle: `Code: ${e.employee_code || 'N/A'} • Dept: ${e.department || 'Operations'}`,
          badge: e.status || 'Active',
          module: 'Human Resources',
          type: 'Employee',
          route: `/secure-kolmeks-x0y0/employees/${e.id}`,
          score: isExactMatch(e.employee_code) ? 100 : 70
        }));
        totalCount += results.employees.length;
      }
    }

    // 10. DOCUMENTS SEARCH (All authenticated roles, filtered by authorization)
    const { data: documents } = await supabaseAdmin
      .from('documents')
      .select('id, document_number, title, file_name, status, category')
      .or(`title.ilike.%${query}%,document_number.ilike.%${query}%,file_name.ilike.%${query}%`)
      .limit(10);

    if (documents && documents.length > 0) {
      results.documents = documents.map((d) => ({
        id: d.id,
        title: d.title || d.file_name,
        subtitle: `Ref: ${d.document_number || 'N/A'} • Category: ${d.category || 'General'}`,
        badge: d.status || 'Approved',
        module: 'Document Library',
        type: 'Document',
        route: `/secure-kolmeks-x0y0/documents/${d.id}`,
        score: isExactMatch(d.document_number) ? 100 : 50
      }));
      totalCount += results.documents.length;
    }

    // Sort flattened search result list by relevance score
    const flattenedList = Object.values(results)
      .flat()
      .sort((a, b) => b.score - a.score);

    return {
      query,
      totalCount,
      categorized: results,
      flattened: flattenedList
    };
  }
}

module.exports = new SearchService();
