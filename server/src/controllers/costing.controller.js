const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate sequence numbers (e.g. COST-2026-000001, WIP-2026-000001, VAR-2026-000001)
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
 * GET COSTING DASHBOARD METRICS
 */
const getCostingDashboard = async (req, res) => {
  try {
    // 1. Fetch WIP records summary
    const { data: wipRecords, error: wipErr } = await supabaseAdmin
      .from('wip_records')
      .select('id, total_wip, wip_quantity, status')
      .in('status', ['OPEN', 'PARTIALLY_COMPLETED']);

    if (wipErr) throw wipErr;

    const totalWIPValue = wipRecords ? wipRecords.reduce((sum, w) => sum + (parseFloat(w.total_wip) || 0), 0) : 0;
    const openWIPCount = wipRecords ? wipRecords.length : 0;

    // 2. Fetch Completed Production Costs
    const { data: costs, error: costErr } = await supabaseAdmin
      .from('manufacturing_costs')
      .select('*');

    if (costErr) throw costErr;

    let completedCost = 0;
    let completedCount = 0;
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalOverheadCost = 0;
    let totalVarianceSum = 0;

    if (costs) {
      costs.forEach((c) => {
        const mat = parseFloat(c.material_cost || 0);
        const lab = parseFloat(c.labor_cost || 0);
        const ovh = parseFloat(c.overhead_cost || 0);
        const varVal = parseFloat(c.total_variance || 0);

        totalMaterialCost += mat;
        totalLaborCost += lab;
        totalOverheadCost += ovh;
        totalVarianceSum += varVal;

        if (c.status === 'POSTED' || c.status === 'CLOSED') {
          completedCost += parseFloat(c.total_cost || 0);
          completedCount += 1;
        }
      });
    }

    const averageUnitCost = completedCount > 0 ? completedCost / completedCount : 0;

    // 3. Recent Production Orders with Cost Status
    const { data: recentOrders } = await supabaseAdmin
      .from('production_orders')
      .select(`
        id,
        production_order_number,
        planned_quantity,
        completed_quantity,
        status,
        product:products (id, product_code, name, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    return res.json({
      success: true,
      data: {
        total_wip_value: totalWIPValue,
        open_wip_orders: openWIPCount,
        completed_production_cost: completedCost,
        completed_orders_count: completedCount,
        average_unit_cost: averageUnitCost,
        breakdown: {
          material_cost: totalMaterialCost,
          labor_cost: totalLaborCost,
          overhead_cost: totalOverheadCost,
          total_variance: totalVarianceSum,
        },
        recent_orders: recentOrders || [],
      },
    });
  } catch (error) {
    console.error('getCostingDashboard error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET PRODUCTION COST ORDERS LIST
 */
const getProductionCostOrders = async (req, res) => {
  try {
    const { search, status, product_id, cost_center_id, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('production_orders')
      .select(`
        *,
        product:products (id, product_code, name, unit, price),
        manufacturing_cost:manufacturing_costs (
          id,
          costing_number,
          material_cost,
          labor_cost,
          overhead_cost,
          total_cost,
          unit_cost,
          planned_total_cost,
          total_variance,
          total_variance_pct,
          status,
          calculated_at,
          posted_at
        )
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (product_id) query = query.eq('product_id', product_id);

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
    console.error('getProductionCostOrders error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET PRODUCTION COST ORDER BY ID
 */
const getProductionCostOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Production Order Header
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('production_orders')
      .select(`
        *,
        product:products (id, product_code, name, unit, price, cost_price),
        bom:boms (id, bom_number, version),
        routing:routings (id, routing_number, version)
      `)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ success: false, message: 'Production Order not found.' });
    }

    // 2. Manufacturing Cost Header & Components
    const { data: mfgCost } = await supabaseAdmin
      .from('manufacturing_costs')
      .select(`
        *,
        journal_entry:journal_entries (id, journal_number, entry_date, status)
      `)
      .eq('production_order_id', id)
      .maybeSingle();

    let components = [];
    if (mfgCost) {
      const { data: compData } = await supabaseAdmin
        .from('manufacturing_cost_components')
        .select('*')
        .eq('manufacturing_cost_id', mfgCost.id);
      components = compData || [];
    }

    // 3. WIP Record if available
    const { data: wipRecord } = await supabaseAdmin
      .from('wip_records')
      .select('*')
      .eq('production_order_id', id)
      .maybeSingle();

    // 4. Actual Consumptions
    const { data: consumptions } = await supabaseAdmin
      .from('production_material_consumptions')
      .select(`
        *,
        product:products (id, product_code, name, unit, price, cost_price),
        warehouse:warehouses (id, code, name)
      `)
      .eq('production_order_id', id);

    // 5. Operations Execution
    const { data: operations } = await supabaseAdmin
      .from('production_operations')
      .select(`
        *,
        work_center:work_centers (id, code, name)
      `)
      .eq('production_order_id', id);

    // 6. Outputs
    const { data: outputs } = await supabaseAdmin
      .from('production_outputs')
      .select('*')
      .eq('production_order_id', id);

    // 7. Config Rates
    const { data: config } = await supabaseAdmin
      .from('manufacturing_cost_configurations')
      .select('*')
      .limit(1)
      .maybeSingle();

    return res.json({
      success: true,
      data: {
        order,
        costing: mfgCost || null,
        components,
        wip: wipRecord || null,
        consumptions: consumptions || [],
        operations: operations || [],
        outputs: outputs || [],
        config: config || null,
      },
    });
  } catch (error) {
    console.error('getProductionCostOrderById error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * SERVER-SIDE COST CALCULATION ENGINE
 */
const calculateProductionCost = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch Production Order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('production_orders')
      .select(`
        *,
        product:products (id, product_code, name, unit, price, cost_price),
        bom:boms (id, bom_number),
        routing:routings (id, routing_number)
      `)
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ success: false, message: 'Production Order not found.' });
    }

    // Fetch Configuration & Work Center Rates
    const { data: config } = await supabaseAdmin
      .from('manufacturing_cost_configurations')
      .select('*')
      .limit(1)
      .maybeSingle();

    const defaultLaborRate = parseFloat(config?.default_hourly_labor_rate || 250.00);
    const defaultOverheadRate = parseFloat(config?.default_hourly_overhead_rate || 150.00);
    const allocationBasis = config?.overhead_allocation_basis || 'PER_HOUR';

    const { data: wcRates } = await supabaseAdmin
      .from('work_center_cost_rates')
      .select('*');

    const wcRateMap = {};
    if (wcRates) {
      wcRates.forEach((r) => {
        wcRateMap[r.work_center_id] = r;
      });
    }

    // A. CALCULATE PLANNED COSTS (From BOM & Routing)
    let plannedMaterialCost = 0;
    let plannedLaborCost = 0;
    let plannedOverheadCost = 0;
    const plannedComponents = [];

    const plannedQty = parseFloat(order.planned_quantity || 1);

    if (order.bom_id) {
      const { data: bomItems } = await supabaseAdmin
        .from('bom_items')
        .select(`
          *,
          component:products (id, product_code, name, unit, price, cost_price)
        `)
        .eq('bom_id', order.bom_id);

      if (bomItems) {
        bomItems.forEach((bi) => {
          const qtyPer = parseFloat(bi.quantity_per || 0);
          const scrapPct = parseFloat(bi.scrap_percentage || 0);
          const reqQty = qtyPer * plannedQty * (1 + scrapPct / 100);
          const unitRate = parseFloat(bi.component?.cost_price || bi.component?.price || 0);
          const itemPlannedCost = reqQty * unitRate;

          plannedMaterialCost += itemPlannedCost;

          plannedComponents.push({
            component_type: 'MATERIAL',
            product_id: bi.component_id,
            description: `BOM Planned: ${bi.component?.name || 'Component'}`,
            planned_quantity: reqQty,
            actual_quantity: 0,
            unit_of_measure: bi.unit || 'pcs',
            unit_rate: unitRate,
            planned_cost: itemPlannedCost,
            actual_cost: 0,
            variance: -itemPlannedCost,
          });
        });
      }
    }

    if (order.routing_id) {
      const { data: routingOps } = await supabaseAdmin
        .from('routing_operations')
        .select('*')
        .eq('routing_id', order.routing_id);

      if (routingOps) {
        routingOps.forEach((op) => {
          const runMins = parseFloat(op.run_time_mins || 0);
          const setupMins = parseFloat(op.setup_time_mins || 0);
          const totalHours = ((runMins + setupMins) / 60) * plannedQty;

          const wcRate = op.work_center_id ? wcRateMap[op.work_center_id] : null;
          const laborRate = wcRate ? parseFloat(wcRate.hourly_labor_rate) : defaultLaborRate;
          const overheadRate = wcRate ? parseFloat(wcRate.hourly_overhead_rate) : defaultOverheadRate;

          const opLaborCost = totalHours * laborRate;
          const opOverheadCost = allocationBasis === 'PER_HOUR' ? totalHours * overheadRate : (plannedQty * overheadRate);

          plannedLaborCost += opLaborCost;
          plannedOverheadCost += opOverheadCost;

          plannedComponents.push({
            component_type: 'LABOR',
            work_center_id: op.work_center_id || null,
            operation_name: op.operation_name,
            description: `Routing Planned Labor: ${op.operation_name}`,
            planned_quantity: totalHours,
            actual_quantity: 0,
            unit_of_measure: 'hrs',
            unit_rate: laborRate,
            planned_cost: opLaborCost,
            actual_cost: 0,
            variance: -opLaborCost,
          });

          plannedComponents.push({
            component_type: 'OVERHEAD',
            work_center_id: op.work_center_id || null,
            operation_name: op.operation_name,
            description: `Routing Planned Overhead: ${op.operation_name}`,
            planned_quantity: totalHours,
            actual_quantity: 0,
            unit_of_measure: 'hrs',
            unit_rate: overheadRate,
            planned_cost: opOverheadCost,
            actual_cost: 0,
            variance: -opOverheadCost,
          });
        });
      }
    }

    const plannedTotalCost = plannedMaterialCost + plannedLaborCost + plannedOverheadCost;

    // B. CALCULATE ACTUAL COSTS (From Material Consumptions & Operation Execution)
    let actualMaterialCost = 0;
    let actualLaborCost = 0;
    let actualOverheadCost = 0;
    const actualComponents = [];

    // 1. Actual Material Consumptions
    const { data: consumptions } = await supabaseAdmin
      .from('production_material_consumptions')
      .select(`
        *,
        product:products (id, product_code, name, unit, price, cost_price)
      `)
      .eq('production_order_id', id);

    if (consumptions && consumptions.length > 0) {
      consumptions.forEach((c) => {
        const qty = parseFloat(c.quantity || 0);
        const unitRate = parseFloat(c.product?.cost_price || c.product?.price || 0);
        const itemActualCost = qty * unitRate;

        actualMaterialCost += itemActualCost;

        actualComponents.push({
          component_type: 'MATERIAL',
          product_id: c.product_id,
          description: `Actual Issued: ${c.product?.name || 'Material'}`,
          planned_quantity: 0,
          actual_quantity: qty,
          unit_of_measure: c.unit || 'pcs',
          unit_rate: unitRate,
          planned_cost: 0,
          actual_cost: itemActualCost,
          variance: itemActualCost,
        });
      });
    }

    // 2. Actual Labor & Overhead from Operations Execution
    const { data: operations } = await supabaseAdmin
      .from('production_operations')
      .select('*')
      .eq('production_order_id', id);

    if (operations && operations.length > 0) {
      operations.forEach((op) => {
        // Compute hours based on actual_start and actual_end if available, else standard fallback
        let actualHours = 0;
        if (op.actual_start && op.actual_end) {
          const diffMs = new Date(op.actual_end).getTime() - new Date(op.actual_start).getTime();
          actualHours = Math.max(0.1, diffMs / (1000 * 60 * 60));
        } else {
          actualHours = (parseFloat(op.completed_quantity || 1) * 0.5); // default 30 mins per completed unit
        }

        const wcRate = op.work_center_id ? wcRateMap[op.work_center_id] : null;
        const laborRate = wcRate ? parseFloat(wcRate.hourly_labor_rate) : defaultLaborRate;
        const overheadRate = wcRate ? parseFloat(wcRate.hourly_overhead_rate) : defaultOverheadRate;

        const opLaborCost = actualHours * laborRate;
        const opOverheadCost = allocationBasis === 'PER_HOUR'
          ? actualHours * overheadRate
          : parseFloat(order.completed_quantity || 0) * overheadRate;

        actualLaborCost += opLaborCost;
        actualOverheadCost += opOverheadCost;

        actualComponents.push({
          component_type: 'LABOR',
          work_center_id: op.work_center_id || null,
          operation_name: op.operation_name,
          description: `Actual Labor: ${op.operation_name}`,
          planned_quantity: 0,
          actual_quantity: actualHours,
          unit_of_measure: 'hrs',
          unit_rate: laborRate,
          planned_cost: 0,
          actual_cost: opLaborCost,
          variance: opLaborCost,
        });

        actualComponents.push({
          component_type: 'OVERHEAD',
          work_center_id: op.work_center_id || null,
          operation_name: op.operation_name,
          description: `Actual Overhead: ${op.operation_name}`,
          planned_quantity: 0,
          actual_quantity: actualHours,
          unit_of_measure: 'hrs',
          unit_rate: overheadRate,
          planned_cost: 0,
          actual_cost: opOverheadCost,
          variance: opOverheadCost,
        });
      });
    }

    const actualTotalCost = actualMaterialCost + actualLaborCost + actualOverheadCost;

    // C. VARIANCE CALCULATIONS
    const matVar = actualMaterialCost - plannedMaterialCost;
    const labVar = actualLaborCost - plannedLaborCost;
    const ovhVar = actualOverheadCost - plannedOverheadCost;
    const totalVar = actualTotalCost - plannedTotalCost;
    const totalVarPct = plannedTotalCost > 0 ? (totalVar / plannedTotalCost) * 100 : 0;

    const completedQty = parseFloat(order.completed_quantity || 0);
    const unitCost = completedQty > 0 ? actualTotalCost / completedQty : 0;
    const wipQty = Math.max(0, plannedQty - completedQty);

    // D. UPSERT MANUFACTURING COSTS RECORD
    const costing_number = await generateSequenceNumber('manufacturing_costs', 'costing_number', 'COST');

    const { data: existingCost } = await supabaseAdmin
      .from('manufacturing_costs')
      .select('id, costing_number, status')
      .eq('production_order_id', id)
      .maybeSingle();

    const costingPayload = {
      costing_number: existingCost ? existingCost.costing_number : costing_number,
      production_order_id: id,
      product_id: order.product_id,
      planned_quantity: plannedQty,
      completed_quantity: completedQty,
      wip_quantity: wipQty,
      material_cost: actualMaterialCost,
      labor_cost: actualLaborCost,
      overhead_cost: actualOverheadCost,
      total_cost: actualTotalCost,
      unit_cost: unitCost,
      planned_material_cost: plannedMaterialCost,
      planned_labor_cost: plannedLaborCost,
      planned_overhead_cost: plannedOverheadCost,
      planned_total_cost: plannedTotalCost,
      material_variance: matVar,
      labor_variance: labVar,
      overhead_variance: ovhVar,
      total_variance: totalVar,
      total_variance_pct: totalVarPct,
      status: existingCost ? existingCost.status : 'CALCULATED',
      costing_method: config?.costing_method || 'ACTUAL_COST',
      calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: req.profile?.id || null,
    };

    const { data: savedCost, error: saveErr } = await supabaseAdmin
      .from('manufacturing_costs')
      .upsert(costingPayload, { onConflict: 'production_order_id' })
      .select()
      .single();

    if (saveErr) throw saveErr;

    // E. UPDATE COST COMPONENTS TABLE
    await supabaseAdmin
      .from('manufacturing_cost_components')
      .delete()
      .eq('manufacturing_cost_id', savedCost.id);

    const allComponents = [...plannedComponents, ...actualComponents].map((comp) => ({
      ...comp,
      manufacturing_cost_id: savedCost.id,
    }));

    if (allComponents.length > 0) {
      await supabaseAdmin.from('manufacturing_cost_components').insert(allComponents);
    }

    // F. CREATE / UPDATE WIP RECORD
    const wip_number = await generateSequenceNumber('wip_records', 'wip_number', 'WIP');
    const isCompleted = completedQty >= plannedQty;
    const wipStatus = isCompleted ? 'COMPLETED' : (completedQty > 0 ? 'PARTIALLY_COMPLETED' : 'OPEN');

    const wipRatio = plannedQty > 0 ? (wipQty / plannedQty) : 1;
    const matWip = actualMaterialCost * wipRatio;
    const labWip = actualLaborCost * wipRatio;
    const ovhWip = actualOverheadCost * wipRatio;
    const totalWip = matWip + labWip + ovhWip;

    await supabaseAdmin
      .from('wip_records')
      .upsert({
        wip_number,
        production_order_id: id,
        product_id: order.product_id,
        wip_quantity: wipQty,
        material_wip: matWip,
        labor_wip: labWip,
        overhead_wip: ovhWip,
        total_wip: totalWip,
        as_of_date: new Date().toISOString().split('T')[0],
        status: wipStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'production_order_id' });

    return res.json({
      success: true,
      data: savedCost,
      message: `Production cost calculated successfully for ${order.production_order_number}.`,
    });
  } catch (error) {
    console.error('calculateProductionCost error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * ATOMIC GENERAL LEDGER POSTING
 */
const postProductionCost = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Manufacturing Cost record
    const { data: mfgCost, error: costErr } = await supabaseAdmin
      .from('manufacturing_costs')
      .select(`
        *,
        order:production_orders (
          id,
          production_order_number,
          product:products (id, product_code, name)
        )
      `)
      .eq('production_order_id', id)
      .single();

    if (costErr || !mfgCost) {
      return res.status(404).json({ success: false, message: 'Manufacturing cost calculation record not found. Please calculate cost first.' });
    }

    if (mfgCost.status === 'POSTED') {
      return res.status(400).json({ success: false, message: 'Manufacturing cost has already been posted to the General Ledger.' });
    }

    // 2. Fetch Cost Configuration and Account Mappings
    const { data: config } = await supabaseAdmin
      .from('manufacturing_cost_configurations')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!config || !config.wip_account_id || !config.finished_goods_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required GL Account Mappings (WIP, Finished Goods, Material Issue, Labor Allocation, Overhead). Please configure accounts in Cost Configuration.',
      });
    }

    // 3. Fetch OPEN Financial Period
    const currentDate = new Date().toISOString().split('T')[0];
    const { data: period, error: periodErr } = await supabaseAdmin
      .from('financial_periods')
      .select('id')
      .lte('start_date', currentDate)
      .gte('end_date', currentDate)
      .eq('status', 'OPEN')
      .limit(1)
      .maybeSingle();

    if (periodErr || !period) {
      return res.status(400).json({ success: false, message: 'No OPEN financial period found for current date. Posting blocked.' });
    }

    // 4. Construct Journal Entry Lines
    // Total Debit = Total Credit
    const totalCost = parseFloat(mfgCost.total_cost || 0);
    const matCost = parseFloat(mfgCost.material_cost || 0);
    const labCost = parseFloat(mfgCost.labor_cost || 0);
    const ovhCost = parseFloat(mfgCost.overhead_cost || 0);

    if (totalCost <= 0) {
      return res.status(400).json({ success: false, message: 'Total manufacturing cost must be greater than 0 to post journal entries.' });
    }

    const journalNumber = `JE-MFG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const isCompleted = parseFloat(mfgCost.completed_quantity || 0) >= parseFloat(mfgCost.planned_quantity || 1);
    const targetAccountId = isCompleted ? config.finished_goods_account_id : config.wip_account_id;
    const targetAccountName = isCompleted ? 'Finished Goods Inventory' : 'Work-In-Progress Inventory';

    const linesPayload = [
      {
        account_id: targetAccountId,
        description: `Manufacturing Cost Absorption: ${mfgCost.order?.production_order_number} (${targetAccountName})`,
        debit: totalCost,
        credit: 0.00,
      },
    ];

    if (matCost > 0 && config.raw_material_account_id) {
      linesPayload.push({
        account_id: config.raw_material_account_id,
        description: `Direct Material Issue: ${mfgCost.order?.production_order_number}`,
        debit: 0.00,
        credit: matCost,
      });
    }

    if (labCost > 0 && config.labor_cost_account_id) {
      linesPayload.push({
        account_id: config.labor_cost_account_id,
        description: `Direct Labor Allocation: ${mfgCost.order?.production_order_number}`,
        debit: 0.00,
        credit: labCost,
      });
    }

    if (ovhCost > 0 && config.overhead_cost_account_id) {
      linesPayload.push({
        account_id: config.overhead_cost_account_id,
        description: `Manufacturing Overhead Allocation: ${mfgCost.order?.production_order_number}`,
        debit: 0.00,
        credit: ovhCost,
      });
    }

    // Validate Total Debit === Total Credit
    const totalDebit = linesPayload.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = linesPayload.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Journal Entry imbalance detected! Total Debit (₹${totalDebit.toFixed(2)}) !== Total Credit (₹${totalCredit.toFixed(2)}). Posting blocked.`,
      });
    }

    // 5. Insert Journal Entry Header
    const { data: journal, error: jeErr } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        journal_number: journalNumber,
        entry_date: currentDate,
        financial_period_id: period.id,
        reference_type: 'MANUFACTURING_COST',
        reference_id: mfgCost.id,
        description: `Production Order ${mfgCost.order?.production_order_number} Cost Absorption`,
        status: 'POSTED',
        total_debit: totalDebit,
        total_credit: totalCredit,
        posted_at: new Date().toISOString(),
        posted_by: req.profile?.id || null,
      })
      .select()
      .single();

    if (jeErr) throw jeErr;

    // 6. Insert Journal Entry Lines
    const linesWithJeId = linesPayload.map((l) => ({ ...l, journal_entry_id: journal.id }));
    const { error: linesErr } = await supabaseAdmin.from('journal_entry_lines').insert(linesWithJeId);
    if (linesErr) throw linesErr;

    // 7. Update Manufacturing Costs status to POSTED
    const { data: updatedCost, error: updateErr } = await supabaseAdmin
      .from('manufacturing_costs')
      .update({
        status: 'POSTED',
        journal_entry_id: journal.id,
        posted_at: new Date().toISOString(),
        posted_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mfgCost.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 8. Record Variance Log if completed
    if (isCompleted && Math.abs(mfgCost.total_variance) > 0.01) {
      const varNumber = `VAR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
      await supabaseAdmin.from('manufacturing_variances').insert({
        variance_number: varNumber,
        production_order_id: id,
        product_id: mfgCost.product_id,
        material_qty_variance: mfgCost.material_variance,
        labor_efficiency_variance: mfgCost.labor_variance,
        overhead_variance: mfgCost.overhead_variance,
        total_variance: mfgCost.total_variance,
        recorded_at: new Date().toISOString(),
        journal_entry_id: journal.id,
        notes: `Production completion variance posted for ${mfgCost.order?.production_order_number}`,
      });
    }

    return res.json({
      success: true,
      data: updatedCost,
      journal,
      message: `Manufacturing cost posted successfully to General Ledger (Journal ${journalNumber}).`,
    });
  } catch (error) {
    console.error('postProductionCost error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET WIP RECORDS LIST & AGING
 */
const getWIPRecords = async (req, res) => {
  try {
    const { search, status, product_id } = req.query;
    let query = supabaseAdmin
      .from('wip_records')
      .select(`
        *,
        product:products (id, product_code, name, unit),
        production_order:production_orders (
          id,
          production_order_number,
          planned_quantity,
          completed_quantity,
          status,
          actual_start
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (product_id) query = query.eq('product_id', product_id);

    const { data, error } = await query;
    if (error) throw error;

    // Calculate WIP Age in Days
    const formatted = (data || []).map((w) => {
      const startDate = w.production_order?.actual_start || w.created_at;
      const diffMs = new Date().getTime() - new Date(startDate).getTime();
      const ageDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      return {
        ...w,
        age_days: ageDays,
      };
    });

    let filtered = formatted;
    if (search) {
      const lower = search.toLowerCase();
      filtered = formatted.filter((w) =>
        w.wip_number.toLowerCase().includes(lower) ||
        w.production_order?.production_order_number?.toLowerCase().includes(lower) ||
        w.product?.name?.toLowerCase().includes(lower)
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('getWIPRecords error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * CLOSE WIP RECORD
 */
const closeWIPRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: wip, error: wipErr } = await supabaseAdmin
      .from('wip_records')
      .select('*')
      .eq('id', id)
      .single();

    if (wipErr || !wip) {
      return res.status(404).json({ success: false, message: 'WIP record not found.' });
    }

    const { data, error } = await supabaseAdmin
      .from('wip_records')
      .update({
        status: 'CLOSED',
        closed_at: new Date().toISOString(),
        closed_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: `WIP Record ${wip.wip_number} closed successfully.` });
  } catch (error) {
    console.error('closeWIPRecord error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET MANUFACTURING VARIANCES
 */
const getManufacturingVariances = async (req, res) => {
  try {
    const { search, product_id } = req.query;

    let query = supabaseAdmin
      .from('manufacturing_variances')
      .select(`
        *,
        product:products (id, product_code, name, unit),
        production_order:production_orders (id, production_order_number)
      `)
      .order('recorded_at', { ascending: false });

    if (product_id) query = query.eq('product_id', product_id);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter((v) =>
        v.variance_number.toLowerCase().includes(lower) ||
        v.production_order?.production_order_number?.toLowerCase().includes(lower) ||
        v.product?.name?.toLowerCase().includes(lower)
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('getManufacturingVariances error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET / UPDATE COST CONFIGURATION
 */
const getCostingConfiguration = async (req, res) => {
  try {
    const { data: config, error } = await supabaseAdmin
      .from('manufacturing_cost_configurations')
      .select(`
        *,
        raw_material_account:chart_of_accounts!raw_material_account_id (id, account_code, account_name),
        wip_account:chart_of_accounts!wip_account_id (id, account_code, account_name),
        finished_goods_account:chart_of_accounts!finished_goods_account_id (id, account_code, account_name),
        labor_cost_account:chart_of_accounts!labor_cost_account_id (id, account_code, account_name),
        overhead_cost_account:chart_of_accounts!overhead_cost_account_id (id, account_code, account_name),
        variance_account:chart_of_accounts!variance_account_id (id, account_code, account_name)
      `)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const { data: wcRates } = await supabaseAdmin
      .from('work_center_cost_rates')
      .select(`
        *,
        work_center:work_centers (id, code, name)
      `);

    return res.json({
      success: true,
      data: {
        config: config || {},
        wc_rates: wcRates || [],
      },
    });
  } catch (error) {
    console.error('getCostingConfiguration error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

const updateCostingConfiguration = async (req, res) => {
  try {
    const {
      costing_method,
      default_hourly_labor_rate,
      default_hourly_overhead_rate,
      overhead_allocation_basis,
      raw_material_account_id,
      wip_account_id,
      finished_goods_account_id,
      labor_cost_account_id,
      overhead_cost_account_id,
      variance_account_id,
      wc_rates,
    } = req.body;

    const { data: existing } = await supabaseAdmin
      .from('manufacturing_cost_configurations')
      .select('id')
      .limit(1)
      .maybeSingle();

    const payload = {
      costing_method: costing_method || 'ACTUAL_COST',
      default_hourly_labor_rate: default_hourly_labor_rate ? parseFloat(default_hourly_labor_rate) : 250.00,
      default_hourly_overhead_rate: default_hourly_overhead_rate ? parseFloat(default_hourly_overhead_rate) : 150.00,
      overhead_allocation_basis: overhead_allocation_basis || 'PER_HOUR',
      raw_material_account_id: raw_material_account_id || null,
      wip_account_id: wip_account_id || null,
      finished_goods_account_id: finished_goods_account_id || null,
      labor_cost_account_id: labor_cost_account_id || null,
      overhead_cost_account_id: overhead_cost_account_id || null,
      variance_account_id: variance_account_id || null,
      updated_at: new Date().toISOString(),
      updated_by: req.profile?.id || null,
    };

    let updatedConfig = null;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('manufacturing_cost_configurations')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      updatedConfig = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('manufacturing_cost_configurations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      updatedConfig = data;
    }

    // Upsert Work Center Rates if provided
    if (Array.isArray(wc_rates)) {
      for (const r of wc_rates) {
        if (r.work_center_id) {
          await supabaseAdmin.from('work_center_cost_rates').upsert({
            work_center_id: r.work_center_id,
            hourly_labor_rate: parseFloat(r.hourly_labor_rate || 250.00),
            hourly_overhead_rate: parseFloat(r.hourly_overhead_rate || 150.00),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'work_center_id' });
        }
      }
    }

    return res.json({ success: true, data: updatedConfig, message: 'Manufacturing cost configuration updated successfully.' });
  } catch (error) {
    console.error('updateCostingConfiguration error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

/**
 * GET MANUFACTURING COST REPORTS
 */
const getCostingReports = async (req, res) => {
  try {
    const { report_type = 'PRODUCT' } = req.query;

    const { data: costs } = await supabaseAdmin
      .from('manufacturing_costs')
      .select(`
        *,
        product:products (id, product_code, name, unit),
        order:production_orders (id, production_order_number)
      `);

    let reportData = [];

    if (report_type === 'PRODUCT') {
      const prodMap = {};
      (costs || []).forEach((c) => {
        const prodId = c.product_id;
        if (!prodMap[prodId]) {
          prodMap[prodId] = {
            product_id: prodId,
            product_code: c.product?.product_code,
            product_name: c.product?.name,
            unit: c.product?.unit,
            total_orders: 0,
            completed_quantity: 0,
            material_cost: 0,
            labor_cost: 0,
            overhead_cost: 0,
            total_cost: 0,
            total_variance: 0,
          };
        }

        prodMap[prodId].total_orders += 1;
        prodMap[prodId].completed_quantity += parseFloat(c.completed_quantity || 0);
        prodMap[prodId].material_cost += parseFloat(c.material_cost || 0);
        prodMap[prodId].labor_cost += parseFloat(c.labor_cost || 0);
        prodMap[prodId].overhead_cost += parseFloat(c.overhead_cost || 0);
        prodMap[prodId].total_cost += parseFloat(c.total_cost || 0);
        prodMap[prodId].total_variance += parseFloat(c.total_variance || 0);
      });

      reportData = Object.values(prodMap).map((p) => ({
        ...p,
        average_unit_cost: p.completed_quantity > 0 ? p.total_cost / p.completed_quantity : 0,
      }));
    } else {
      reportData = costs || [];
    }

    return res.json({ success: true, data: reportData });
  } catch (error) {
    console.error('getCostingReports error:', error);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: error.message });
  }
};

module.exports = {
  getCostingDashboard,
  getProductionCostOrders,
  getProductionCostOrderById,
  calculateProductionCost,
  postProductionCost,
  getWIPRecords,
  closeWIPRecord,
  getManufacturingVariances,
  getCostingConfiguration,
  updateCostingConfiguration,
  getCostingReports,
};
