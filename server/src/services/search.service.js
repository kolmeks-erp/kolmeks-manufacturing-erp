const { supabaseAdmin } = require('../config/supabase');

class SearchService {
  /**
   * Universal Cross-Module ERP Search Engine
   * Queries real PostgreSQL database tables matching exact schema definitions.
   * Safe execution with per-module error isolation.
   */
  async performGlobalSearch(rawQuery, userRole, userProfile) {
    if (!rawQuery || rawQuery.trim().length < 1) {
      return { query: '', totalCount: 0, results: {}, flattened: [] };
    }

    const query = rawQuery.trim();
    const isExactMatch = (val) => val && String(val).toLowerCase() === query.toLowerCase();

    const results = {
      products: [],
      materials: [],
      customers: [],
      suppliers: [],
      salesOrders: [],
      purchaseOrders: [],
      production: [],
      quality: [],
      machines: [],
      warehouses: [],
      rfqs: [],
      profiles: [],
      news: [],
      categories: [],
      documents: []
    };

    let totalCount = 0;

    // 1. PRODUCTS SEARCH
    try {
      const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('id, name, product_code, product_type, unit, drawing_number, status, material')
        .or(`name.ilike.%${query}%,product_code.ilike.%${query}%,material.ilike.%${query}%,drawing_number.ilike.%${query}%`)
        .limit(10);

      if (!error && products && products.length > 0) {
        results.products = products.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `Code/SKU: ${p.product_code || 'N/A'} • Material: ${p.material || p.product_type || 'Component'}`,
          badge: p.status || 'Active',
          module: 'Products & Inventory',
          type: 'Product',
          route: `/secure-kolmeks-x0y0/products/${p.id}`,
          score: isExactMatch(p.product_code) ? 100 : isExactMatch(p.name) ? 90 : 60
        }));
        totalCount += results.products.length;
      }
    } catch (err) {
      console.error('Products search error:', err.message);
    }

    // 2. MATERIALS SEARCH
    try {
      const { data: materials, error } = await supabaseAdmin
        .from('materials')
        .select('id, material_code, name, type, grade, unit, status')
        .or(`name.ilike.%${query}%,material_code.ilike.%${query}%,type.ilike.%${query}%,grade.ilike.%${query}%`)
        .limit(10);

      if (!error && materials && materials.length > 0) {
        results.materials = materials.map((m) => ({
          id: m.id,
          title: m.name,
          subtitle: `Code: ${m.material_code || 'N/A'} • Type: ${m.type || 'Raw Material'} (${m.grade || ''})`,
          badge: m.status || 'Active',
          module: 'Products & Inventory',
          type: 'Material',
          route: `/secure-kolmeks-x0y0/materials`,
          score: isExactMatch(m.material_code) ? 100 : isExactMatch(m.name) ? 90 : 60
        }));
        totalCount += results.materials.length;
      }
    } catch (err) {
      console.error('Materials search error:', err.message);
    }

    // 3. CUSTOMERS SEARCH (B2B Clients)
    const allowedCustomerRoles = ['admin', 'master_admin', 'executive', 'sales_manager', 'crm_manager', 'finance', 'staff'];
    if (allowedCustomerRoles.includes(userRole)) {
      try {
        const { data: customers, error } = await supabaseAdmin
          .from('customers')
          .select('id, company_name, customer_code, contact_person, email, phone, country, status')
          .or(`company_name.ilike.%${query}%,customer_code.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(10);

        if (!error && customers && customers.length > 0) {
          results.customers = customers.map((c) => ({
            id: c.id,
            title: c.company_name,
            subtitle: `Code: ${c.customer_code || 'N/A'} • Contact: ${c.contact_person || c.email || 'N/A'}`,
            badge: c.status || 'Active',
            module: 'Sales & CRM',
            type: 'Customer',
            route: `/secure-kolmeks-x0y0/customers/${c.id}`,
            score: isExactMatch(c.customer_code) ? 100 : isExactMatch(c.company_name) ? 90 : 60
          }));
          totalCount += results.customers.length;
        }
      } catch (err) {
        console.error('Customers search error:', err.message);
      }
    }

    // 4. SUPPLIERS SEARCH (Procurement)
    const allowedSupplierRoles = ['admin', 'master_admin', 'executive', 'procurement_manager', 'inventory_manager', 'finance', 'staff'];
    if (allowedSupplierRoles.includes(userRole)) {
      try {
        const { data: suppliers, error } = await supabaseAdmin
          .from('suppliers')
          .select('id, company_name, supplier_code, contact_person, email, phone, status')
          .or(`company_name.ilike.%${query}%,supplier_code.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(10);

        if (!error && suppliers && suppliers.length > 0) {
          results.suppliers = suppliers.map((s) => ({
            id: s.id,
            title: s.company_name,
            subtitle: `Code: ${s.supplier_code || 'N/A'} • Contact: ${s.contact_person || s.email || 'N/A'}`,
            badge: s.status || 'Active',
            module: 'Procurement',
            type: 'Supplier',
            route: `/secure-kolmeks-x0y0/suppliers/${s.id}`,
            score: isExactMatch(s.supplier_code) ? 100 : isExactMatch(s.company_name) ? 90 : 60
          }));
          totalCount += results.suppliers.length;
        }
      } catch (err) {
        console.error('Suppliers search error:', err.message);
      }
    }

    // 5. SALES ORDERS SEARCH
    try {
      const { data: salesOrders, error } = await supabaseAdmin
        .from('sales_orders')
        .select('id, order_number, status, total, order_date, customer:customers(company_name)')
        .or(`order_number.ilike.%${query}%`)
        .limit(10);

      if (!error && salesOrders && salesOrders.length > 0) {
        results.salesOrders = salesOrders.map((so) => ({
          id: so.id,
          title: `Sales Order: ${so.order_number}`,
          subtitle: `Customer: ${so.customer?.company_name || 'N/A'} • Total: ₹${so.total || 0}`,
          badge: so.status || 'Pending',
          module: 'Sales',
          type: 'Sales Order',
          route: `/secure-kolmeks-x0y0/sales-orders/${so.id}`,
          score: isExactMatch(so.order_number) ? 100 : 70
        }));
        totalCount += results.salesOrders.length;
      }
    } catch (err) {
      console.error('Sales Orders search error:', err.message);
    }

    // 6. PURCHASE ORDERS SEARCH
    try {
      const { data: purchaseOrders, error } = await supabaseAdmin
        .from('purchase_orders')
        .select('id, po_number, status, total, order_date, supplier:suppliers(company_name)')
        .or(`po_number.ilike.%${query}%`)
        .limit(10);

      if (!error && purchaseOrders && purchaseOrders.length > 0) {
        results.purchaseOrders = purchaseOrders.map((po) => ({
          id: po.id,
          title: `Purchase Order: ${po.po_number}`,
          subtitle: `Supplier: ${po.supplier?.company_name || 'N/A'} • Total: ₹${po.total || 0}`,
          badge: po.status || 'Issued',
          module: 'Procurement',
          type: 'Purchase Order',
          route: `/secure-kolmeks-x0y0/purchase-orders/${po.id}`,
          score: isExactMatch(po.po_number) ? 100 : 70
        }));
        totalCount += results.purchaseOrders.length;
      }
    } catch (err) {
      console.error('Purchase Orders search error:', err.message);
    }

    // 7. PRODUCTION ORDERS SEARCH
    try {
      const { data: prodOrders, error } = await supabaseAdmin
        .from('production_orders')
        .select('id, production_number, status, quantity, completed_quantity, progress')
        .or(`production_number.ilike.%${query}%`)
        .limit(10);

      if (!error && prodOrders && prodOrders.length > 0) {
        results.production = prodOrders.map((p) => ({
          id: p.id,
          title: `Production Order: ${p.production_number}`,
          subtitle: `Progress: ${p.progress || 0}% • Qty: ${p.completed_quantity || 0}/${p.quantity || 0}`,
          badge: p.status || 'Planned',
          module: 'Production',
          type: 'Production Order',
          route: `/secure-kolmeks-x0y0/production/orders/${p.id}`,
          score: isExactMatch(p.production_number) ? 100 : 70
        }));
        totalCount += results.production.length;
      }
    } catch (err) {
      console.error('Production Orders search error:', err.message);
    }

    // 8. QUALITY INSPECTIONS SEARCH
    try {
      const { data: inspections, error } = await supabaseAdmin
        .from('quality_inspections')
        .select('id, inspection_number, result, quantity_inspected, notes')
        .or(`inspection_number.ilike.%${query}%,notes.ilike.%${query}%`)
        .limit(10);

      if (!error && inspections && inspections.length > 0) {
        results.quality = inspections.map((q) => ({
          id: q.id,
          title: `Quality Inspection: ${q.inspection_number}`,
          subtitle: `Result: ${q.result || 'Pass'} • Inspected Qty: ${q.quantity_inspected || 0}`,
          badge: q.result || 'Pending',
          module: 'Quality Control',
          type: 'Quality Inspection',
          route: `/secure-kolmeks-x0y0/quality/inspections/${q.id}`,
          score: isExactMatch(q.inspection_number) ? 100 : 60
        }));
        totalCount += results.quality.length;
      }
    } catch (err) {
      console.error('Quality Inspections search error:', err.message);
    }

    // 9. MACHINES & INDUSTRIAL EQUIPMENT SEARCH
    try {
      const { data: machines, error } = await supabaseAdmin
        .from('machines')
        .select('id, machine_code, name, type, manufacturer, model, location, status')
        .or(`name.ilike.%${query}%,machine_code.ilike.%${query}%,type.ilike.%${query}%,manufacturer.ilike.%${query}%`)
        .limit(10);

      if (!error && machines && machines.length > 0) {
        results.machines = machines.map((m) => ({
          id: m.id,
          title: m.name,
          subtitle: `Code: ${m.machine_code || 'N/A'} • Type: ${m.type || 'CNC'} • Location: ${m.location || 'Hall A'}`,
          badge: m.status || 'Idle',
          module: 'Production & Machinery',
          type: 'Machine',
          route: `/secure-kolmeks-x0y0/cnc-machines`,
          score: isExactMatch(m.machine_code) ? 100 : isExactMatch(m.name) ? 90 : 60
        }));
        totalCount += results.machines.length;
      }
    } catch (err) {
      console.error('Machines search error:', err.message);
    }

    // 10. WAREHOUSES SEARCH
    try {
      const { data: warehouses, error } = await supabaseAdmin
        .from('warehouses')
        .select('id, code, name, location, status')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(10);

      if (!error && warehouses && warehouses.length > 0) {
        results.warehouses = warehouses.map((w) => ({
          id: w.id,
          title: w.name,
          subtitle: `Code: ${w.code || 'N/A'} • Location: ${w.location || 'N/A'}`,
          badge: w.status || 'Active',
          module: 'Inventory & Warehouses',
          type: 'Warehouse',
          route: `/secure-kolmeks-x0y0/warehouses/${w.id}`,
          score: isExactMatch(w.code) ? 100 : isExactMatch(w.name) ? 90 : 60
        }));
        totalCount += results.warehouses.length;
      }
    } catch (err) {
      console.error('Warehouses search error:', err.message);
    }

    // 11. RFQS SEARCH
    try {
      const { data: rfqs, error } = await supabaseAdmin
        .from('rfqs')
        .select('id, rfq_number, component_name, material, status, priority')
        .or(`rfq_number.ilike.%${query}%,component_name.ilike.%${query}%,material.ilike.%${query}%`)
        .limit(10);

      if (!error && rfqs && rfqs.length > 0) {
        results.rfqs = rfqs.map((r) => ({
          id: r.id,
          title: `RFQ: ${r.rfq_number} - ${r.component_name}`,
          subtitle: `Material: ${r.material || 'General'} • Priority: ${r.priority || 'medium'}`,
          badge: r.status || 'New',
          module: 'Sales & RFQ',
          type: 'RFQ',
          route: `/secure-kolmeks-x0y0/rfqs/${r.id}`,
          score: isExactMatch(r.rfq_number) ? 100 : 60
        }));
        totalCount += results.rfqs.length;
      }
    } catch (err) {
      console.error('RFQs search error:', err.message);
    }

    // 12. PROFILES & EMPLOYEES SEARCH
    try {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, department, status')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,department.ilike.%${query}%`)
        .limit(10);

      if (!error && profiles && profiles.length > 0) {
        results.profiles = profiles.map((p) => ({
          id: p.id,
          title: p.full_name,
          subtitle: `Dept: ${p.department || 'Operations'} • Email: ${p.email}`,
          badge: p.status || 'Active',
          module: 'Human Resources',
          type: 'Employee Profile',
          route: `/secure-kolmeks-x0y0/employees/${p.id}`,
          score: isExactMatch(p.full_name) ? 90 : 60
        }));
        totalCount += results.profiles.length;
      }
    } catch (err) {
      console.error('Profiles search error:', err.message);
    }

    // 13. CATEGORIES SEARCH
    try {
      const { data: categories, error } = await supabaseAdmin
        .from('categories')
        .select('id, name, description, status')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (!error && categories && categories.length > 0) {
        results.categories = categories.map((cat) => ({
          id: cat.id,
          title: cat.name,
          subtitle: cat.description || 'Product Category',
          badge: cat.status || 'Active',
          module: 'Master Data',
          type: 'Category',
          route: `/secure-kolmeks-x0y0/product-categories`,
          score: isExactMatch(cat.name) ? 100 : 70
        }));
        totalCount += results.categories.length;
      }
    } catch (err) {
      console.error('Categories search error:', err.message);
    }

    // 14. NEWS ARTICLES SEARCH
    try {
      const { data: newsItems, error } = await supabaseAdmin
        .from('news')
        .select('id, title, slug, excerpt, category, status')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);

      if (!error && newsItems && newsItems.length > 0) {
        results.news = newsItems.map((n) => ({
          id: n.id,
          title: n.title,
          subtitle: `Category: ${n.category || 'News'} • Slug: ${n.slug}`,
          badge: n.status || 'Published',
          module: 'Public Corporate Portal',
          type: 'News Article',
          route: `/news/${n.slug}`,
          score: isExactMatch(n.title) ? 100 : 60
        }));
        totalCount += results.news.length;
      }
    } catch (err) {
      console.error('News search error:', err.message);
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
