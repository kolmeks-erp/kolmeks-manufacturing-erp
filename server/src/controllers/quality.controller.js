const { supabase } = require('../config/supabase');

/**
 * Helper: Generate unique format code (e.g., INS-2026-000001, IP-2026-000001, NCR-2026-000001, QHOLD-2026-000001)
 */
const generateSequenceNumber = async (table, column, prefix) => {
  const currentYear = new Date().getFullYear();
  const pattern = `${prefix}-${currentYear}-%`;
  
  const { data } = await supabase
    .from(table)
    .select(column)
    .like(column, pattern)
    .order(column, { ascending: false })
    .limit(1);

  let nextSeq = 1;
  if (data && data.length > 0) {
    const lastNum = data[0][column];
    const parts = lastNum.split('-');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }

  return `${prefix}-${currentYear}-${String(nextSeq).padStart(6, '0')}`;
};

/**
 * 1. INSPECTIONS
 */
const getInspections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type,
      status,
      result,
      productId,
      supplierId,
      inspectorId
    } = req.query;

    const from = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const to = from + parseInt(limit, 10) - 1;

    let query = supabase
      .from('quality_inspections')
      .select(`
        *,
        products (id, code, name),
        suppliers (id, supplier_code, company_name),
        goods_receipts (id, grn_number),
        production_orders (id, production_order_number),
        inspected_by_profile:profiles!quality_inspections_inspected_by_fkey (id, first_name, last_name, email)
      `, { count: 'exact' });

    if (type) query = query.eq('inspection_type', type);
    if (status) query = query.eq('status', status);
    if (result) query = query.eq('result', result);
    if (productId) query = query.eq('product_id', productId);
    if (supplierId) query = query.eq('supplier_id', supplierId);
    if (inspectorId) query = query.eq('inspected_by', inspectorId);

    if (search) {
      query = query.or(`inspection_number.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('getInspections Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quality inspections', error: error.message });
  }
};

const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: inspection, error } = await supabase
      .from('quality_inspections')
      .select(`
        *,
        products (*),
        suppliers (*),
        goods_receipts (*),
        purchase_orders (*),
        production_orders (*),
        production_operations (*),
        inspection_plans (*),
        inspected_by_profile:profiles!quality_inspections_inspected_by_fkey (id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    // Fetch measured results
    const { data: results } = await supabase
      .from('inspection_results')
      .select('*')
      .eq('inspection_id', id)
      .order('created_at', { ascending: true });

    // Fetch related quality holds
    const { data: holds } = await supabase
      .from('quality_holds')
      .select('*')
      .eq('inspection_id', id);

    // Fetch related NCRs
    const { data: ncrs } = await supabase
      .from('non_conformance_reports')
      .select('*')
      .eq('inspection_id', id);

    // Fetch timeline activities
    const { data: activities } = await supabase
      .from('quality_activities')
      .select('*')
      .eq('inspection_id', id)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...inspection,
        results: results || [],
        holds: holds || [],
        ncrs: ncrs || [],
        activities: activities || []
      }
    });
  } catch (error) {
    console.error('getInspectionById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch inspection details', error: error.message });
  }
};

const createInspection = async (req, res) => {
  try {
    const {
      inspection_type = 'INCOMING',
      product_id,
      supplier_id,
      grn_id,
      po_id,
      production_order_id,
      production_operation_id,
      inspection_plan_id,
      quantity_inspected = 0,
      notes
    } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product is required for inspection' });
    }

    const inspection_number = await generateSequenceNumber('quality_inspections', 'inspection_number', 'INS');

    const newInspection = {
      inspection_number,
      inspection_type,
      product_id,
      supplier_id: supplier_id || null,
      grn_id: grn_id || null,
      po_id: po_id || null,
      production_order_id: production_order_id || null,
      production_operation_id: production_operation_id || null,
      inspection_plan_id: inspection_plan_id || null,
      quantity_inspected: parseFloat(quantity_inspected) || 0,
      quantity_accepted: 0,
      quantity_rejected: 0,
      status: 'DRAFT',
      result: 'PENDING',
      inspected_by: req.user?.id || null,
      created_by: req.user?.id || null,
      notes
    };

    const { data, error } = await supabase
      .from('quality_inspections')
      .insert([newInspection])
      .select()
      .single();

    if (error) throw error;

    // If an inspection plan was selected, pre-populate characteristics
    if (inspection_plan_id) {
      const { data: planItems } = await supabase
        .from('inspection_plan_items')
        .select('*')
        .eq('plan_id', inspection_plan_id)
        .order('sequence', { ascending: true });

      if (planItems && planItems.length > 0) {
        const resultsToInsert = planItems.map(item => ({
          inspection_id: data.id,
          plan_item_id: item.id,
          characteristic_name: item.name,
          characteristic_type: item.type,
          target_value: item.target_value,
          min_value: item.min_value,
          max_value: item.max_value,
          unit: item.unit,
          result: 'PENDING'
        }));

        await supabase.from('inspection_results').insert(resultsToInsert);
      }
    }

    // Log Activity
    await supabase.from('quality_activities').insert([{
      inspection_id: data.id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'System User',
      activity_type: 'CREATED',
      description: `Quality inspection ${inspection_number} created (${inspection_type})`
    }]);

    return res.status(201).json({ success: true, data, message: 'Inspection created successfully' });
  } catch (error) {
    console.error('createInspection Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create quality inspection', error: error.message });
  }
};

const updateInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_inspected, quantity_accepted, quantity_rejected, notes, status, results } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id || null
    };

    if (quantity_inspected !== undefined) updatePayload.quantity_inspected = parseFloat(quantity_inspected);
    if (quantity_accepted !== undefined) updatePayload.quantity_accepted = parseFloat(quantity_accepted);
    if (quantity_rejected !== undefined) updatePayload.quantity_rejected = parseFloat(quantity_rejected);
    if (notes !== undefined) updatePayload.notes = notes;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from('quality_inspections')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update results if provided
    if (Array.isArray(results) && results.length > 0) {
      for (const resItem of results) {
        if (resItem.id) {
          // Calculate result if numeric
          let charResult = resItem.result || 'PENDING';
          if (resItem.characteristic_type === 'NUMERIC' && resItem.measured_value !== undefined && resItem.measured_value !== null) {
            const val = parseFloat(resItem.measured_value);
            const min = resItem.min_value !== null ? parseFloat(resItem.min_value) : -Infinity;
            const max = resItem.max_value !== null ? parseFloat(resItem.max_value) : Infinity;
            charResult = (val >= min && val <= max) ? 'PASS' : 'FAIL';
          }

          await supabase.from('inspection_results').update({
            measured_value: resItem.measured_value,
            text_value: resItem.text_value,
            boolean_value: resItem.boolean_value,
            result: charResult,
            notes: resItem.notes,
            updated_at: new Date().toISOString()
          }).eq('id', resItem.id);
        }
      }
    }

    return res.json({ success: true, data, message: 'Inspection updated successfully' });
  } catch (error) {
    console.error('updateInspection Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update inspection', error: error.message });
  }
};

const completeInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_accepted = 0, quantity_rejected = 0, notes } = req.body;

    const { data: inspection, error: fetchErr } = await supabase
      .from('quality_inspections')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const accepted = parseFloat(quantity_accepted);
    const rejected = parseFloat(quantity_rejected);
    const inspected = parseFloat(inspection.quantity_inspected);

    if (accepted < 0 || rejected < 0 || (accepted + rejected) > inspected) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantity breakdown. Accepted (${accepted}) + Rejected (${rejected}) must not exceed Inspected (${inspected}).`
      });
    }

    // Evaluate characteristics results
    const { data: results } = await supabase
      .from('inspection_results')
      .select('*')
      .eq('inspection_id', id);

    let hasFailure = rejected > 0;
    if (results && results.length > 0) {
      for (const item of results) {
        if (item.result === 'FAIL') {
          hasFailure = true;
        }
      }
    }

    let finalResult = 'PASS';
    let finalStatus = 'PASSED';

    if (rejected === inspected || (results?.length > 0 && accepted === 0)) {
      finalResult = 'FAIL';
      finalStatus = 'FAILED';
    } else if (hasFailure || rejected > 0) {
      finalResult = 'PARTIAL';
      finalStatus = 'PARTIALLY_ACCEPTED';
    }

    const { data: updated, error: updateErr } = await supabase
      .from('quality_inspections')
      .update({
        quantity_accepted: accepted,
        quantity_rejected: rejected,
        result: finalResult,
        status: finalStatus,
        notes: notes || inspection.notes,
        updated_at: new Date().toISOString(),
        updated_by: req.user?.id || null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log timeline
    await supabase.from('quality_activities').insert([{
      inspection_id: id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Quality Inspector',
      activity_type: 'COMPLETED',
      description: `Inspection completed with result ${finalResult} (Accepted: ${accepted}, Rejected: ${rejected})`
    }]);

    return res.json({ success: true, data: updated, message: `Inspection completed with result: ${finalResult}` });
  } catch (error) {
    console.error('completeInspection Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete inspection', error: error.message });
  }
};

/**
 * 2. INSPECTION PLANS
 */
const getInspectionPlans = async (req, res) => {
  try {
    const { search = '', productId, status } = req.query;

    let query = supabase
      .from('inspection_plans')
      .select(`
        *,
        products (id, code, name),
        inspection_plan_items (count)
      `);

    if (productId) query = query.eq('product_id', productId);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`plan_number.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getInspectionPlans Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch inspection plans', error: error.message });
  }
};

const getInspectionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plan, error } = await supabase
      .from('inspection_plans')
      .select(`
        *,
        products (*),
        inspection_plan_items (*)
      `)
      .eq('id', id)
      .single();

    if (error || !plan) {
      return res.status(404).json({ success: false, message: 'Inspection plan not found' });
    }

    return res.json({ success: true, data: plan });
  } catch (error) {
    console.error('getInspectionPlanById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch inspection plan details', error: error.message });
  }
};

const createInspectionPlan = async (req, res) => {
  try {
    const { product_id, version = 'V1', inspection_type = 'INCOMING', status = 'ACTIVE', description, items = [] } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product is required for inspection plan' });
    }

    const plan_number = await generateSequenceNumber('inspection_plans', 'plan_number', 'IP');

    const { data: plan, error } = await supabase
      .from('inspection_plans')
      .insert([{
        plan_number,
        product_id,
        version,
        inspection_type,
        status,
        description,
        created_by: req.user?.id || null
      }])
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item, idx) => ({
        plan_id: plan.id,
        sequence: (idx + 1) * 10,
        name: item.name,
        description: item.description || null,
        type: item.type || 'NUMERIC',
        target_value: item.target_value ? parseFloat(item.target_value) : null,
        min_value: item.min_value ? parseFloat(item.min_value) : null,
        max_value: item.max_value ? parseFloat(item.max_value) : null,
        unit: item.unit || 'mm',
        required: item.required !== false
      }));

      await supabase.from('inspection_plan_items').insert(itemsToInsert);
    }

    return res.status(201).json({ success: true, data: plan, message: 'Inspection plan created successfully' });
  } catch (error) {
    console.error('createInspectionPlan Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create inspection plan', error: error.message });
  }
};

/**
 * 3. NON-CONFORMANCE REPORTS (NCR)
 */
const getNCRs = async (req, res) => {
  try {
    const { search = '', status, severity, sourceType, productId, supplierId } = req.query;

    let query = supabase
      .from('non_conformance_reports')
      .select(`
        *,
        products (id, code, name),
        suppliers (id, supplier_code, company_name),
        quality_inspections (id, inspection_number),
        assigned_profile:profiles!non_conformance_reports_assigned_to_fkey (id, first_name, last_name, email)
      `);

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (sourceType) query = query.eq('source_type', sourceType);
    if (productId) query = query.eq('product_id', productId);
    if (supplierId) query = query.eq('supplier_id', supplierId);

    if (search) {
      query = query.or(`ncr_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getNCRs Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch NCRs', error: error.message });
  }
};

const getNCRById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ncr, error } = await supabase
      .from('non_conformance_reports')
      .select(`
        *,
        products (*),
        suppliers (*),
        quality_inspections (*),
        goods_receipts (*),
        production_orders (*),
        assigned_profile:profiles!non_conformance_reports_assigned_to_fkey (id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !ncr) {
      return res.status(404).json({ success: false, message: 'NCR not found' });
    }

    // Fetch timeline activities
    const { data: activities } = await supabase
      .from('quality_activities')
      .select('*')
      .eq('ncr_id', id)
      .order('created_at', { ascending: false });

    return res.json({ success: true, data: { ...ncr, activities: activities || [] } });
  } catch (error) {
    console.error('getNCRById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch NCR details', error: error.message });
  }
};

const createNCR = async (req, res) => {
  try {
    const {
      title,
      description,
      severity = 'MEDIUM',
      source_type = 'INCOMING_INSPECTION',
      inspection_id,
      product_id,
      supplier_id,
      production_order_id,
      grn_id,
      assigned_to,
      due_date
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const ncr_number = await generateSequenceNumber('non_conformance_reports', 'ncr_number', 'NCR');

    const newNCR = {
      ncr_number,
      title,
      description,
      severity,
      source_type,
      inspection_id: inspection_id || null,
      product_id: product_id || null,
      supplier_id: supplier_id || null,
      production_order_id: production_order_id || null,
      grn_id: grn_id || null,
      status: 'OPEN',
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      created_by: req.user?.id || null
    };

    const { data, error } = await supabase
      .from('non_conformance_reports')
      .insert([newNCR])
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('quality_activities').insert([{
      ncr_id: data.id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Quality Engineer',
      activity_type: 'CREATED',
      description: `Non-Conformance Report ${ncr_number} created with severity ${severity}`
    }]);

    return res.status(201).json({ success: true, data, message: 'NCR created successfully' });
  } catch (error) {
    console.error('createNCR Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create NCR', error: error.message });
  }
};

const updateNCR = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, root_cause, corrective_action, preventive_action, assigned_to, due_date, severity } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id || null
    };

    if (status !== undefined) updatePayload.status = status;
    if (root_cause !== undefined) updatePayload.root_cause = root_cause;
    if (corrective_action !== undefined) updatePayload.corrective_action = corrective_action;
    if (preventive_action !== undefined) updatePayload.preventive_action = preventive_action;
    if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to;
    if (due_date !== undefined) updatePayload.due_date = due_date;
    if (severity !== undefined) updatePayload.severity = severity;

    const { data, error } = await supabase
      .from('non_conformance_reports')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: 'NCR updated successfully' });
  } catch (error) {
    console.error('updateNCR Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update NCR', error: error.message });
  }
};

const closeNCR = async (req, res) => {
  try {
    const { id } = req.params;
    const { root_cause, corrective_action, preventive_action } = req.body;

    const { data: ncr, error: fetchErr } = await supabase
      .from('non_conformance_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !ncr) {
      return res.status(404).json({ success: false, message: 'NCR not found' });
    }

    const finalRootCause = root_cause || ncr.root_cause;
    const finalCorrective = corrective_action || ncr.corrective_action;

    if (!finalRootCause || !finalCorrective) {
      return res.status(400).json({
        success: false,
        message: 'Cannot close NCR without documenting Root Cause and Corrective Action.'
      });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('non_conformance_reports')
      .update({
        status: 'CLOSED',
        root_cause: finalRootCause,
        corrective_action: finalCorrective,
        preventive_action: preventive_action || ncr.preventive_action,
        closed_at: new Date().toISOString(),
        closed_by: req.user?.id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log Activity
    await supabase.from('quality_activities').insert([{
      ncr_id: id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Quality Manager',
      activity_type: 'CLOSED',
      description: `NCR ${ncr.ncr_number} closed following root cause analysis and corrective verification.`
    }]);

    return res.json({ success: true, data: updated, message: 'NCR closed successfully' });
  } catch (error) {
    console.error('closeNCR Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to close NCR', error: error.message });
  }
};

/**
 * 4. QUALITY HOLDS
 */
const getQualityHolds = async (req, res) => {
  try {
    const { search = '', status } = req.query;

    let query = supabase
      .from('quality_holds')
      .select(`
        *,
        products (id, code, name),
        goods_receipts (id, grn_number),
        production_orders (id, production_order_number),
        placed_profile:profiles!quality_holds_placed_by_fkey (id, first_name, last_name, email)
      `);

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`hold_number.ilike.%${search}%,reason.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getQualityHolds Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quality holds', error: error.message });
  }
};

const createQualityHold = async (req, res) => {
  try {
    const { product_id, quantity, reason, grn_id, production_order_id, inspection_id, notes } = req.body;

    if (!product_id || !quantity || !reason) {
      return res.status(400).json({ success: false, message: 'Product, quantity, and reason are required' });
    }

    const hold_number = await generateSequenceNumber('quality_holds', 'hold_number', 'QHOLD');

    const newHold = {
      hold_number,
      product_id,
      quantity: parseFloat(quantity),
      released_quantity: 0,
      reason,
      grn_id: grn_id || null,
      production_order_id: production_order_id || null,
      inspection_id: inspection_id || null,
      status: 'ON_HOLD',
      placed_by: req.user?.id || null,
      notes
    };

    const { data, error } = await supabase
      .from('quality_holds')
      .insert([newHold])
      .select()
      .single();

    if (error) throw error;

    // If linked to inspection, update inspection status
    if (inspection_id) {
      await supabase
        .from('quality_inspections')
        .update({ status: 'ON_HOLD', result: 'FAIL' })
        .eq('id', inspection_id);
    }

    return res.status(201).json({ success: true, data, message: 'Material placed on Quality Hold' });
  } catch (error) {
    console.error('createQualityHold Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to place quality hold', error: error.message });
  }
};

const releaseQualityHold = async (req, res) => {
  try {
    const { id } = req.params;
    const { release_quantity, notes } = req.body;

    const { data: hold, error: fetchErr } = await supabase
      .from('quality_holds')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !hold) {
      return res.status(404).json({ success: false, message: 'Quality hold record not found' });
    }

    const toRelease = parseFloat(release_quantity || hold.quantity);
    const newReleasedTotal = parseFloat(hold.released_quantity) + toRelease;

    if (newReleasedTotal > parseFloat(hold.quantity)) {
      return res.status(400).json({ success: false, message: 'Release quantity cannot exceed held quantity' });
    }

    const newStatus = newReleasedTotal === parseFloat(hold.quantity) ? 'RELEASED' : 'ON_HOLD';

    const { data: updated, error: updateErr } = await supabase
      .from('quality_holds')
      .update({
        released_quantity: newReleasedTotal,
        status: newStatus,
        released_by: req.user?.id || null,
        released_at: new Date().toISOString(),
        notes: notes || hold.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.json({ success: true, data: updated, message: `Quality hold released (${toRelease} units)` });
  } catch (error) {
    console.error('releaseQualityHold Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to release quality hold', error: error.message });
  }
};

/**
 * 5. QUALITY DASHBOARD KPIS
 */
const getQualityKPIs = async (req, res) => {
  try {
    const { data: inspections } = await supabase
      .from('quality_inspections')
      .select('status, result');

    const { data: holds } = await supabase
      .from('quality_holds')
      .select('status');

    const { data: ncrs } = await supabase
      .from('non_conformance_reports')
      .select('status, severity, due_date');

    const totalInspections = inspections?.length || 0;
    const pendingInspections = inspections?.filter(i => i.status === 'DRAFT' || i.status === 'IN_PROGRESS')?.length || 0;
    const passedInspections = inspections?.filter(i => i.result === 'PASS' || i.status === 'PASSED')?.length || 0;
    const failedInspections = inspections?.filter(i => i.result === 'FAIL' || i.status === 'FAILED')?.length || 0;

    const passRate = totalInspections > 0
      ? ((passedInspections / totalInspections) * 100).toFixed(1)
      : '100.0';

    const activeHolds = holds?.filter(h => h.status === 'ON_HOLD')?.length || 0;
    const openNCRs = ncrs?.filter(n => n.status !== 'CLOSED' && n.status !== 'CANCELLED')?.length || 0;

    const today = new Date().toISOString().split('T')[0];
    const overdueNCRs = ncrs?.filter(n => n.status !== 'CLOSED' && n.due_date && n.due_date < today)?.length || 0;

    return res.json({
      success: true,
      data: {
        totalInspections,
        pendingInspections,
        passedInspections,
        failedInspections,
        passRate: parseFloat(passRate),
        activeHolds,
        openNCRs,
        overdueNCRs
      }
    });
  } catch (error) {
    console.error('getQualityKPIs Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate quality KPIs', error: error.message });
  }
};

module.exports = {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  completeInspection,
  getInspectionPlans,
  getInspectionPlanById,
  createInspectionPlan,
  getNCRs,
  getNCRById,
  createNCR,
  updateNCR,
  closeNCR,
  getQualityHolds,
  createQualityHold,
  releaseQualityHold,
  getQualityKPIs
};
