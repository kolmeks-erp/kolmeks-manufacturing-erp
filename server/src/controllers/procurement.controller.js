const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate a unique Purchase Requisition number (e.g. PR-2026-000101)
 */
function generateRequisitionNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `PR-${year}-${randomSuffix}`;
}

/**
 * Helper to generate a unique Purchase Order number (e.g. PO-2026-000101)
 */
function generatePONumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `PO-${year}-${randomSuffix}`;
}

/**
 * Audit Log Helper for Purchase Requisitions
 */
async function logRequisitionActivity(requisition_id, actorProfile, action, details = {}) {
  try {
    await supabaseAdmin.from('purchase_requisition_activities').insert({
      requisition_id,
      user_id: actorProfile?.id || null,
      action,
      details: {
        actor_name: actorProfile?.full_name || 'Staff User',
        ...details,
      },
    });
  } catch (err) {
    console.warn('Failed to insert Purchase Requisition activity log:', err);
  }
}

/**
 * Audit Log Helper for Purchase Orders
 */
async function logPOActivity(purchase_order_id, actorProfile, action, details = {}) {
  try {
    await supabaseAdmin.from('purchase_order_activities').insert({
      purchase_order_id,
      user_id: actorProfile?.id || null,
      action,
      details: {
        actor_name: actorProfile?.full_name || 'Staff User',
        ...details,
      },
    });
  } catch (err) {
    console.warn('Failed to insert Purchase Order activity log:', err);
  }
}

/**
 * Server-side Financial Calculations Engine for Purchase Orders
 */
function calculatePOFinancials(items = []) {
  let subtotal = 0;
  let discount_amount = 0;
  let tax_amount = 0;
  let total_amount = 0;

  const processedItems = items.map((item, index) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unit_price) || 0);
    const lineSubtotal = Number((qty * unitPrice).toFixed(2));

    const discInput = Math.max(0, Number(item.discount) || 0);
    const discType = item.discount_type === 'percentage' ? 'percentage' : 'amount';

    let lineDiscount = 0;
    if (discType === 'percentage') {
      lineDiscount = Number(((lineSubtotal * discInput) / 100).toFixed(2));
    } else {
      lineDiscount = Math.min(lineSubtotal, discInput);
    }

    const taxableAmount = Math.max(0, lineSubtotal - lineDiscount);
    const taxRate = Math.max(0, Number(item.tax_rate) || 0);
    const lineTax = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const lineTotal = Number((taxableAmount + lineTax).toFixed(2));

    subtotal += lineSubtotal;
    discount_amount += lineDiscount;
    tax_amount += lineTax;
    total_amount += lineTotal;

    return {
      product_id: item.product_id || null,
      description: (item.description || '').trim(),
      quantity: qty,
      unit: (item.unit || 'pcs').trim(),
      unit_price: unitPrice,
      discount_type: discType,
      discount: discInput,
      tax_rate: taxRate,
      line_subtotal: lineSubtotal,
      line_tax: lineTax,
      line_total: lineTotal,
      line_order: index + 1,
    };
  });

  return {
    processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount_amount: Number(discount_amount.toFixed(2)),
    tax_amount: Number(tax_amount.toFixed(2)),
    total_amount: Number(total_amount.toFixed(2)),
  };
}

// ==============================================================================
// 1. PURCHASE REQUISITIONS CONTROLLERS
// ==============================================================================

/**
 * GET /api/purchase-requisitions
 * Fetch paginated list of purchase requisitions with search, filtering, and sorting
 */
async function getPurchaseRequisitions(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const department = req.query.department || 'all';
    const priority = req.query.priority || 'all';
    const requested_by = req.query.requested_by || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('purchase_requisitions').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }
    if (department && department !== 'all') {
      query = query.ilike('department', department);
    }
    if (priority && priority !== 'all') {
      query = query.ilike('priority', priority);
    }
    if (requested_by && requested_by !== 'all') {
      query = query.eq('requested_by', requested_by);
    }

    if (search) {
      query = query.or(`requisition_number.ilike.%${search}%,reason.ilike.%${search}%,department.ilike.%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching purchase requisitions:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve purchase requisitions list.',
      });
    }

    // Join requester and approver profiles
    const userIds = Array.from(
      new Set(
        (data || [])
          .flatMap((pr) => [pr.requested_by, pr.approved_by, pr.rejected_by, pr.created_by])
          .filter(Boolean)
      )
    );

    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name, email, department').in('id', userIds);
      profs?.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }

    // Fetch line item counts
    const prIds = (data || []).map((pr) => pr.id);
    let itemCountsMap = {};
    if (prIds.length > 0) {
      const { data: items } = await supabaseAdmin.from('purchase_requisition_items').select('requisition_id');
      items?.forEach((it) => {
        itemCountsMap[it.requisition_id] = (itemCountsMap[it.requisition_id] || 0) + 1;
      });
    }

    const formattedData = data?.map((pr) => ({
      ...pr,
      requester_user: pr.requested_by ? profilesMap[pr.requested_by] || null : null,
      approver_user: pr.approved_by ? profilesMap[pr.approved_by] || null : null,
      item_count: itemCountsMap[pr.id] || 0,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: formattedData || [],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Procurement controller getPurchaseRequisitions exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load purchase requisitions.',
    });
  }
}

/**
 * GET /api/purchase-requisitions/:id
 * Fetch single purchase requisition details with items and activities
 */
async function getPurchaseRequisitionById(req, res) {
  try {
    const { id } = req.params;

    const { data: pr, error: prError } = await supabaseAdmin
      .from('purchase_requisitions')
      .select('*')
      .eq('id', id)
      .single();

    if (prError || !pr) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Purchase Requisition record not found.',
      });
    }

    // Fetch line items
    const { data: lineItems } = await supabaseAdmin
      .from('purchase_requisition_items')
      .select('*')
      .eq('requisition_id', id)
      .order('line_order', { ascending: true });

    // Product master details
    const productIds = Array.from(new Set(lineItems?.map((li) => li.product_id).filter(Boolean)));
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabaseAdmin
        .from('products')
        .select('id, name, product_code, drawing_number')
        .in('id', productIds);
      prods?.forEach((p) => {
        productsMap[p.id] = p;
      });
    }

    const formattedItems = lineItems?.map((li) => ({
      ...li,
      product_master: li.product_id ? productsMap[li.product_id] || null : null,
    }));

    // Profiles map
    const userIds = Array.from(new Set([pr.requested_by, pr.approved_by, pr.rejected_by, pr.created_by].filter(Boolean)));
    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name, email, department').in('id', userIds);
      profs?.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }

    // Activities
    const { data: activities } = await supabaseAdmin
      .from('purchase_requisition_activities')
      .select('*')
      .eq('requisition_id', id)
      .order('created_at', { ascending: false });

    // Check if PO exists
    const { data: linkedPO } = await supabaseAdmin
      .from('purchase_orders')
      .select('id, po_number, status')
      .eq('requisition_id', id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      data: {
        ...pr,
        requester_user: pr.requested_by ? profilesMap[pr.requested_by] || null : null,
        approver_user: pr.approved_by ? profilesMap[pr.approved_by] || null : null,
        rejecter_user: pr.rejected_by ? profilesMap[pr.rejected_by] || null : null,
        items: formattedItems || [],
        activities: activities || [],
        linked_po: linkedPO || null,
      },
    });
  } catch (err) {
    console.error('Procurement controller getPurchaseRequisitionById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load purchase requisition details.',
    });
  }
}

/**
 * POST /api/purchase-requisitions
 * Create a new purchase requisition
 */
async function createPurchaseRequisition(req, res) {
  try {
    const {
      department,
      request_date,
      required_date,
      priority,
      reason,
      notes,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'At least one line item is required.',
      });
    }

    if (items.some((it) => !it.description || !it.quantity || Number(it.quantity) <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'All requisition items must have a valid description and positive quantity.',
      });
    }

    const reqNumber = generateRequisitionNumber();
    const currentUserId = req.profile?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User authentication profile required to create purchase requisition.',
      });
    }

    const newRequisition = {
      requisition_number: reqNumber,
      requested_by: currentUserId,
      department: (department || req.profile?.department || 'Manufacturing').trim(),
      request_date: request_date || new Date().toISOString().split('T')[0],
      required_date: required_date || null,
      priority: (priority || 'NORMAL').trim().toUpperCase(),
      reason: (reason || 'Production requirement').trim(),
      status: 'DRAFT',
      notes: (notes || '').trim(),
      created_by: currentUserId,
    };

    const { data: insertedPR, error: prErr } = await supabaseAdmin
      .from('purchase_requisitions')
      .insert(newRequisition)
      .select()
      .single();

    if (prErr || !insertedPR) {
      console.error('Error inserting purchase requisition:', prErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to create purchase requisition record.',
      });
    }

    // Insert items
    const lineItemsToInsert = items.map((it, idx) => ({
      requisition_id: insertedPR.id,
      product_id: it.product_id || null,
      description: (it.description || '').trim(),
      quantity: Math.max(0, Number(it.quantity) || 1),
      unit: (it.unit || 'pcs').trim(),
      required_date: it.required_date || required_date || null,
      estimated_unit_cost: Math.max(0, Number(it.estimated_unit_cost) || 0),
      notes: (it.notes || '').trim(),
      line_order: idx + 1,
    }));

    await supabaseAdmin.from('purchase_requisition_items').insert(lineItemsToInsert);

    await logRequisitionActivity(
      insertedPR.id,
      req.profile,
      'CREATED',
      { message: `Created Purchase Requisition ${reqNumber} as DRAFT.` }
    );

    return res.status(201).json({
      success: true,
      data: insertedPR,
      message: `Purchase Requisition ${reqNumber} created successfully.`,
    });
  } catch (err) {
    console.error('Procurement controller createPurchaseRequisition exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create purchase requisition.',
    });
  }
}

/**
 * PATCH /api/purchase-requisitions/:id
 * Update draft purchase requisition
 */
async function updatePurchaseRequisition(req, res) {
  try {
    const { id } = req.params;
    const {
      department,
      request_date,
      required_date,
      priority,
      reason,
      notes,
      items,
    } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('purchase_requisitions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Requisition record not found.' });
    }

    if (['APPROVED', 'CONVERTED', 'CANCELLED'].includes(existing.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Requisition is in status '${existing.status}' and cannot be modified.`,
      });
    }

    if (items && (!Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Requisition must contain at least one line item.' });
    }

    const updatePayload = {
      department: department !== undefined ? department.trim() : existing.department,
      request_date: request_date || existing.request_date,
      required_date: required_date !== undefined ? required_date : existing.required_date,
      priority: priority ? priority.trim().toUpperCase() : existing.priority,
      reason: reason !== undefined ? reason.trim() : existing.reason,
      notes: notes !== undefined ? notes.trim() : existing.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPR, error: updateErr } = await supabaseAdmin
      .from('purchase_requisitions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update purchase requisition.' });
    }

    if (items && Array.isArray(items)) {
      await supabaseAdmin.from('purchase_requisition_items').delete().eq('requisition_id', id);

      const lineItemsToInsert = items.map((it, idx) => ({
        requisition_id: id,
        product_id: it.product_id || null,
        description: (it.description || '').trim(),
        quantity: Math.max(0, Number(it.quantity) || 1),
        unit: (it.unit || 'pcs').trim(),
        required_date: it.required_date || required_date || null,
        estimated_unit_cost: Math.max(0, Number(it.estimated_unit_cost) || 0),
        notes: (it.notes || '').trim(),
        line_order: idx + 1,
      }));

      await supabaseAdmin.from('purchase_requisition_items').insert(lineItemsToInsert);
    }

    await logRequisitionActivity(id, req.profile, 'UPDATED', { message: 'Updated requisition specifications and line items.' });

    return res.status(200).json({
      success: true,
      data: updatedPR,
      message: 'Purchase Requisition updated successfully.',
    });
  } catch (err) {
    console.error('Procurement controller updatePurchaseRequisition exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update purchase requisition.' });
  }
}

/**
 * PATCH /api/purchase-requisitions/:id/status
 * Update status (SUBMITTED, UNDER_REVIEW, CANCELLED)
 */
async function updateRequisitionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Status parameter is required.' });
    }

    const normalizedStatus = status.trim().toUpperCase();
    const validStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED'];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: `Invalid status '${status}'.` });
    }

    const { data: pr } = await supabaseAdmin.from('purchase_requisitions').select('*').eq('id', id).single();
    if (!pr) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Requisition record not found.' });
    }

    const updatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPR } = await supabaseAdmin
      .from('purchase_requisitions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    await logRequisitionActivity(id, req.profile, 'STATUS_CHANGED', { old_status: pr.status, new_status: normalizedStatus });

    return res.status(200).json({
      success: true,
      data: updatedPR,
      message: `Requisition status updated to ${normalizedStatus}.`,
    });
  } catch (err) {
    console.error('Procurement controller updateRequisitionStatus exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update requisition status.' });
  }
}

/**
 * POST /api/purchase-requisitions/:id/approve
 * Approve requisition
 */
async function approveRequisition(req, res) {
  try {
    const { id } = req.params;

    const { data: pr } = await supabaseAdmin.from('purchase_requisitions').select('*').eq('id', id).single();
    if (!pr) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Requisition record not found.' });
    }

    if (['APPROVED', 'CONVERTED'].includes(pr.status.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: `Requisition is already ${pr.status}.` });
    }

    const updatePayload = {
      status: 'APPROVED',
      approved_by: req.profile?.id || null,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPR } = await supabaseAdmin
      .from('purchase_requisitions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    await logRequisitionActivity(id, req.profile, 'APPROVED', { approver_name: req.profile?.full_name });

    return res.status(200).json({
      success: true,
      data: updatedPR,
      message: `Purchase Requisition ${pr.requisition_number} approved successfully. Ready for Purchase Order creation.`,
    });
  } catch (err) {
    console.error('Procurement controller approveRequisition exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to approve requisition.' });
  }
}

/**
 * POST /api/purchase-requisitions/:id/reject
 * Reject requisition
 */
async function rejectRequisition(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: pr } = await supabaseAdmin.from('purchase_requisitions').select('*').eq('id', id).single();
    if (!pr) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Requisition record not found.' });
    }

    const updatePayload = {
      status: 'REJECTED',
      rejected_by: req.profile?.id || null,
      rejected_at: new Date().toISOString(),
      notes: reason ? `[Rejection Reason]: ${reason}\n${pr.notes || ''}` : pr.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPR } = await supabaseAdmin
      .from('purchase_requisitions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    await logRequisitionActivity(id, req.profile, 'REJECTED', { rejection_reason: reason || 'Not specified' });

    return res.status(200).json({
      success: true,
      data: updatedPR,
      message: `Purchase Requisition ${pr.requisition_number} rejected.`,
    });
  } catch (err) {
    console.error('Procurement controller rejectRequisition exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to reject requisition.' });
  }
}

/**
 * POST /api/purchase-requisitions/:id/create-purchase-order
 * Convert approved Purchase Requisition to Purchase Order
 */
async function convertRequisitionToPO(req, res) {
  try {
    const { id } = req.params;
    const { supplier_id, currency, payment_terms, delivery_terms, notes } = req.body;

    // Fetch Requisition
    const { data: pr } = await supabaseAdmin.from('purchase_requisitions').select('*').eq('id', id).single();
    if (!pr) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Requisition record not found.' });
    }

    if (pr.status.toUpperCase() === 'CONVERTED') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'This Purchase Requisition has already been converted into a Purchase Order.',
      });
    }

    // Check if PO already exists
    const { data: existingPO } = await supabaseAdmin
      .from('purchase_orders')
      .select('id, po_number')
      .eq('requisition_id', id)
      .neq('status', 'CANCELLED')
      .maybeSingle();

    if (existingPO) {
      return res.status(409).json({
        success: false,
        error: 'DuplicateError',
        message: `Purchase Order ${existingPO.po_number} has already been created for this requisition.`,
        existingPOId: existingPO.id,
      });
    }

    // Fetch PR Items
    const { data: prItems } = await supabaseAdmin
      .from('purchase_requisition_items')
      .select('*')
      .eq('requisition_id', id)
      .order('line_order', { ascending: true });

    if (!prItems || prItems.length === 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Requisition has no items to convert.' });
    }

    // Select Supplier (Use provided supplier_id or default to first active supplier)
    let selectedSupplierId = supplier_id;
    if (!selectedSupplierId) {
      const { data: defaultSupp } = await supabaseAdmin.from('suppliers').select('id').eq('status', 'active').limit(1).maybeSingle();
      selectedSupplierId = defaultSupp?.id;
    }

    if (!selectedSupplierId) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'A active Supplier must be selected to create a Purchase Order.',
      });
    }

    const poNumber = generatePONumber();

    // Map items & calculate financials
    const poItemsRaw = prItems.map((pri) => ({
      product_id: pri.product_id,
      description: pri.description,
      quantity: pri.quantity,
      unit: pri.unit,
      unit_price: pri.estimated_unit_cost || 0,
      discount_type: 'amount',
      discount: 0,
      tax_rate: 0,
    }));

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculatePOFinancials(poItemsRaw);

    const newPO = {
      po_number: poNumber,
      supplier_id: selectedSupplierId,
      requisition_id: id,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: pr.required_date || null,
      priority: pr.priority || 'NORMAL',
      currency: (currency || 'INR').trim().toUpperCase(),
      subtotal,
      discount_amount,
      tax_amount,
      total: total_amount,
      payment_terms: payment_terms || 'Net 30 Days',
      delivery_terms: delivery_terms || 'FOB Factory',
      notes: notes || `Converted from Purchase Requisition ${pr.requisition_number}. ${pr.notes || ''}`,
      status: 'DRAFT',
      created_by: req.profile?.id || null,
    };

    const { data: insertedPO, error: insertErr } = await supabaseAdmin
      .from('purchase_orders')
      .insert(newPO)
      .select()
      .single();

    if (insertErr || !insertedPO) {
      console.error('Error creating PO from PR:', insertErr);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to create Purchase Order.' });
    }

    // Insert PO Line items
    const poLineItems = processedItems.map((item) => ({
      purchase_order_id: insertedPO.id,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount: item.discount,
      tax_rate: item.tax_rate,
      line_subtotal: item.line_subtotal,
      line_tax: item.line_tax,
      line_total: item.line_total,
      line_order: item.line_order,
    }));

    await supabaseAdmin.from('purchase_order_items').insert(poLineItems);

    // Update PR status to CONVERTED
    await supabaseAdmin.from('purchase_requisitions').update({ status: 'CONVERTED', updated_at: new Date().toISOString() }).eq('id', id);

    await logRequisitionActivity(id, req.profile, 'CONVERTED_TO_PO', { po_number: poNumber });
    await logPOActivity(insertedPO.id, req.profile, 'CREATED_FROM_REQUISITION', { requisition_number: pr.requisition_number });

    return res.status(201).json({
      success: true,
      data: insertedPO,
      message: `Purchase Order ${poNumber} created successfully from Purchase Requisition ${pr.requisition_number}.`,
    });
  } catch (err) {
    console.error('Procurement controller convertRequisitionToPO exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to convert requisition to purchase order.' });
  }
}

// ==============================================================================
// 2. PURCHASE ORDERS CONTROLLERS
// ==============================================================================

/**
 * GET /api/purchase-orders
 * Fetch paginated list of purchase orders with search, filters, and sorting
 */
async function getPurchaseOrders(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const supplier_id = req.query.supplier_id || 'all';
    const requisition_id = req.query.requisition_id || 'all';
    const currency = req.query.currency || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('purchase_orders').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }
    if (supplier_id && supplier_id !== 'all') {
      query = query.eq('supplier_id', supplier_id);
    }
    if (requisition_id && requisition_id !== 'all') {
      query = query.eq('requisition_id', requisition_id);
    }
    if (currency && currency !== 'all') {
      query = query.eq('currency', currency);
    }

    if (search) {
      query = query.or(`po_number.ilike.%${search}%,supplier_reference.ilike.%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching purchase orders:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve purchase orders list.',
      });
    }

    // Join suppliers, requisitions, creators
    const supplierIds = Array.from(new Set(data?.map((po) => po.supplier_id).filter(Boolean)));
    const requisitionIds = Array.from(new Set(data?.map((po) => po.requisition_id).filter(Boolean)));
    const creatorIds = Array.from(new Set(data?.map((po) => po.created_by).filter(Boolean)));

    let suppliersMap = {};
    let requisitionsMap = {};
    let creatorsMap = {};

    if (supplierIds.length > 0) {
      const { data: supps } = await supabaseAdmin.from('suppliers').select('id, company_name, supplier_code').in('id', supplierIds);
      supps?.forEach((s) => {
        suppliersMap[s.id] = s;
      });
    }

    if (requisitionIds.length > 0) {
      const { data: prs } = await supabaseAdmin.from('purchase_requisitions').select('id, requisition_number').in('id', requisitionIds);
      prs?.forEach((pr) => {
        requisitionsMap[pr.id] = pr;
      });
    }

    if (creatorIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name').in('id', creatorIds);
      profs?.forEach((p) => {
        creatorsMap[p.id] = p;
      });
    }

    const formattedData = data?.map((po) => ({
      ...po,
      supplier_master: po.supplier_id ? suppliersMap[po.supplier_id] || null : null,
      requisition_master: po.requisition_id ? requisitionsMap[po.requisition_id] || null : null,
      creator_user: po.created_by ? creatorsMap[po.created_by] || null : null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: formattedData || [],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Procurement controller getPurchaseOrders exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load purchase orders.',
    });
  }
}

/**
 * GET /api/purchase-orders/:id
 * Fetch single purchase order with supplier master, items, requisition info, and activities
 */
async function getPurchaseOrderById(req, res) {
  try {
    const { id } = req.params;

    const { data: po, error: poError } = await supabaseAdmin
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (poError || !po) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Purchase Order record not found.',
      });
    }

    // Supplier Master
    const { data: supplier } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('id', po.supplier_id)
      .single();

    // Requisition Master
    let requisitionMaster = null;
    if (po.requisition_id) {
      const { data: pr } = await supabaseAdmin
        .from('purchase_requisitions')
        .select('id, requisition_number, department, requested_by, reason')
        .eq('id', po.requisition_id)
        .single();
      requisitionMaster = pr || null;
    }

    // Line Items
    const { data: lineItems } = await supabaseAdmin
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', id)
      .order('line_order', { ascending: true });

    // Products Map
    const productIds = Array.from(new Set(lineItems?.map((li) => li.product_id).filter(Boolean)));
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabaseAdmin
        .from('products')
        .select('id, name, product_code, drawing_number')
        .in('id', productIds);
      prods?.forEach((p) => {
        productsMap[p.id] = p;
      });
    }

    const formattedLineItems = lineItems?.map((li) => ({
      ...li,
      product_master: li.product_id ? productsMap[li.product_id] || null : null,
    }));

    // Profiles
    const userIds = Array.from(new Set([po.created_by, po.approved_by].filter(Boolean)));
    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds);
      profs?.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }

    // Activities
    const { data: activities } = await supabaseAdmin
      .from('purchase_order_activities')
      .select('*')
      .eq('purchase_order_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      data: {
        ...po,
        supplier_master: supplier || null,
        requisition_master: requisitionMaster,
        creator_user: po.created_by ? profilesMap[po.created_by] || null : null,
        approver_user: po.approved_by ? profilesMap[po.approved_by] || null : null,
        items: formattedLineItems || [],
        activities: activities || [],
      },
    });
  } catch (err) {
    console.error('Procurement controller getPurchaseOrderById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load purchase order details.',
    });
  }
}

/**
 * POST /api/purchase-orders
 * Create a new manual Purchase Order
 */
async function createPurchaseOrder(req, res) {
  try {
    const {
      supplier_id,
      requisition_id,
      order_date,
      expected_delivery,
      priority,
      currency,
      payment_terms,
      delivery_terms,
      supplier_reference,
      notes,
      items,
    } = req.body;

    if (!supplier_id) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Supplier selection is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'At least one line item is required.' });
    }

    // Check supplier
    const { data: supp, error: suppErr } = await supabaseAdmin.from('suppliers').select('id, company_name').eq('id', supplier_id).single();
    if (suppErr || !supp) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Selected Supplier record does not exist.' });
    }

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculatePOFinancials(items);

    if (processedItems.some((it) => !it.description)) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'All order line items must have a description.' });
    }

    const poNumber = generatePONumber();

    const newPO = {
      po_number: poNumber,
      supplier_id,
      requisition_id: requisition_id || null,
      order_date: order_date || new Date().toISOString().split('T')[0],
      expected_delivery: expected_delivery || null,
      priority: (priority || 'NORMAL').trim().toUpperCase(),
      currency: (currency || 'INR').trim().toUpperCase(),
      subtotal,
      discount_amount,
      tax_amount,
      total: total_amount,
      payment_terms: (payment_terms || 'Net 30 Days').trim(),
      delivery_terms: (delivery_terms || 'FOB Factory').trim(),
      supplier_reference: (supplier_reference || '').trim(),
      notes: (notes || '').trim(),
      status: 'DRAFT',
      created_by: req.profile?.id || null,
    };

    const { data: insertedPO, error: insertErr } = await supabaseAdmin
      .from('purchase_orders')
      .insert(newPO)
      .select()
      .single();

    if (insertErr || !insertedPO) {
      console.error('Error inserting purchase order:', insertErr);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to create Purchase Order record.' });
    }

    const lineItemsToInsert = processedItems.map((item) => ({
      purchase_order_id: insertedPO.id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount: item.discount,
      tax_rate: item.tax_rate,
      line_subtotal: item.line_subtotal,
      line_tax: item.line_tax,
      line_total: item.line_total,
      line_order: item.line_order,
    }));

    await supabaseAdmin.from('purchase_order_items').insert(lineItemsToInsert);

    await logPOActivity(
      insertedPO.id,
      req.profile,
      'CREATED',
      { message: `Created Purchase Order ${poNumber} for ${supp.company_name} (Total: ₹{newPO.currency} ${total_amount.toLocaleString()})` }
    );

    return res.status(201).json({
      success: true,
      data: insertedPO,
      message: `Purchase Order ${poNumber} created successfully as DRAFT.`,
    });
  } catch (err) {
    console.error('Procurement controller createPurchaseOrder exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to create Purchase Order.' });
  }
}

/**
 * PATCH /api/purchase-orders/:id
 * Update draft purchase order details and recalculate totals
 */
async function updatePurchaseOrder(req, res) {
  try {
    const { id } = req.params;
    const {
      supplier_id,
      requisition_id,
      order_date,
      expected_delivery,
      priority,
      currency,
      payment_terms,
      delivery_terms,
      supplier_reference,
      notes,
      items,
    } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin.from('purchase_orders').select('*').eq('id', id).single();
    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Order record not found.' });
    }

    if (['RECEIVED', 'CANCELLED'].includes(existing.status.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: `Purchase Order is '${existing.status}' and cannot be edited.` });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'At least one line item is required.' });
    }

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculatePOFinancials(items);

    const updatePayload = {
      supplier_id: supplier_id || existing.supplier_id,
      requisition_id: requisition_id !== undefined ? requisition_id : existing.requisition_id,
      order_date: order_date || existing.order_date,
      expected_delivery: expected_delivery !== undefined ? expected_delivery : existing.expected_delivery,
      priority: priority ? priority.trim().toUpperCase() : existing.priority,
      currency: currency ? currency.trim().toUpperCase() : existing.currency,
      subtotal,
      discount_amount,
      tax_amount,
      total: total_amount,
      payment_terms: payment_terms !== undefined ? payment_terms.trim() : existing.payment_terms,
      delivery_terms: delivery_terms !== undefined ? delivery_terms.trim() : existing.delivery_terms,
      supplier_reference: supplier_reference !== undefined ? supplier_reference.trim() : existing.supplier_reference,
      notes: notes !== undefined ? notes.trim() : existing.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPO, error: updateErr } = await supabaseAdmin
      .from('purchase_orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update Purchase Order.' });
    }

    await supabaseAdmin.from('purchase_order_items').delete().eq('purchase_order_id', id);

    const lineItemsToInsert = processedItems.map((item) => ({
      purchase_order_id: id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount: item.discount,
      tax_rate: item.tax_rate,
      line_subtotal: item.line_subtotal,
      line_tax: item.line_tax,
      line_total: item.line_total,
      line_order: item.line_order,
    }));

    await supabaseAdmin.from('purchase_order_items').insert(lineItemsToInsert);

    await logPOActivity(id, req.profile, 'UPDATED', { message: `Updated PO line items and recalculated total: ${updatedPO.currency} ${total_amount.toLocaleString()}` });

    return res.status(200).json({
      success: true,
      data: updatedPO,
      message: 'Purchase Order updated successfully.',
    });
  } catch (err) {
    console.error('Procurement controller updatePurchaseOrder exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update Purchase Order.' });
  }
}

/**
 * PATCH /api/purchase-orders/:id/status
 * Update PO workflow status
 */
async function updatePurchaseOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Status parameter is required.' });
    }

    const normalizedStatus = status.trim().toUpperCase();

    const allowedStatuses = [
      'DRAFT',
      'PENDING_APPROVAL',
      'APPROVED',
      'SENT',
      'ACKNOWLEDGED',
      'PARTIALLY_RECEIVED',
      'RECEIVED',
      'ON_HOLD',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: `Invalid status '${status}'.` });
    }

    const { data: existingPO } = await supabaseAdmin.from('purchase_orders').select('*').eq('id', id).single();
    if (!existingPO) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Purchase Order record not found.' });
    }

    const updatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (normalizedStatus === 'APPROVED' && !existingPO.approved_at) {
      updatePayload.approved_by = req.profile?.id || null;
      updatePayload.approved_at = new Date().toISOString();
    }

    const { data: updatedPO } = await supabaseAdmin
      .from('purchase_orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    await logPOActivity(id, req.profile, 'STATUS_CHANGED', { old_status: existingPO.status, new_status: normalizedStatus });

    return res.status(200).json({
      success: true,
      data: updatedPO,
      message: `Purchase Order status updated to ${normalizedStatus}.`,
    });
  } catch (err) {
    console.error('Procurement controller updatePurchaseOrderStatus exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update Purchase Order status.' });
  }
}

/**
 * GET /api/purchase-requisitions/:id/activity
 */
async function getRequisitionActivities(req, res) {
  try {
    const { id } = req.params;
    const { data } = await supabaseAdmin
      .from('purchase_requisition_activities')
      .select('*')
      .eq('requisition_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load requisition activities.' });
  }
}

/**
 * GET /api/purchase-orders/:id/activity
 */
async function getPOActivities(req, res) {
  try {
    const { id } = req.params;
    const { data } = await supabaseAdmin
      .from('purchase_order_activities')
      .select('*')
      .eq('purchase_order_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load PO activities.' });
  }
}

module.exports = {
  getPurchaseRequisitions,
  getPurchaseRequisitionById,
  createPurchaseRequisition,
  updatePurchaseRequisition,
  updateRequisitionStatus,
  approveRequisition,
  rejectRequisition,
  convertRequisitionToPO,
  getRequisitionActivities,

  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  getPOActivities,
};
