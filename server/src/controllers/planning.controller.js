const { supabaseAdmin } = require('../config/supabase');

/**
 * Controller for Production Planning & Scheduling ERP Module (Prompt 35)
 */

// 1. GET PLANNING DASHBOARD TELEMETRY
exports.getPlanningDashboard = async (req, res) => {
  try {
    // 1. Fetch active plans count & status summary
    const { data: plans, error: planErr } = await supabaseAdmin
      .from('production_plans')
      .select('id, status, start_date, end_date');

    if (planErr) throw planErr;

    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => ['APPROVED', 'IN_PROGRESS'].includes(p.status)).length;
    const draftPlans = plans.filter((p) => p.status === 'DRAFT').length;

    // 2. Fetch pending demand lines from eligible sales orders (CONFIRMED / IN_PROGRESS)
    const { data: eligibleSalesOrders, error: soErr } = await supabaseAdmin
      .from('sales_orders')
      .select('id, order_number, customer_id, created_at, sales_order_items(id, product_id, quantity, delivery_date)')
      .in('status', ['CONFIRMED', 'PROCESSING', 'APPROVED', 'IN_PROGRESS']);

    if (soErr) throw soErr;

    let pendingDemandCount = 0;
    (eligibleSalesOrders || []).forEach((so) => {
      pendingDemandCount += (so.sales_order_items || []).length;
    });

    // 3. Fetch scheduled work orders count & status
    const { data: schedules, error: schedErr } = await supabaseAdmin
      .from('work_order_schedules')
      .select('id, status, planned_start, planned_end, actual_start, actual_end');

    if (schedErr) throw schedErr;

    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => ['SCHEDULED', 'IN_PROGRESS'].includes(s.status)).length;
    const conflictedSchedules = schedules.filter((s) => s.status === 'CONFLICTED').length;

    // 4. Fetch Work Centers to evaluate capacity
    const { data: workCenters, error: wcErr } = await supabaseAdmin
      .from('work_centers')
      .select('id, code, name, capacity, status')
      .eq('status', 'ACTIVE');

    if (wcErr) throw wcErr;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total_plans: totalPlans,
          active_plans: activePlans,
          draft_plans: draftPlans,
          pending_demand_items: pendingDemandCount,
          total_schedules: totalSchedules,
          active_schedules: activeSchedules,
          conflicted_schedules: conflictedSchedules,
          active_work_centers: workCenters.length,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching planning dashboard:', err);
    return res.status(500).json({ success: false, message: 'Failed to load production planning dashboard.', error: err.message });
  }
};

// 2. GET PRODUCTION PLANS LIST
exports.getProductionPlans = async (req, res) => {
  try {
    const { search, status, period_type, start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('production_plans')
      .select(`
        *,
        created_by_profile:profiles!created_by(id, full_name, email),
        approved_by_profile:profiles!approved_by(id, full_name, email),
        production_plan_lines(id, product_id, planned_quantity, status)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (period_type) query = query.eq('period_type', period_type);
    if (start_date) query = query.gte('start_date', start_date);
    if (end_date) query = query.lte('end_date', end_date);
    if (search) {
      query = query.or(`plan_number.ilike.%${search}%,plan_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching production plans:', err);
    return res.status(500).json({ success: false, message: 'Failed to load production plans list.', error: err.message });
  }
};

// 3. GET PRODUCTION PLAN BY ID
exports.getProductionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plan, error: planErr } = await supabaseAdmin
      .from('production_plans')
      .select(`
        *,
        created_by_profile:profiles!created_by(id, full_name, email),
        approved_by_profile:profiles!approved_by(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (planErr || !plan) {
      return res.status(404).json({ success: false, message: 'Production Plan not found.' });
    }

    // Fetch line items with products & sales orders
    const { data: lines, error: lineErr } = await supabaseAdmin
      .from('production_plan_lines')
      .select(`
        *,
        product:products(id, product_code, name, unit),
        sales_order:sales_orders(id, order_number, customer_id),
        production_order:production_orders(id, production_order_number, status, planned_quantity, completed_quantity)
      `)
      .eq('production_plan_id', id)
      .order('line_number', { ascending: true });

    if (lineErr) throw lineErr;

    return res.status(200).json({
      success: true,
      data: {
        plan,
        lines,
      },
    });
  } catch (err) {
    console.error('Error fetching production plan detail:', err);
    return res.status(500).json({ success: false, message: 'Failed to load production plan detail.', error: err.message });
  }
};

// 4. CREATE PRODUCTION PLAN
exports.createProductionPlan = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { plan_name, period_type, start_date, end_date, description, lines } = req.body;

    if (!plan_name || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Plan Name, Start Date, and End Date are required.' });
    }

    // Insert Plan Header
    const { data: plan, error: planErr } = await supabaseAdmin
      .from('production_plans')
      .insert({
        plan_name,
        period_type: period_type || 'MONTHLY',
        start_date,
        end_date,
        status: 'DRAFT',
        description,
        created_by: userId,
      })
      .select()
      .single();

    if (planErr) throw planErr;

    // Insert Plan Lines if provided
    if (Array.isArray(lines) && lines.length > 0) {
      const lineRows = lines.map((l, index) => ({
        production_plan_id: plan.id,
        line_number: index + 1,
        product_id: l.product_id,
        planned_quantity: l.planned_quantity,
        required_date: l.required_date || end_date,
        demand_source: l.demand_source || 'MANUAL',
        sales_order_id: l.sales_order_id || null,
        sales_order_item_id: l.sales_order_item_id || null,
        priority: l.priority || 'NORMAL',
        notes: l.notes || null,
      }));

      const { error: insertLineErr } = await supabaseAdmin
        .from('production_plan_lines')
        .insert(lineRows);

      if (insertLineErr) throw insertLineErr;
    }

    return res.status(201).json({
      success: true,
      message: `Production Plan ${plan.plan_number} created successfully in DRAFT status.`,
      data: plan,
    });
  } catch (err) {
    console.error('Error creating production plan:', err);
    return res.status(500).json({ success: false, message: 'Failed to create production plan.', error: err.message });
  }
};

// 5. UPDATE PRODUCTION PLAN
exports.updateProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, period_type, start_date, end_date, description, status, lines } = req.body;

    const { data: existingPlan, error: fetchErr } = await supabaseAdmin
      .from('production_plans')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchErr || !existingPlan) {
      return res.status(404).json({ success: false, message: 'Production plan not found.' });
    }

    if (['APPROVED', 'COMPLETED', 'CANCELLED'].includes(existingPlan.status) && !status) {
      return res.status(400).json({ success: false, message: `Cannot modify a plan in ${existingPlan.status} status.` });
    }

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };
    if (plan_name) updatePayload.plan_name = plan_name;
    if (period_type) updatePayload.period_type = period_type;
    if (start_date) updatePayload.start_date = start_date;
    if (end_date) updatePayload.end_date = end_date;
    if (description !== undefined) updatePayload.description = description;
    if (status) updatePayload.status = status;

    const { data: updatedPlan, error: updateErr } = await supabaseAdmin
      .from('production_plans')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update lines if provided
    if (Array.isArray(lines)) {
      await supabaseAdmin.from('production_plan_lines').delete().eq('production_plan_id', id);

      const lineRows = lines.map((l, index) => ({
        production_plan_id: id,
        line_number: index + 1,
        product_id: l.product_id,
        planned_quantity: l.planned_quantity,
        required_date: l.required_date || updatedPlan.end_date,
        demand_source: l.demand_source || 'MANUAL',
        sales_order_id: l.sales_order_id || null,
        sales_order_item_id: l.sales_order_item_id || null,
        priority: l.priority || 'NORMAL',
        notes: l.notes || null,
      }));

      await supabaseAdmin.from('production_plan_lines').insert(lineRows);
    }

    return res.status(200).json({
      success: true,
      message: 'Production Plan updated successfully.',
      data: updatedPlan,
    });
  } catch (err) {
    console.error('Error updating production plan:', err);
    return res.status(500).json({ success: false, message: 'Failed to update production plan.', error: err.message });
  }
};

// 6. PLAN STATUS TRANSITIONS (Submit, Approve, Cancel)
exports.submitProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('production_plans')
      .update({ status: 'SUBMITTED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Production Plan submitted for approval.', data });
  } catch (err) {
    console.error('Error submitting plan:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit plan.', error: err.message });
  }
};

exports.approveProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabaseAdmin
      .from('production_plans')
      .update({
        status: 'APPROVED',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Production Plan approved successfully.', data });
  } catch (err) {
    console.error('Error approving plan:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve plan.', error: err.message });
  }
};

exports.cancelProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('production_plans')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Production Plan cancelled.', data });
  } catch (err) {
    console.error('Error cancelling plan:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel plan.', error: err.message });
  }
};

// 7. GENERATE PRODUCTION ORDERS FROM APPROVED PLAN LINES
exports.generateProductionOrdersFromPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Fetch plan & lines
    const { data: plan, error: planErr } = await supabaseAdmin
      .from('production_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (planErr || !plan) {
      return res.status(404).json({ success: false, message: 'Production Plan not found.' });
    }

    if (plan.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only APPROVED production plans can generate production orders.' });
    }

    const { data: lines, error: lineErr } = await supabaseAdmin
      .from('production_plan_lines')
      .select('*')
      .eq('production_plan_id', id)
      .is('production_order_id', null);

    if (lineErr) throw lineErr;

    if (!lines || lines.length === 0) {
      return res.status(400).json({ success: false, message: 'No unassigned plan lines available to generate production orders.' });
    }

    const generatedOrders = [];

    for (const line of lines) {
      // Find active BOM & Routing for the product
      const { data: bom } = await supabaseAdmin
        .from('boms')
        .select('id')
        .eq('product_id', line.product_id)
        .eq('status', 'ACTIVE')
        .limit(1)
        .single();

      const { data: routing } = await supabaseAdmin
        .from('routings')
        .select('id')
        .eq('product_id', line.product_id)
        .eq('status', 'ACTIVE')
        .limit(1)
        .single();

      // Create Production Order
      const { data: po, error: poErr } = await supabaseAdmin
        .from('production_orders')
        .insert({
          sales_order_id: line.sales_order_id || null,
          product_id: line.product_id,
          bom_id: bom ? bom.id : null,
          routing_id: routing ? routing.id : null,
          planned_quantity: line.planned_quantity,
          priority: line.priority || 'NORMAL',
          status: 'PLANNED',
          planned_start: plan.start_date,
          planned_end: line.required_date || plan.end_date,
          notes: `Generated from Production Plan ${plan.plan_number}`,
          created_by: userId,
        })
        .select()
        .single();

      if (!poErr && po) {
        generatedOrders.push(po);
        // Link production_order_id to plan line
        await supabaseAdmin
          .from('production_plan_lines')
          .update({
            production_order_id: po.id,
            status: 'SCHEDULED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', line.id);
      }
    }

    // Update Plan Status to IN_PROGRESS
    await supabaseAdmin
      .from('production_plans')
      .update({ status: 'IN_PROGRESS', updated_at: new Date().toISOString() })
      .eq('id', id);

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedOrders.length} Production Order(s) from Plan ${plan.plan_number}.`,
      data: generatedOrders,
    });
  } catch (err) {
    console.error('Error generating production orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate production orders.', error: err.message });
  }
};

// 8. MATERIAL REQUIREMENTS (MRP BASIC) CALCULATION
exports.calculateMaterialRequirements = async (req, res) => {
  try {
    const { plan_id, start_date, end_date } = req.query;

    let linesQuery = supabaseAdmin
      .from('production_plan_lines')
      .select(`
        id, planned_quantity, required_date,
        product:products(id, product_code, name, unit)
      `);

    if (plan_id) {
      linesQuery = linesQuery.eq('production_plan_id', plan_id);
    }

    const { data: lines, error: lineErr } = await linesQuery;
    if (lineErr) throw lineErr;

    // Fetch active BOMs for products in planning lines
    const productIds = Array.from(new Set((lines || []).map((l) => l.product?.id).filter(Boolean)));

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: boms, error: bomErr } = await supabaseAdmin
      .from('boms')
      .select('id, product_id, bom_items(id, component_id, quantity_per, unit, component:products!component_id(id, product_code, name, unit))')
      .in('product_id', productIds)
      .eq('status', 'ACTIVE');

    if (bomErr) throw bomErr;

    // Fetch stock balances & reservations for component items
    const componentIds = [];
    (boms || []).forEach((b) => {
      (b.bom_items || []).forEach((bi) => {
        if (bi.component_id) componentIds.push(bi.component_id);
      });
    });

    const uniqueComponentIds = Array.from(new Set(componentIds));

    let inventoryMap = {};
    if (uniqueComponentIds.length > 0) {
      const { data: invBalances } = await supabaseAdmin
        .from('inventory_balances')
        .select('product_id, on_hand_quantity, reserved_quantity, available_quantity')
        .in('product_id', uniqueComponentIds);

      (invBalances || []).forEach((inv) => {
        if (!inventoryMap[inv.product_id]) {
          inventoryMap[inv.product_id] = {
            on_hand: 0,
            reserved: 0,
            available: 0,
          };
        }
        inventoryMap[inv.product_id].on_hand += Number(inv.on_hand_quantity || 0);
        inventoryMap[inv.product_id].reserved += Number(inv.reserved_quantity || 0);
        inventoryMap[inv.product_id].available += Number(inv.available_quantity || 0);
      });
    }

    // Explode gross requirements
    const requirementMap = {};

    (lines || []).forEach((l) => {
      const activeBom = (boms || []).find((b) => b.product_id === l.product?.id);
      if (activeBom && activeBom.bom_items) {
        activeBom.bom_items.forEach((item) => {
          const compId = item.component_id;
          const grossReq = Number(item.quantity_per || 0) * Number(l.planned_quantity || 0);

          if (!requirementMap[compId]) {
            requirementMap[compId] = {
              component_id: compId,
              component_code: item.component?.product_code,
              component_name: item.component?.name,
              unit: item.component?.unit || item.unit,
              gross_requirement: 0,
              on_hand_quantity: inventoryMap[compId]?.on_hand || 0,
              reserved_quantity: inventoryMap[compId]?.reserved || 0,
              available_quantity: inventoryMap[compId]?.available || 0,
            };
          }
          requirementMap[compId].gross_requirement += grossReq;
        });
      }
    });

    const materialRequirements = Object.values(requirementMap).map((m) => {
      const shortage = Math.max(0, m.gross_requirement - m.available_quantity);
      let status = 'AVAILABLE';
      if (shortage > 0) {
        status = m.available_quantity > 0 ? 'PARTIAL' : 'SHORTAGE';
      }
      return {
        ...m,
        shortage_quantity: shortage,
        status,
      };
    });

    return res.status(200).json({ success: true, data: materialRequirements });
  } catch (err) {
    console.error('Error calculating material requirements:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate material requirements.', error: err.message });
  }
};

// 9. CAPACITY PLANNING CALCULATION
exports.calculateCapacityPlanning = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const startDateObj = start_date ? new Date(start_date) : new Date();
    const endDateObj = end_date ? new Date(end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Number of days in window
    const daysInPeriod = Math.max(1, Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)));

    // Fetch active Work Centers & Machines
    const { data: workCenters, error: wcErr } = await supabaseAdmin
      .from('work_centers')
      .select('*, machines(id, code, name, status)')
      .eq('status', 'ACTIVE');

    if (wcErr) throw wcErr;

    // Fetch schedules in date range
    const { data: schedules, error: schedErr } = await supabaseAdmin
      .from('work_order_schedules')
      .select('*')
      .gte('planned_start', startDateObj.toISOString())
      .lte('planned_end', endDateObj.toISOString())
      .neq('status', 'CANCELLED');

    if (schedErr) throw schedErr;

    // Fetch Maintenance Downtime
    const { data: maintenanceWO } = await supabaseAdmin
      .from('maintenance_work_orders')
      .select('id, machine_id, downtime_hours')
      .in('status', ['SCHEDULED', 'IN_PROGRESS']);

    let maintenanceMap = {};
    (maintenanceWO || []).forEach((m) => {
      if (m.machine_id) {
        maintenanceMap[m.machine_id] = (maintenanceMap[m.machine_id] || 0) + Number(m.downtime_hours || 0);
      }
    });

    const capacityReport = workCenters.map((wc) => {
      const dailyHours = 8.00;
      const totalAvailableHours = daysInPeriod * dailyHours * Number(wc.capacity || 1.0);

      // Scheduled hours for this work center
      const wcSchedules = (schedules || []).filter((s) => s.work_center_id === wc.id);
      let scheduledHours = 0;
      wcSchedules.forEach((s) => {
        scheduledHours += Number(s.setup_time_hours || 0) + Number(s.run_time_hours || 0);
      });

      // Maintenance downtime for work center's machines
      let maintenanceDowntimeHours = 0;
      (wc.machines || []).forEach((mc) => {
        maintenanceDowntimeHours += maintenanceMap[mc.id] || 0;
      });

      const netAvailableCapacity = Math.max(0, totalAvailableHours - maintenanceDowntimeHours);
      const utilizationPct = netAvailableCapacity > 0 ? (scheduledHours / netAvailableCapacity) * 100 : 0;
      const isOverCapacity = scheduledHours > netAvailableCapacity;

      return {
        work_center_id: wc.id,
        code: wc.code,
        name: wc.name,
        type: wc.type,
        machines: wc.machines || [],
        days_in_period: daysInPeriod,
        total_available_hours: totalAvailableHours,
        maintenance_downtime_hours: maintenanceDowntimeHours,
        net_available_hours: netAvailableCapacity,
        scheduled_hours: scheduledHours,
        utilization_pct: Math.round(utilizationPct * 100) / 100,
        status: isOverCapacity ? 'OVER_CAPACITY' : utilizationPct > 85 ? 'HIGH_LOAD' : 'NORMAL',
      };
    });

    return res.status(200).json({ success: true, data: capacityReport });
  } catch (err) {
    console.error('Error calculating capacity planning:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate capacity planning.', error: err.message });
  }
};

// 10. GET SCHEDULES & CONFLICT DETECTION
exports.getSchedules = async (req, res) => {
  try {
    const { search, work_center_id, machine_id, status, start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('work_order_schedules')
      .select(`
        *,
        production_order:production_orders(id, production_order_number, product:products(id, product_code, name)),
        work_center:work_centers(id, code, name),
        machine:machines(id, code, name)
      `)
      .order('planned_start', { ascending: true });

    if (work_center_id) query = query.eq('work_center_id', work_center_id);
    if (machine_id) query = query.eq('machine_id', machine_id);
    if (status) query = query.eq('status', status);
    if (start_date) query = query.gte('planned_start', start_date);
    if (end_date) query = query.lte('planned_end', end_date);

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    return res.status(500).json({ success: false, message: 'Failed to load production schedules.', error: err.message });
  }
};

// 11. CREATE WORK ORDER SCHEDULE WITH CONFLICT DETECTION
exports.createSchedule = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      production_order_id,
      production_operation_id,
      work_center_id,
      machine_id,
      planned_start,
      planned_end,
      setup_time_hours,
      run_time_hours,
      priority,
      notes,
    } = req.body;

    if (!production_order_id || !work_center_id || !planned_start || !planned_end) {
      return res.status(400).json({ success: false, message: 'Production Order, Work Center, Start Time, and End Time are required.' });
    }

    if (new Date(planned_start) >= new Date(planned_end)) {
      return res.status(400).json({ success: false, message: 'Planned Start time must be before Planned End time.' });
    }

    // Conflict Check: Check for overlapping schedules on the same Machine or Work Center
    let conflictQuery = supabaseAdmin
      .from('work_order_schedules')
      .select('id, schedule_number, planned_start, planned_end, work_center_id, machine_id')
      .neq('status', 'CANCELLED')
      .lt('planned_start', planned_end)
      .gt('planned_end', planned_start);

    if (machine_id) {
      conflictQuery = conflictQuery.eq('machine_id', machine_id);
    } else {
      conflictQuery = conflictQuery.eq('work_center_id', work_center_id);
    }

    const { data: conflicts, error: confErr } = await conflictQuery;
    if (confErr) throw confErr;

    const hasConflict = conflicts && conflicts.length > 0;
    const status = hasConflict ? 'CONFLICTED' : 'SCHEDULED';

    const { data: schedule, error: createErr } = await supabaseAdmin
      .from('work_order_schedules')
      .insert({
        production_order_id,
        production_operation_id: production_operation_id || null,
        work_center_id,
        machine_id: machine_id || null,
        planned_start,
        planned_end,
        setup_time_hours: setup_time_hours || 0,
        run_time_hours: run_time_hours || 0,
        priority: priority || 'NORMAL',
        status,
        notes,
        created_by: userId,
      })
      .select()
      .single();

    if (createErr) throw createErr;

    return res.status(201).json({
      success: true,
      has_conflict: hasConflict,
      conflict_details: hasConflict ? conflicts[0] : null,
      message: hasConflict
        ? `Schedule ${schedule.schedule_number} created with CONFLICT warning.`
        : `Schedule ${schedule.schedule_number} created successfully.`,
      data: schedule,
    });
  } catch (err) {
    console.error('Error creating schedule:', err);
    return res.status(500).json({ success: false, message: 'Failed to create schedule.', error: err.message });
  }
};

// 12. RESCHEDULE WORK ORDER WITH HISTORY AUDIT LOG
exports.rescheduleWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { new_planned_start, new_planned_end, new_work_center_id, new_machine_id, reason } = req.body;

    const { data: existingSched, error: fetchErr } = await supabaseAdmin
      .from('work_order_schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingSched) {
      return res.status(404).json({ success: false, message: 'Work order schedule not found.' });
    }

    const updatedStart = new_planned_start || existingSched.planned_start;
    const updatedEnd = new_planned_end || existingSched.planned_end;
    const updatedWc = new_work_center_id || existingSched.work_center_id;
    const updatedMc = new_machine_id !== undefined ? new_machine_id : existingSched.machine_id;

    // Log history
    await supabaseAdmin.from('schedule_history').insert({
      schedule_id: id,
      old_planned_start: existingSched.planned_start,
      old_planned_end: existingSched.planned_end,
      new_planned_start: updatedStart,
      new_planned_end: updatedEnd,
      old_work_center_id: existingSched.work_center_id,
      new_work_center_id: updatedWc,
      old_machine_id: existingSched.machine_id,
      new_machine_id: updatedMc,
      changed_by: userId,
      reason: reason || 'Schedule adjustment',
    });

    // Update Schedule
    const { data: updatedSched, error: updateErr } = await supabaseAdmin
      .from('work_order_schedules')
      .update({
        planned_start: updatedStart,
        planned_end: updatedEnd,
        work_center_id: updatedWc,
        machine_id: updatedMc,
        status: 'RESCHEDULED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: `Schedule ${updatedSched.schedule_number} rescheduled successfully.`,
      data: updatedSched,
    });
  } catch (err) {
    console.error('Error rescheduling work order:', err);
    return res.status(500).json({ success: false, message: 'Failed to reschedule work order.', error: err.message });
  }
};

// 13. GET PRODUCTION CALENDAR EVENTS
exports.getCalendarEvents = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('work_order_schedules')
      .select(`
        id, schedule_number, planned_start, planned_end, actual_start, actual_end, status, priority,
        production_order:production_orders(id, production_order_number, product:products(id, product_code, name)),
        work_center:work_centers(id, code, name),
        machine:machines(id, code, name)
      `)
      .neq('status', 'CANCELLED');

    if (start_date) query = query.gte('planned_start', start_date);
    if (end_date) query = query.lte('planned_end', end_date);

    const { data, error } = await query;
    if (error) throw error;

    const calendarEvents = (data || []).map((s) => ({
      id: s.id,
      title: `${s.schedule_number}: ${s.production_order?.product?.name || 'Production Order'}`,
      start: s.planned_start,
      end: s.planned_end,
      work_center: s.work_center?.name,
      machine: s.machine?.name,
      status: s.status,
      priority: s.priority,
      details: s,
    }));

    return res.status(200).json({ success: true, data: calendarEvents });
  } catch (err) {
    console.error('Error fetching production calendar events:', err);
    return res.status(500).json({ success: false, message: 'Failed to load calendar events.', error: err.message });
  }
};

// 14. GET PLANNING REPORTS (PLAN VS ACTUAL)
exports.getPlanningReports = async (req, res) => {
  try {
    const { plan_id } = req.query;

    let query = supabaseAdmin
      .from('production_plan_lines')
      .select(`
        id, line_number, planned_quantity, scheduled_quantity, completed_quantity, required_date, status,
        production_plan:production_plans(id, plan_number, plan_name),
        product:products(id, product_code, name, unit),
        production_order:production_orders(id, production_order_number, planned_quantity, completed_quantity, actual_start, actual_end)
      `);

    if (plan_id) query = query.eq('production_plan_id', plan_id);

    const { data: lines, error } = await query;
    if (error) throw error;

    const planVsActualReport = (lines || []).map((l) => {
      const planned = Number(l.planned_quantity || 0);
      const completed = Number(l.production_order?.completed_quantity || l.completed_quantity || 0);
      const remaining = Math.max(0, planned - completed);
      const completionPct = planned > 0 ? (completed / planned) * 100 : 0;

      return {
        plan_number: l.production_plan?.plan_number,
        plan_name: l.production_plan?.plan_name,
        product_code: l.product?.product_code,
        product_name: l.product?.name,
        unit: l.product?.unit,
        planned_quantity: planned,
        scheduled_quantity: Number(l.scheduled_quantity || 0),
        completed_quantity: completed,
        remaining_quantity: remaining,
        completion_pct: Math.round(completionPct * 100) / 100,
        required_date: l.required_date,
        production_order_number: l.production_order?.production_order_number,
        actual_start: l.production_order?.actual_start,
        actual_end: l.production_order?.actual_end,
        status: l.status,
      };
    });

    return res.status(200).json({ success: true, data: planVsActualReport });
  } catch (err) {
    console.error('Error generating planning report:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate planning report.', error: err.message });
  }
};
