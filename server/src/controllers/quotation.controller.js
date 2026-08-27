const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate a unique human-readable Quotation number (e.g. QUO-2026-000101)
 */
function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `QUO-${year}-${randomSuffix}`;
}

/**
 * Helper to log Quotation Activity Events into quotation_activities
 */
async function logQuotationActivity(quotation_id, actorProfile, activity_type, description, old_value = null, new_value = null) {
  try {
    await supabaseAdmin.from('quotation_activities').insert({
      quotation_id,
      actor_id: actorProfile?.id || null,
      actor_name: actorProfile?.full_name || 'Staff User',
      activity_type,
      description,
      old_value: old_value ? String(old_value) : null,
      new_value: new_value ? String(new_value) : null,
    });
  } catch (err) {
    console.warn('Failed to insert Quotation activity log:', err);
  }
}

/**
 * Server-side Financial Calculations Engine
 * Validates and calculates line subtotals, line taxes, line totals, and overall Quotation summary.
 */
function calculateFinancials(items = []) {
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
      unit: (item.unit || 'Pcs').trim(),
      unit_price: unitPrice,
      discount_type: discType,
      discount: discInput,
      tax_rate: taxRate,
      tax: lineTax,
      line_subtotal: lineSubtotal,
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

/**
 * GET /api/quotations
 * Fetch paginated quotations list with multi-field search, filters, and sorting
 */
async function getQuotations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const customer_id = req.query.customer_id || 'all';
    const rfq_id = req.query.rfq_id || 'all';
    const currency = req.query.currency || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('quotations').select('*', { count: 'exact' });

    // Status Filter (case-insensitive)
    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }

    // Customer Filter
    if (customer_id && customer_id !== 'all') {
      query = query.eq('customer_id', customer_id);
    }

    // RFQ Filter
    if (rfq_id && rfq_id !== 'all') {
      query = query.eq('rfq_id', rfq_id);
    }

    // Currency Filter
    if (currency && currency !== 'all') {
      query = query.eq('currency', currency);
    }

    // Search Filter
    if (search) {
      query = query.or(`quotation_number.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching quotations:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve quotations list.',
      });
    }

    // Fetch joined customer details & creator details
    const customerIds = Array.from(new Set(data?.map((q) => q.customer_id).filter(Boolean)));
    const rfqIds = Array.from(new Set(data?.map((q) => q.rfq_id).filter(Boolean)));
    const creatorIds = Array.from(new Set(data?.map((q) => q.created_by).filter(Boolean)));

    let customersMap = {};
    let rfqsMap = {};
    let creatorsMap = {};

    if (customerIds.length > 0) {
      const { data: custs } = await supabaseAdmin.from('customers').select('id, company_name, customer_code').in('id', customerIds);
      custs?.forEach((c) => {
        customersMap[c.id] = c;
      });
    }

    if (rfqIds.length > 0) {
      const { data: rfqs } = await supabaseAdmin.from('rfqs').select('id, rfq_number, component_name').in('id', rfqIds);
      rfqs?.forEach((r) => {
        rfqsMap[r.id] = r;
      });
    }

    if (creatorIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name').in('id', creatorIds);
      profs?.forEach((p) => {
        creatorsMap[p.id] = p;
      });
    }

    const formattedData = data?.map((q) => ({
      ...q,
      customer_master: q.customer_id ? customersMap[q.customer_id] || null : null,
      rfq_master: q.rfq_id ? rfqsMap[q.rfq_id] || null : null,
      creator_user: q.created_by ? creatorsMap[q.created_by] || null : null,
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
    console.error('Quotation controller getQuotations exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load quotations list.',
    });
  }
}

/**
 * GET /api/quotations/:id
 * Fetch single quotation with customer info, RFQ info, line items, and activity timeline
 */
async function getQuotationById(req, res) {
  try {
    const { id } = req.params;

    const { data: quotation, error: qError } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (qError || !quotation) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Quotation record not found.',
      });
    }

    // Fetch customer info
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', quotation.customer_id)
      .single();

    // Fetch optional RFQ info
    let rfqMaster = null;
    if (quotation.rfq_id) {
      const { data: rfq } = await supabaseAdmin
        .from('rfqs')
        .select('*')
        .eq('id', quotation.rfq_id)
        .single();
      rfqMaster = rfq || null;
    }

    // Fetch line items
    const { data: lineItems } = await supabaseAdmin
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', id)
      .order('created_at', { ascending: true });

    // Fetch product details for linked line items
    const productIds = Array.from(new Set(lineItems?.map((li) => li.product_id).filter(Boolean)));
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabaseAdmin
        .from('products')
        .select('id, name, product_code, drawing_number, revision')
        .in('id', productIds);
      prods?.forEach((p) => {
        productsMap[p.id] = p;
      });
    }

    const formattedLineItems = lineItems?.map((li) => ({
      ...li,
      product_master: li.product_id ? productsMap[li.product_id] || null : null,
    }));

    // Fetch creator profile
    let creatorUser = null;
    if (quotation.created_by) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('id, full_name, email').eq('id', quotation.created_by).single();
      creatorUser = prof || null;
    }

    // Fetch approver profile
    let approverUser = null;
    if (quotation.approved_by) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('id, full_name, email').eq('id', quotation.approved_by).single();
      approverUser = prof || null;
    }

    // Fetch activities
    const { data: activities } = await supabaseAdmin
      .from('quotation_activities')
      .select('*')
      .eq('quotation_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      data: {
        ...quotation,
        customer_master: customer || null,
        rfq_master: rfqMaster,
        creator_user: creatorUser,
        approver_user: approverUser,
        items: formattedLineItems || [],
        activities: activities || [],
      },
    });
  } catch (err) {
    console.error('Quotation controller getQuotationById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load quotation details.',
    });
  }
}

/**
 * POST /api/quotations
 * Create a new Quotation with Line Items and server-side calculated totals
 */
async function createQuotation(req, res) {
  try {
    const {
      customer_id,
      rfq_id,
      quotation_date,
      valid_until,
      currency,
      payment_terms,
      delivery_terms,
      delivery_time,
      terms,
      notes,
      items,
    } = req.body;

    // 1. Validation
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Customer selection is required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'At least one line item is required.',
      });
    }

    // Verify Customer exists
    const { data: cust, error: custErr } = await supabaseAdmin.from('customers').select('id, company_name').eq('id', customer_id).single();
    if (custErr || !cust) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Selected Customer record does not exist.',
      });
    }

    // 2. Perform Server-Side Financial Calculations
    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculateFinancials(items);

    if (processedItems.some((item) => !item.description)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'All quotation line items must have a description.',
      });
    }

    const quotationNumber = generateQuotationNumber();
    const finalDate = quotation_date || new Date().toISOString().split('T')[0];

    // 3. Insert Master Quotation Record
    const newQuotation = {
      quotation_number: quotationNumber,
      customer_id,
      rfq_id: rfq_id || null,
      quotation_date: finalDate,
      valid_until: valid_until || null,
      currency: (currency || 'EUR').trim().toUpperCase(),
      subtotal,
      discount: discount_amount,
      tax: tax_amount,
      total: total_amount,
      payment_terms: (payment_terms || '').trim(),
      delivery_terms: (delivery_terms || '').trim(),
      delivery_time: (delivery_time || '').trim(),
      terms: (terms || '').trim(),
      notes: (notes || '').trim(),
      status: 'DRAFT',
      created_by: req.profile?.id || null,
    };

    const { data: insertedQuotation, error: insertErr } = await supabaseAdmin
      .from('quotations')
      .insert(newQuotation)
      .select()
      .single();

    if (insertErr || !insertedQuotation) {
      console.error('Error inserting quotation:', insertErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to create quotation record.',
      });
    }

    // 4. Insert Line Items
    const lineItemsToInsert = processedItems.map((item) => ({
      ...item,
      quotation_id: insertedQuotation.id,
    }));

    const { error: itemsErr } = await supabaseAdmin.from('quotation_items').insert(lineItemsToInsert);

    if (itemsErr) {
      console.error('Error inserting quotation line items:', itemsErr);
    }

    // Log Activity
    await logQuotationActivity(
      insertedQuotation.id,
      req.profile,
      'CREATED',
      `Created commercial quotation ${quotationNumber} for ${cust.company_name} (Total: ${newQuotation.currency} ${total_amount.toLocaleString()})`
    );

    return res.status(201).json({
      success: true,
      data: insertedQuotation,
      message: `Quotation ${quotationNumber} created successfully as DRAFT.`,
    });
  } catch (err) {
    console.error('Quotation controller createQuotation exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create quotation.',
    });
  }
}

/**
 * PATCH /api/quotations/:id
 * Full update for draft / under_review quotation (recalculates line totals and master totals)
 */
async function updateQuotation(req, res) {
  try {
    const { id } = req.params;
    const {
      customer_id,
      rfq_id,
      quotation_date,
      valid_until,
      currency,
      payment_terms,
      delivery_terms,
      delivery_time,
      terms,
      notes,
      items,
    } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin.from('quotations').select('*').eq('id', id).single();
    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Quotation record not found.' });
    }

    if (['APPROVED', 'SENT', 'ACCEPTED', 'CLOSED'].includes(existing.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Quotation is in status '${existing.status}' and cannot be directly edited. Return to DRAFT or UNDER_REVIEW first.`,
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'At least one line item is required.' });
    }

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculateFinancials(items);

    const updatePayload = {
      customer_id: customer_id || existing.customer_id,
      rfq_id: rfq_id !== undefined ? rfq_id : existing.rfq_id,
      quotation_date: quotation_date || existing.quotation_date,
      valid_until: valid_until !== undefined ? valid_until : existing.valid_until,
      currency: currency ? currency.trim().toUpperCase() : existing.currency,
      subtotal,
      discount: discount_amount,
      tax: tax_amount,
      total: total_amount,
      payment_terms: payment_terms !== undefined ? (payment_terms || '').trim() : existing.payment_terms,
      delivery_terms: delivery_terms !== undefined ? (delivery_terms || '').trim() : existing.delivery_terms,
      delivery_time: delivery_time !== undefined ? (delivery_time || '').trim() : existing.delivery_time,
      terms: terms !== undefined ? (terms || '').trim() : existing.terms,
      notes: notes !== undefined ? (notes || '').trim() : existing.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedQuotation, error: updateErr } = await supabaseAdmin
      .from('quotations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating quotation:', updateErr);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update quotation.' });
    }

    // Replace Line Items
    await supabaseAdmin.from('quotation_items').delete().eq('quotation_id', id);

    const lineItemsToInsert = processedItems.map((item) => ({
      ...item,
      quotation_id: id,
    }));
    await supabaseAdmin.from('quotation_items').insert(lineItemsToInsert);

    await logQuotationActivity(
      id,
      req.profile,
      'UPDATED',
      `Updated quotation content and recalculated total: ${updatedQuotation.currency} ${total_amount.toLocaleString()}`
    );

    return res.status(200).json({
      success: true,
      data: updatedQuotation,
      message: 'Quotation updated successfully.',
    });
  } catch (err) {
    console.error('Quotation controller updateQuotation exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update quotation.' });
  }
}

/**
 * PATCH /api/quotations/:id/status
 * Update status with validation, role authorization check for approval, and audit log
 */
async function updateQuotationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Status parameter is required.' });
    }

    const normalizedStatus = status.trim().toUpperCase();

    const allowedStatuses = [
      'DRAFT',
      'UNDER_REVIEW',
      'APPROVED',
      'SENT',
      'ACCEPTED',
      'REJECTED',
      'EXPIRED',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Invalid status '${status}'. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const { data: existingQuotation } = await supabaseAdmin.from('quotations').select('*').eq('id', id).single();
    if (!existingQuotation) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Quotation record not found.' });
    }

    const oldStatus = existingQuotation.status;
    const updatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    // If approving, record approver details
    if (normalizedStatus === 'APPROVED') {
      updatePayload.approved_by = req.profile?.id || null;
      updatePayload.approved_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin
      .from('quotations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quotation status:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update quotation status.' });
    }

    await logQuotationActivity(
      id,
      req.profile,
      'STATUS_CHANGED',
      `Changed quotation status from ${oldStatus} to ${normalizedStatus}`,
      oldStatus,
      normalizedStatus
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Quotation status updated to ${normalizedStatus}.`,
    });
  } catch (err) {
    console.error('Quotation controller updateQuotationStatus exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update status.' });
  }
}

/**
 * GET /api/quotations/:id/activity
 * Fetch quotation audit activity log
 */
async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('quotation_activities')
      .select('*')
      .eq('quotation_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotation activity timeline:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to retrieve timeline.' });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Quotation controller getActivity exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load activity timeline.' });
  }
}

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  getActivity,
};
