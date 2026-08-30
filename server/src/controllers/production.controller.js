const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate sequential production numbers (e.g., MO-2026-000001, BOM-2026-000001, RTG-2026-000001)
 */
const generateSequenceNumber = async (table, numberColumn, prefix) => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `${prefix}-${currentYear}-`;

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(numberColumn)
    .ilike(numberColumn, `${yearPrefix}%`)
    .order(numberColumn, { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Error generating ${prefix} number:`, error);
  }

  let nextSequence = 1;
  if (data && data.length > 0 && data[0][numberColumn]) {
    const lastNumberStr = data[0][numberColumn];
    const parts = lastNumberStr.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  return `${yearPrefix}${String(nextSequence).padStart(6, '0')}`;
};

/**
 * WORK CENTERS
 */
const getWorkCenters = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = supabaseAdmin.from('work_centers').select('*').order('code', { ascending: true });

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch machine counts per work center
    const { data: machines } = await supabaseAdmin.from('machines').select('id, work_center_id');
    const machineCounts = {};
    if (machines) {
      machines.forEach((m) => {
        if (m.work_center_id) {
          machineCounts[m.work_center_id] = (machineCounts[m.work_center_id] || 0) + 1;
        }
      });
    }

    const formatted = data.map((wc) => ({
      ...wc,
      machine_count: machineCounts[wc.id] || 0,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getWorkCenters error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const createWorkCenter = async (req, res) => {
  try {
    const { code, name, description, type, capacity, status } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Work Center Code and Name are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('work_centers')
      .insert({
        code: code.toUpperCase(),
        name,
        description: description || null,
        type: type || 'CNC Machining',
        capacity: capacity ? parseFloat(capacity) : 1.00,
        status: status || 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data, message: 'Work Center created successfully.' });
  } catch (error) {
    console.error('createWorkCenter error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, capacity, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('work_centers')
      .update({
        name,
        description,
        type,
        capacity: capacity ? parseFloat(capacity) : 1.00,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data, message: 'Work Center updated successfully.' });
  } catch (error) {
    console.error('updateWorkCenter error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const toggleWorkCenterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('work_centers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data, message: `Work Center status set to ${status}.` });
  } catch (error) {
    console.error('toggleWorkCenterStatus error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * MACHINES
 */
const getMachines = async (req, res) => {
  try {
    const { work_center_id, status, search } = req.query;
    let query = supabaseAdmin
      .from('machines')
      .select(`
        *,
        work_center:work_centers (
          id,
          code,
          name,
          type
        )
      `)
      .order('code', { ascending: true });

    if (work_center_id) query = query.eq('work_center_id', work_center_id);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,model.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('getMachines error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const createMachine = async (req, res) => {
  try {
    const { code, name, machine_type, manufacturer, model, serial_number, work_center_id, status, description } = req.body;
    if (!code || !name || !machine_type) {
      return res.status(400).json({ success: false, message: 'Machine Code, Name, and Type are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('machines')
      .insert({
        code: code.toUpperCase(),
        name,
        machine_type,
        manufacturer: manufacturer || null,
        model: model || null,
        serial_number: serial_number || null,
        work_center_id: work_center_id || null,
        status: status || 'AVAILABLE',
        description: description || null,
      })
      .select(`
        *,
        work_center:work_centers (id, code, name)
      `)
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data, message: 'Machine created successfully.' });
  } catch (error) {
    console.error('createMachine error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, machine_type, manufacturer, model, serial_number, work_center_id, status, description } = req.body;

    const { data, error } = await supabaseAdmin
      .from('machines')
      .update({
        name,
        machine_type,
        manufacturer,
        model,
        serial_number,
        work_center_id,
        status,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        work_center:work_centers (id, code, name)
      `)
      .single();

    if (error) throw error;
    return res.json({ success: true, data, message: 'Machine updated successfully.' });
  } catch (error) {
    console.error('updateMachine error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['AVAILABLE', 'RUNNING', 'MAINTENANCE', 'BREAKDOWN', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid machine status value.' });
    }

    const { data, error } = await supabaseAdmin
      .from('machines')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data, message: `Machine ERP status updated to ${status}.` });
  } catch (error) {
    console.error('updateMachineStatus error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * BILLS OF MATERIALS (BOM)
 */
const getBOMs = async (req, res) => {
  try {
    const { product_id, status, search } = req.query;
    let query = supabaseAdmin
      .from('boms')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        ),
        created_by_profile:profiles!created_by (full_name)
      `)
      .order('created_at', { ascending: false });

    if (product_id) query = query.eq('product_id', product_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data;
    if (search) {
      const lower = search.toLowerCase();
      filtered = data.filter((b) => 
        b.bom_number.toLowerCase().includes(lower) ||
        b.product?.product_code?.toLowerCase().includes(lower) ||
        b.product?.name?.toLowerCase().includes(lower)
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('getBOMs error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const getBOMById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: bom, error: bomErr } = await supabaseAdmin
      .from('boms')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          specifications,
          category:categories (name)
        ),
        created_by_profile:profiles!created_by (full_name)
      `)
      .eq('id', id)
      .single();

    if (bomErr || !bom) {
      return res.status(404).json({ success: false, message: 'Bill of Materials not found.' });
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('bom_items')
      .select(`
        *,
        component:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        )
      `)
      .eq('bom_id', id)
      .order('line_order', { ascending: true });

    if (itemsErr) throw itemsErr;

    return res.json({ success: true, data: { ...bom, items } });
  } catch (error) {
    console.error('getBOMById error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const createBOM = async (req, res) => {
  try {
    const { product_id, version, description, effective_from, effective_to, items } = req.body;
    if (!product_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Product selection and at least one component item are required.' });
    }

    const bom_number = await generateSequenceNumber('boms', 'bom_number', 'BOM');
    const bom_version = version || 'V1';

    const { data: bom, error: bomErr } = await supabaseAdmin
      .from('boms')
      .insert({
        bom_number,
        product_id,
        version: bom_version,
        status: 'DRAFT',
        description: description || null,
        effective_from: effective_from || new Date().toISOString().split('T')[0],
        effective_to: effective_to || null,
        created_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (bomErr) throw bomErr;

    const bomItemsPayload = items.map((item, idx) => ({
      bom_id: bom.id,
      component_id: item.component_id,
      quantity_per: parseFloat(item.quantity_per),
      unit: item.unit || 'pcs',
      scrap_percentage: item.scrap_percentage ? parseFloat(item.scrap_percentage) : 0.00,
      notes: item.notes || null,
      line_order: idx + 1,
    }));

    const { error: itemsErr } = await supabaseAdmin.from('bom_items').insert(bomItemsPayload);
    if (itemsErr) throw itemsErr;

    return res.status(201).json({ success: true, data: bom, message: `BOM ${bom_number} created successfully.` });
  } catch (error) {
    console.error('createBOM error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const activateBOM = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: bom, error: fetchErr } = await supabaseAdmin.from('boms').select('id, product_id').eq('id', id).single();
    if (fetchErr || !bom) return res.status(404).json({ success: false, message: 'BOM not found.' });

    // Mark previous ACTIVE BOMs for the product as OBSOLETE
    await supabaseAdmin
      .from('boms')
      .update({ status: 'OBSOLETE', updated_at: new Date().toISOString() })
      .eq('product_id', bom.product_id)
      .eq('status', 'ACTIVE');

    // Activate selected BOM
    const { data, error } = await supabaseAdmin
      .from('boms')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString(), updated_by: req.profile?.id || null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data, message: 'BOM activated successfully.' });
  } catch (error) {
    console.error('activateBOM error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * MANUFACTURING ROUTINGS
 */
const getRoutings = async (req, res) => {
  try {
    const { product_id, status, search } = req.query;
    let query = supabaseAdmin
      .from('routings')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        ),
        created_by_profile:profiles!created_by (full_name)
      `)
      .order('created_at', { ascending: false });

    if (product_id) query = query.eq('product_id', product_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data;
    if (search) {
      const lower = search.toLowerCase();
      filtered = data.filter((r) => 
        r.routing_number.toLowerCase().includes(lower) ||
        r.product?.product_code?.toLowerCase().includes(lower) ||
        r.product?.name?.toLowerCase().includes(lower)
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('getRoutings error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const getRoutingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: routing, error: rtgErr } = await supabaseAdmin
      .from('routings')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        )
      `)
      .eq('id', id)
      .single();

    if (rtgErr || !routing) return res.status(404).json({ success: false, message: 'Routing not found.' });

    const { data: operations, error: opsErr } = await supabaseAdmin
      .from('routing_operations')
      .select(`
        *,
        work_center:work_centers (id, code, name),
        machine:machines (id, code, name)
      `)
      .eq('routing_id', id)
      .order('sequence', { ascending: true });

    if (opsErr) throw opsErr;

    return res.json({ success: true, data: { ...routing, operations } });
  } catch (error) {
    console.error('getRoutingById error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const createRouting = async (req, res) => {
  try {
    const { product_id, version, description, operations } = req.body;
    if (!product_id || !Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ success: false, message: 'Product selection and at least one routing operation are required.' });
    }

    const routing_number = await generateSequenceNumber('routings', 'routing_number', 'RTG');
    const rtg_version = version || 'V1';

    const { data: routing, error: rtgErr } = await supabaseAdmin
      .from('routings')
      .insert({
        routing_number,
        product_id,
        version: rtg_version,
        status: 'ACTIVE',
        description: description || null,
        created_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (rtgErr) throw rtgErr;

    const opsPayload = operations.map((op, idx) => ({
      routing_id: routing.id,
      sequence: op.sequence ? parseInt(op.sequence, 10) : (idx + 1) * 10,
      operation_name: op.operation_name,
      work_center_id: op.work_center_id || null,
      machine_id: op.machine_id || null,
      setup_time_mins: op.setup_time_mins ? parseFloat(op.setup_time_mins) : 0.00,
      run_time_mins: op.run_time_mins ? parseFloat(op.run_time_mins) : 0.00,
      description: op.description || null,
    }));

    const { error: opsErr } = await supabaseAdmin.from('routing_operations').insert(opsPayload);
    if (opsErr) throw opsErr;

    return res.status(201).json({ success: true, data: routing, message: `Routing ${routing_number} created successfully.` });
  } catch (error) {
    console.error('createRouting error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * PRODUCTION ORDERS
 */
const getProductionOrders = async (req, res) => {
  try {
    const { search, status, priority, product_id, sales_order_id, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('production_orders')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        ),
        sales_order:sales_orders (
          id,
          order_number,
          customer:customers (id, company_name)
        ),
        bom:boms (id, bom_number, version),
        routing:routings (id, routing_number, version)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (product_id) query = query.eq('product_id', product_id);
    if (sales_order_id) query = query.eq('sales_order_id', sales_order_id);

    if (search) {
      query = query.or(`production_order_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('getProductionOrders error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const getProductionOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch Production Order Header
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('production_orders')
      .select(`
        *,
        product:products (
          id,
          product_code,
          name,
          unit,
          category:categories (name)
        ),
        sales_order:sales_orders (
          id,
          order_number,
          order_date,
          requested_delivery_date,
          customer:customers (id, company_name, customer_code)
        ),
        bom:boms (
          id,
          bom_number,
          version,
          status
        ),
        routing:routings (
          id,
          routing_number,
          version,
          status
        ),
        created_by_profile:profiles!created_by (full_name)
      `)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ success: false, message: 'Production Order not found.' });
    }

    // Fetch Operations Execution List
    const { data: operations } = await supabaseAdmin
      .from('production_operations')
      .select(`
        *,
        work_center:work_centers (id, code, name),
        machine:machines (id, code, name),
        operator:profiles (id, full_name)
      `)
      .eq('production_order_id', id)
      .order('sequence', { ascending: true });

    // Derive Material Requirements & Availability if BOM exists
    let materialRequirements = [];
    let hasShortage = false;

    if (order.bom_id) {
      const { data: bomItems } = await supabaseAdmin
        .from('bom_items')
        .select(`
          *,
          component:products (
            id,
            product_code,
            name,
            unit,
            category:categories (name)
          )
        `)
        .eq('bom_id', order.bom_id);

      if (bomItems && bomItems.length > 0) {
        // Fetch current available stock for each component across warehouses
        const componentIds = bomItems.map((bi) => bi.component_id);
        const { data: stockBalances } = await supabaseAdmin
          .from('inventory')
          .select('product_id, available_quantity')
          .in('product_id', componentIds);

        const availableMap = {};
        if (stockBalances) {
          stockBalances.forEach((sb) => {
            availableMap[sb.product_id] = (availableMap[sb.product_id] || 0) + (parseFloat(sb.available_quantity) || 0);
          });
        }

        materialRequirements = bomItems.map((item) => {
          const qtyPer = parseFloat(item.quantity_per);
          const scrapPct = parseFloat(item.scrap_percentage || 0);
          const plannedQty = parseFloat(order.planned_quantity);
          const requiredQty = qtyPer * plannedQty * (1 + scrapPct / 100);
          const availableQty = availableMap[item.component_id] || 0;
          const shortageQty = Math.max(0, requiredQty - availableQty);

          if (shortageQty > 0) hasShortage = true;

          return {
            id: item.id,
            component_id: item.component_id,
            component_code: item.component?.product_code,
            component_name: item.component?.name,
            unit: item.unit || item.component?.unit || 'pcs',
            quantity_per: qtyPer,
            scrap_percentage: scrapPct,
            required_quantity: requiredQty,
            available_quantity: availableQty,
            shortage_quantity: shortageQty,
          };
        });
      }
    }

    // Fetch Material Consumptions history
    const { data: consumptions } = await supabaseAdmin
      .from('production_material_consumptions')
      .select(`
        *,
        product:products (id, product_code, name, unit),
        warehouse:warehouses (id, code, name),
        location:storage_locations (id, code, name),
        consumed_by_profile:profiles (full_name)
      `)
      .eq('production_order_id', id)
      .order('consumed_at', { ascending: false });

    // Fetch Production Output history
    const { data: outputs } = await supabaseAdmin
      .from('production_outputs')
      .select(`
        *,
        product:products (id, product_code, name, unit),
        warehouse:warehouses (id, code, name),
        location:storage_locations (id, code, name),
        produced_by_profile:profiles (full_name)
      `)
      .eq('production_order_id', id)
      .order('produced_at', { ascending: false });

    // Fetch Activity Timeline
    const { data: activities } = await supabaseAdmin
      .from('production_activities')
      .select('*')
      .eq('production_order_id', id)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...order,
        operations: operations || [],
        material_requirements: materialRequirements,
        has_material_shortage: hasShortage,
        consumptions: consumptions || [],
        outputs: outputs || [],
        activities: activities || [],
      },
    });
  } catch (error) {
    console.error('getProductionOrderById error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const createProductionOrder = async (req, res) => {
  try {
    const { sales_order_id, product_id, bom_id, routing_id, planned_quantity, priority, planned_start, planned_end, notes } = req.body;

    if (!product_id || !planned_quantity || parseFloat(planned_quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid Product and Planned Quantity (>0) are required.' });
    }

    // Auto-select active BOM if not provided
    let activeBomId = bom_id;
    if (!activeBomId) {
      const { data: bomData } = await supabaseAdmin
        .from('boms')
        .select('id')
        .eq('product_id', product_id)
        .eq('status', 'ACTIVE')
        .limit(1);

      if (bomData && bomData.length > 0) {
        activeBomId = bomData[0].id;
      }
    }

    // Auto-select active Routing if not provided
    let activeRoutingId = routing_id;
    if (!activeRoutingId) {
      const { data: rtgData } = await supabaseAdmin
        .from('routings')
        .select('id')
        .eq('product_id', product_id)
        .eq('status', 'ACTIVE')
        .limit(1);

      if (rtgData && rtgData.length > 0) {
        activeRoutingId = rtgData[0].id;
      }
    }

    const production_order_number = await generateSequenceNumber('production_orders', 'production_order_number', 'MO');

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('production_orders')
      .insert({
        production_order_number,
        sales_order_id: sales_order_id || null,
        product_id,
        bom_id: activeBomId || null,
        routing_id: activeRoutingId || null,
        planned_quantity: parseFloat(planned_quantity),
        completed_quantity: 0.00,
        rejected_quantity: 0.00,
        priority: priority || 'MEDIUM',
        status: 'DRAFT',
        planned_start: planned_start || null,
        planned_end: planned_end || null,
        notes: notes || null,
        created_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Generate Production Operations sequence if Routing exists
    if (activeRoutingId) {
      const { data: routingOps } = await supabaseAdmin
        .from('routing_operations')
        .select('*')
        .eq('routing_id', activeRoutingId)
        .order('sequence', { ascending: true });

      if (routingOps && routingOps.length > 0) {
        const prodOpsPayload = routingOps.map((op) => ({
          production_order_id: order.id,
          routing_operation_id: op.id,
          sequence: op.sequence,
          operation_name: op.operation_name,
          work_center_id: op.work_center_id,
          machine_id: op.machine_id,
          planned_quantity: parseFloat(planned_quantity),
          completed_quantity: 0.00,
          rejected_quantity: 0.00,
          status: 'PENDING',
          planned_start: planned_start || null,
          planned_end: planned_end || null,
        }));

        await supabaseAdmin.from('production_operations').insert(prodOpsPayload);
      }
    }

    // Log Activity
    await supabaseAdmin.from('production_activities').insert({
      production_order_id: order.id,
      actor_id: req.profile?.id || null,
      actor_name: req.profile?.full_name || 'System User',
      activity_type: sales_order_id ? 'CREATED_FROM_SO' : 'CREATED',
      description: `Production Order ${production_order_number} created with planned quantity ${planned_quantity}.`,
      new_value: 'DRAFT',
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: `Production Order ${production_order_number} created successfully.`,
    });
  } catch (error) {
    console.error('createProductionOrder error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const updateProductionOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const VALID_STATUSES = ['DRAFT', 'PLANNED', 'RELEASED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('production_orders')
      .select('status, actual_start, actual_end')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ success: false, message: 'Production Order not found.' });

    const updatePayload = {
      status,
      notes: notes ? notes : undefined,
      updated_at: new Date().toISOString(),
      updated_by: req.profile?.id || null,
    };

    if (status === 'IN_PROGRESS' && !existing.actual_start) {
      updatePayload.actual_start = new Date().toISOString();
    }
    if (status === 'COMPLETED' && !existing.actual_end) {
      updatePayload.actual_end = new Date().toISOString();
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('production_orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log Activity
    await supabaseAdmin.from('production_activities').insert({
      production_order_id: id,
      actor_id: req.profile?.id || null,
      actor_name: req.profile?.full_name || 'System User',
      activity_type: 'STATUS_CHANGED',
      description: `Production Order status changed from '${existing.status}' to '${status}'.`,
      old_value: existing.status,
      new_value: status,
    });

    return res.json({ success: true, data: updated, message: `Production Order status updated to ${status}.` });
  } catch (error) {
    console.error('updateProductionOrderStatus error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * PRODUCTION OPERATIONS TRACKING
 */
const updateOperationStatus = async (req, res) => {
  try {
    const { operationId } = req.params;
    const { status, completed_quantity, rejected_quantity, operator_id, notes } = req.body;

    const { data: op, error: opErr } = await supabaseAdmin
      .from('production_operations')
      .select('*')
      .eq('id', operationId)
      .single();

    if (opErr || !op) return res.status(404).json({ success: false, message: 'Production operation step not found.' });

    const updatePayload = {
      status: status || op.status,
      completed_quantity: completed_quantity !== undefined ? parseFloat(completed_quantity) : op.completed_quantity,
      rejected_quantity: rejected_quantity !== undefined ? parseFloat(rejected_quantity) : op.rejected_quantity,
      operator_id: operator_id || req.profile?.id || op.operator_id,
      notes: notes !== undefined ? notes : op.notes,
      updated_at: new Date().toISOString(),
    };

    if (status === 'IN_PROGRESS' && !op.actual_start) {
      updatePayload.actual_start = new Date().toISOString();
    }
    if (status === 'COMPLETED' && !op.actual_end) {
      updatePayload.actual_end = new Date().toISOString();
    }

    const { data: updatedOp, error: updateErr } = await supabaseAdmin
      .from('production_operations')
      .update(updatePayload)
      .eq('id', operationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Auto-update parent Production Order status to IN_PROGRESS if first operation starts
    if (status === 'IN_PROGRESS') {
      await supabaseAdmin
        .from('production_orders')
        .update({ status: 'IN_PROGRESS', actual_start: new Date().toISOString() })
        .eq('id', op.production_order_id)
        .eq('status', 'RELEASED');
    }

    // Log activity
    await supabaseAdmin.from('production_activities').insert({
      production_order_id: op.production_order_id,
      actor_id: req.profile?.id || null,
      actor_name: req.profile?.full_name || 'System User',
      activity_type: status === 'IN_PROGRESS' ? 'OPERATION_STARTED' : 'OPERATION_COMPLETED',
      description: `Operation '${op.operation_name}' status set to '${status}'.`,
      old_value: op.status,
      new_value: status,
    });

    return res.json({ success: true, data: updatedOp, message: `Operation ${op.operation_name} updated successfully.` });
  } catch (error) {
    console.error('updateOperationStatus error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * RECORD MATERIAL CONSUMPTION
 */
const recordMaterialConsumption = async (req, res) => {
  try {
    const { id } = req.params; // production_order_id
    const { product_id, warehouse_id, location_id, quantity, notes } = req.body;

    const consumeQty = parseFloat(quantity);
    if (!product_id || !warehouse_id || isNaN(consumeQty) || consumeQty <= 0) {
      return res.status(400).json({ success: false, message: 'Product, Warehouse, and positive Consumption Quantity are required.' });
    }

    // Check inventory stock availability
    let stockQuery = supabaseAdmin
      .from('inventory')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id);

    if (location_id) stockQuery = stockQuery.eq('location_id', location_id);
    else stockQuery = stockQuery.is('location_id', null);

    const { data: stockRow, error: stockErr } = await stockQuery.single();

    const currentOnHand = stockRow ? parseFloat(stockRow.on_hand_quantity) : 0;
    if (currentOnHand < consumeQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock in selected warehouse/location. Available: ${currentOnHand}, Requested: ${consumeQty}.`,
      });
    }

    // Generate unique transaction reference code
    const transactionCode = await generateSequenceNumber('inventory_transactions', 'transaction_code', 'TXN');

    // 1. Insert Inventory Transaction (PRODUCTION_CONSUMPTION)
    const { data: invTxn, error: txnErr } = await supabaseAdmin
      .from('inventory_transactions')
      .insert({
        transaction_code: transactionCode,
        product_id,
        warehouse_id,
        location_id: location_id || null,
        movement_type: 'PRODUCTION_CONSUMPTION',
        quantity: -consumeQty,
        reference_type: 'PRODUCTION_ORDER',
        reference_id: id,
        notes: notes || `Material consumed for Production Order`,
        created_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (txnErr) throw txnErr;

    // 2. Update Inventory Stock Balance
    const newOnHand = currentOnHand - consumeQty;
    const newAvailable = Math.max(0, parseFloat(stockRow.available_quantity || 0) - consumeQty);

    await supabaseAdmin
      .from('inventory')
      .update({
        on_hand_quantity: newOnHand,
        available_quantity: newAvailable,
        last_counted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', stockRow.id);

    // 3. Record Production Consumption Entry
    const { data: consumption, error: consErr } = await supabaseAdmin
      .from('production_material_consumptions')
      .insert({
        production_order_id: id,
        product_id,
        warehouse_id,
        location_id: location_id || null,
        quantity: consumeQty,
        unit: 'pcs',
        inventory_transaction_id: invTxn.id,
        consumed_by: req.profile?.id || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (consErr) throw consErr;

    // Log Activity
    await supabaseAdmin.from('production_activities').insert({
      production_order_id: id,
      actor_id: req.profile?.id || null,
      actor_name: req.profile?.full_name || 'System User',
      activity_type: 'MATERIAL_CONSUMED',
      description: `Recorded material consumption: ${consumeQty} units (Ref TXN: ${transactionCode}).`,
    });

    return res.status(201).json({
      success: true,
      data: consumption,
      message: `Material consumption of ${consumeQty} units recorded successfully.`,
    });
  } catch (error) {
    console.error('recordMaterialConsumption error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * RECORD PRODUCTION OUTPUT (FINISHED GOODS)
 */
const recordProductionOutput = async (req, res) => {
  try {
    const { id } = req.params; // production_order_id
    const { warehouse_id, location_id, quantity, rejected_quantity, notes } = req.body;

    const producedQty = parseFloat(quantity || 0);
    const rejectedQty = parseFloat(rejected_quantity || 0);

    if (isNaN(producedQty) || producedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid accepted output quantity (>0) is required.' });
    }
    if (!warehouse_id) {
      return res.status(400).json({ success: false, message: 'Target warehouse facility is required.' });
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('production_orders')
      .select('id, product_id, planned_quantity, completed_quantity, rejected_quantity, status')
      .eq('id', id)
      .single();

    if (orderErr || !order) return res.status(404).json({ success: false, message: 'Production Order not found.' });

    // Generate unique transaction code
    const transactionCode = await generateSequenceNumber('inventory_transactions', 'transaction_code', 'TXN');

    // 1. Insert Inventory Transaction (PRODUCTION_OUTPUT)
    const { data: invTxn, error: txnErr } = await supabaseAdmin
      .from('inventory_transactions')
      .insert({
        transaction_code: transactionCode,
        product_id: order.product_id,
        warehouse_id,
        location_id: location_id || null,
        movement_type: 'PRODUCTION_OUTPUT',
        quantity: producedQty,
        reference_type: 'PRODUCTION_ORDER',
        reference_id: id,
        notes: notes || `Production output finished goods received`,
        created_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (txnErr) throw txnErr;

    // 2. Update/Insert Inventory Stock Balance
    let stockQuery = supabaseAdmin
      .from('inventory')
      .select('*')
      .eq('product_id', order.product_id)
      .eq('warehouse_id', warehouse_id);

    if (location_id) stockQuery = stockQuery.eq('location_id', location_id);
    else stockQuery = stockQuery.is('location_id', null);

    const { data: stockRow } = await stockQuery.single();

    if (stockRow) {
      await supabaseAdmin
        .from('inventory')
        .update({
          on_hand_quantity: parseFloat(stockRow.on_hand_quantity) + producedQty,
          available_quantity: parseFloat(stockRow.available_quantity) + producedQty,
          last_counted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', stockRow.id);
    } else {
      await supabaseAdmin.from('inventory').insert({
        product_id: order.product_id,
        warehouse_id,
        location_id: location_id || null,
        on_hand_quantity: producedQty,
        reserved_quantity: 0.00,
        available_quantity: producedQty,
        min_stock_level: 0.00,
        reorder_point: 0.00,
      });
    }

    // 3. Update Production Order Totals
    const newCompleted = parseFloat(order.completed_quantity) + producedQty;
    const newRejected = parseFloat(order.rejected_quantity) + rejectedQty;
    const plannedQty = parseFloat(order.planned_quantity);

    const orderUpdatePayload = {
      completed_quantity: newCompleted,
      rejected_quantity: newRejected,
      updated_at: new Date().toISOString(),
      updated_by: req.profile?.id || null,
    };

    // Auto mark COMPLETED if target reached
    if (newCompleted + newRejected >= plannedQty) {
      orderUpdatePayload.status = 'COMPLETED';
      orderUpdatePayload.actual_end = new Date().toISOString();
    }

    await supabaseAdmin.from('production_orders').update(orderUpdatePayload).eq('id', id);

    // 4. Insert Production Output record
    const { data: output, error: outErr } = await supabaseAdmin
      .from('production_outputs')
      .insert({
        production_order_id: id,
        product_id: order.product_id,
        quantity: producedQty,
        rejected_quantity: rejectedQty,
        warehouse_id,
        location_id: location_id || null,
        inventory_transaction_id: invTxn.id,
        produced_by: req.profile?.id || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (outErr) throw outErr;

    // Log Activity
    await supabaseAdmin.from('production_activities').insert({
      production_order_id: id,
      actor_id: req.profile?.id || null,
      actor_name: req.profile?.full_name || 'System User',
      activity_type: 'OUTPUT_RECORDED',
      description: `Recorded finished goods output: ${producedQty} accepted, ${rejectedQty} rejected (TXN: ${transactionCode}).`,
    });

    return res.status(201).json({
      success: true,
      data: output,
      message: `Production output of ${producedQty} finished goods posted to inventory successfully.`,
    });
  } catch (error) {
    console.error('recordProductionOutput error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * PRODUCTION TELEMETRY & DASHBOARD METRICS
 */
const getProductionSummary = async (req, res) => {
  try {
    const { data: orders } = await supabaseAdmin.from('production_orders').select('id, status, planned_quantity, completed_quantity, rejected_quantity');

    let totalOrders = 0;
    let plannedCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let onHoldCount = 0;

    if (orders) {
      totalOrders = orders.length;
      orders.forEach((o) => {
        if (o.status === 'PLANNED' || o.status === 'RELEASED') plannedCount++;
        else if (o.status === 'IN_PROGRESS') inProgressCount++;
        else if (o.status === 'COMPLETED') completedCount++;
        else if (o.status === 'ON_HOLD' || o.status === 'PAUSED') onHoldCount++;
      });
    }

    const { count: machineCount } = await supabaseAdmin
      .from('machines')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'RUNNING');

    const { count: totalMachines } = await supabaseAdmin
      .from('machines')
      .select('id', { count: 'exact', head: true });

    return res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        planned_count: plannedCount,
        in_progress_count: inProgressCount,
        completed_count: completedCount,
        on_hold_count: onHoldCount,
        running_machines: machineCount || 0,
        total_machines: totalMachines || 0,
      },
    });
  } catch (error) {
    console.error('getProductionSummary error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

module.exports = {
  getWorkCenters,
  createWorkCenter,
  updateWorkCenter,
  toggleWorkCenterStatus,

  getMachines,
  createMachine,
  updateMachine,
  updateMachineStatus,

  getBOMs,
  getBOMById,
  createBOM,
  activateBOM,

  getRoutings,
  getRoutingById,
  createRouting,

  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrderStatus,
  updateOperationStatus,

  recordMaterialConsumption,
  recordProductionOutput,
  getProductionSummary,
};
