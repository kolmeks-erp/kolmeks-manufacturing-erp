const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate a unique human-readable Sales Order number (e.g. SO-2026-000101)
 */
function generateSalesOrderNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `SO-${year}-${randomSuffix}`;
}

/**
 * Helper to log Sales Order Activity Events into sales_order_activities
 */
async function logSalesOrderActivity(sales_order_id, actorProfile, activity_type, description, old_value = null, new_value = null) {
  try {
    await supabaseAdmin.from('sales_order_activities').insert({
      sales_order_id,
      actor_id: actorProfile?.id || null,
      actor_name: actorProfile?.full_name || 'Staff User',
      activity_type,
      description,
      old_value: old_value ? String(old_value) : null,
      new_value: new_value ? String(new_value) : null,
    });
  } catch (err) {
    console.warn('Failed to insert Sales Order activity log:', err);
  }
}

/**
 * Server-side Financial Calculations Engine for Sales Orders
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
 * GET /api/sales-orders
 * Fetch paginated sales orders list with multi-field search, filters, and sorting
 */
async function getSalesOrders(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const priority = req.query.priority || 'all';
    const customer_id = req.query.customer_id || 'all';
    const quotation_id = req.query.quotation_id || 'all';
    const currency = req.query.currency || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('sales_orders').select('*', { count: 'exact' });

    // Status Filter
    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }

    // Priority Filter
    if (priority && priority !== 'all') {
      query = query.ilike('priority', priority);
    }

    // Customer Filter
    if (customer_id && customer_id !== 'all') {
      query = query.eq('customer_id', customer_id);
    }

    // Quotation Filter
    if (quotation_id && quotation_id !== 'all') {
      query = query.eq('quotation_id', quotation_id);
    }

    // Currency Filter
    if (currency && currency !== 'all') {
      query = query.eq('currency', currency);
    }

    // Search Filter (Order Number or Customer Reference)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_reference.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching sales orders:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve sales orders list.',
      });
    }

    // Fetch joined customer details, quotation numbers & creator details
    const customerIds = Array.from(new Set(data?.map((so) => so.customer_id).filter(Boolean)));
    const quotationIds = Array.from(new Set(data?.map((so) => so.quotation_id).filter(Boolean)));
    const creatorIds = Array.from(new Set(data?.map((so) => so.created_by).filter(Boolean)));

    let customersMap = {};
    let quotationsMap = {};
    let creatorsMap = {};

    if (customerIds.length > 0) {
      const { data: custs } = await supabaseAdmin.from('customers').select('id, company_name, customer_code').in('id', customerIds);
      custs?.forEach((c) => {
        customersMap[c.id] = c;
      });
    }

    if (quotationIds.length > 0) {
      const { data: quots } = await supabaseAdmin.from('quotations').select('id, quotation_number').in('id', quotationIds);
      quots?.forEach((q) => {
        quotationsMap[q.id] = q;
      });
    }

    if (creatorIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name').in('id', creatorIds);
      profs?.forEach((p) => {
        creatorsMap[p.id] = p;
      });
    }

    const formattedData = data?.map((so) => ({
      ...so,
      customer_master: so.customer_id ? customersMap[so.customer_id] || null : null,
      quotation_master: so.quotation_id ? quotationsMap[so.quotation_id] || null : null,
      creator_user: so.created_by ? creatorsMap[so.created_by] || null : null,
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
    console.error('SalesOrder controller getSalesOrders exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load sales orders list.',
    });
  }
}

/**
 * GET /api/sales-orders/:id
 * Fetch single sales order with customer info, quotation info, RFQ info, line items, and activity timeline
 */
async function getSalesOrderById(req, res) {
  try {
    const { id } = req.params;

    const { data: salesOrder, error: soError } = await supabaseAdmin
      .from('sales_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (soError || !salesOrder) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Sales Order record not found.',
      });
    }

    // Fetch customer info
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', salesOrder.customer_id)
      .single();

    // Fetch optional Quotation info
    let quotationMaster = null;
    if (salesOrder.quotation_id) {
      const { data: quot } = await supabaseAdmin
        .from('quotations')
        .select('*')
        .eq('id', salesOrder.quotation_id)
        .single();
      quotationMaster = quot || null;
    }

    // Fetch optional RFQ info
    let rfqMaster = null;
    if (salesOrder.rfq_id) {
      const { data: rfq } = await supabaseAdmin
        .from('rfqs')
        .select('*')
        .eq('id', salesOrder.rfq_id)
        .single();
      rfqMaster = rfq || null;
    }

    // Fetch line items
    const { data: lineItems } = await supabaseAdmin
      .from('sales_order_items')
      .select('*')
      .eq('sales_order_id', id)
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
    if (salesOrder.created_by) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('id, full_name, email').eq('id', salesOrder.created_by).single();
      creatorUser = prof || null;
    }

    // Fetch confirmer profile
    let confirmerUser = null;
    if (salesOrder.confirmed_by) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('id, full_name, email').eq('id', salesOrder.confirmed_by).single();
      confirmerUser = prof || null;
    }

    // Fetch activities
    const { data: activities } = await supabaseAdmin
      .from('sales_order_activities')
      .select('*')
      .eq('sales_order_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      data: {
        ...salesOrder,
        customer_master: customer || null,
        quotation_master: quotationMaster,
        rfq_master: rfqMaster,
        creator_user: creatorUser,
        confirmer_user: confirmerUser,
        items: formattedLineItems || [],
        activities: activities || [],
      },
    });
  } catch (err) {
    console.error('SalesOrder controller getSalesOrderById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load sales order details.',
    });
  }
}

/**
 * POST /api/sales-orders
 * Create a new manual Sales Order
 */
async function createSalesOrder(req, res) {
  try {
    const {
      customer_id,
      quotation_id,
      rfq_id,
      order_date,
      requested_delivery_date,
      delivery_date,
      priority,
      currency,
      customer_reference,
      payment_terms,
      delivery_terms,
      notes,
      items,
    } = req.body;

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

    // Verify customer exists
    const { data: cust, error: custErr } = await supabaseAdmin.from('customers').select('id, company_name').eq('id', customer_id).single();
    if (custErr || !cust) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Selected Customer record does not exist.',
      });
    }

    // Financial Calculation
    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculateFinancials(items);

    if (processedItems.some((item) => !item.description)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'All order line items must have a description.',
      });
    }

    const orderNumber = generateSalesOrderNumber();
    const finalOrderDate = order_date || new Date().toISOString().split('T')[0];

    const newSalesOrder = {
      order_number: orderNumber,
      customer_id,
      quotation_id: quotation_id || null,
      rfq_id: rfq_id || null,
      order_date: finalOrderDate,
      requested_delivery_date: requested_delivery_date || null,
      delivery_date: delivery_date || requested_delivery_date || null,
      priority: (priority || 'NORMAL').trim().toUpperCase(),
      currency: (currency || 'EUR').trim().toUpperCase(),
      subtotal,
      discount_amount,
      tax_amount,
      total: total_amount,
      customer_reference: (customer_reference || '').trim(),
      payment_terms: (payment_terms || '').trim(),
      delivery_terms: (delivery_terms || '').trim(),
      notes: (notes || '').trim(),
      status: 'DRAFT',
      created_by: req.profile?.id || null,
    };

    const { data: insertedSO, error: insertErr } = await supabaseAdmin
      .from('sales_orders')
      .insert(newSalesOrder)
      .select()
      .single();

    if (insertErr || !insertedSO) {
      console.error('Error inserting sales order:', insertErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to create sales order record.',
      });
    }

    // Insert line items
    const lineItemsToInsert = processedItems.map((item) => ({
      ...item,
      discount: item.discount, // align column
      tax: item.tax,
      line_total: item.line_total,
      sales_order_id: insertedSO.id,
    }));

    const { error: itemsErr } = await supabaseAdmin.from('sales_order_items').insert(lineItemsToInsert);

    if (itemsErr) {
      console.error('Error inserting sales order line items:', itemsErr);
    }

    await logSalesOrderActivity(
      insertedSO.id,
      req.profile,
      'CREATED',
      `Created manual sales order ${orderNumber} for ${cust.company_name} (Total: ₹{newSalesOrder.currency} ${total_amount.toLocaleString()})`
    );

    return res.status(201).json({
      success: true,
      data: insertedSO,
      message: `Sales Order ${orderNumber} created successfully as DRAFT.`,
    });
  } catch (err) {
    console.error('SalesOrder controller createSalesOrder exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create sales order.',
    });
  }
}

/**
 * POST /api/quotations/:id/create-sales-order
 * Convert an Accepted/Approved Quotation into a Sales Order with Duplicate Order Protection
 */
async function createSalesOrderFromQuotation(req, res) {
  try {
    const quotationId = req.params.id || req.body.quotation_id;

    if (!quotationId) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Quotation ID parameter is required.',
      });
    }

    // 1. Fetch Quotation Record
    const { data: quotation, error: qErr } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (qErr || !quotation) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Target Quotation record not found.',
      });
    }

    // 2. Validate Quotation Status (must be ACCEPTED or APPROVED unless overridden)
    const normalizedStatus = (quotation.status || '').toUpperCase();
    const isApprovedOrAccepted = ['ACCEPTED', 'APPROVED'].includes(normalizedStatus);

    if (!isApprovedOrAccepted && req.profile?.role?.name !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Quotation status is '${quotation.status}'. Only ACCEPTED or APPROVED commercial quotations can be converted into Sales Orders.`,
      });
    }

    // 3. Duplicate Order Protection Check
    const { data: existingSO, error: dupeErr } = await supabaseAdmin
      .from('sales_orders')
      .select('id, order_number, status')
      .eq('quotation_id', quotationId)
      .neq('status', 'CANCELLED')
      .maybeSingle();

    if (existingSO) {
      return res.status(409).json({
        success: false,
        error: 'DuplicateOrderError',
        message: `Sales Order ${existingSO.order_number} has already been generated from this quotation.`,
        existingSalesOrderId: existingSO.id,
        existingOrderNumber: existingSO.order_number,
      });
    }

    // 4. Fetch Quotation Line Items
    const { data: qItems } = await supabaseAdmin
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId)
      .order('created_at', { ascending: true });

    if (!qItems || qItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Quotation contains no line items to convert.',
      });
    }

    // Fetch Customer details
    const { data: cust } = await supabaseAdmin.from('customers').select('company_name').eq('id', quotation.customer_id).single();

    // 5. Generate Sales Order Record Inheriting Commercial Data
    const orderNumber = generateSalesOrderNumber();

    const newSalesOrder = {
      order_number: orderNumber,
      customer_id: quotation.customer_id,
      quotation_id: quotation.id,
      rfq_id: quotation.rfq_id || null,
      order_date: new Date().toISOString().split('T')[0],
      requested_delivery_date: quotation.valid_until || null,
      delivery_date: quotation.valid_until || null,
      priority: 'NORMAL',
      currency: quotation.currency || 'EUR',
      subtotal: quotation.subtotal || 0.00,
      discount_amount: quotation.discount || 0.00,
      tax_amount: quotation.tax || 0.00,
      total: quotation.total || 0.00,
      customer_reference: quotation.quotation_number ? `Ref: ${quotation.quotation_number}` : '',
      payment_terms: quotation.payment_terms || quotation.terms || '',
      delivery_terms: quotation.delivery_terms || quotation.delivery_time || '',
      notes: quotation.notes ? `Converted from Quotation ${quotation.quotation_number}. ${quotation.notes}` : `Converted from Quotation ${quotation.quotation_number}.`,
      status: 'CONFIRMED',
      confirmed_by: req.profile?.id || null,
      confirmed_at: new Date().toISOString(),
      created_by: req.profile?.id || null,
    };

    const { data: insertedSO, error: insertErr } = await supabaseAdmin
      .from('sales_orders')
      .insert(newSalesOrder)
      .select()
      .single();

    if (insertErr || !insertedSO) {
      console.error('Error creating sales order from quotation:', insertErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to convert quotation to sales order.',
      });
    }

    // Copy Line Items
    const soItemsToInsert = qItems.map((qi, index) => ({
      sales_order_id: insertedSO.id,
      product_id: qi.product_id || null,
      description: qi.description,
      quantity: qi.quantity,
      unit: qi.unit || 'pcs',
      unit_price: qi.unit_price,
      discount_type: qi.discount_type || 'amount',
      discount: qi.discount || 0.00,
      tax_rate: qi.tax_rate || 0.00,
      tax: qi.tax || 0.00,
      line_subtotal: qi.line_subtotal || Number((qi.quantity * qi.unit_price).toFixed(2)),
      line_total: qi.line_total,
      line_order: index + 1,
    }));

    await supabaseAdmin.from('sales_order_items').insert(soItemsToInsert);

    // Audit Log
    await logSalesOrderActivity(
      insertedSO.id,
      req.profile,
      'CREATED_FROM_QUOTATION',
      `Generated Sales Order ${orderNumber} from accepted Quotation ${quotation.quotation_number} for ${cust?.company_name || 'Customer'} (Total: ₹{newSalesOrder.currency} ${Number(newSalesOrder.total).toLocaleString()})`
    );

    return res.status(201).json({
      success: true,
      data: insertedSO,
      message: `Sales Order ${orderNumber} generated successfully from Quotation ${quotation.quotation_number}.`,
    });
  } catch (err) {
    console.error('SalesOrder controller createSalesOrderFromQuotation exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to generate Sales Order from quotation.',
    });
  }
}

/**
 * PATCH /api/sales-orders/:id
 * Full update for draft sales orders (recalculates totals)
 */
async function updateSalesOrder(req, res) {
  try {
    const { id } = req.params;
    const {
      customer_id,
      quotation_id,
      rfq_id,
      order_date,
      requested_delivery_date,
      delivery_date,
      priority,
      currency,
      customer_reference,
      payment_terms,
      delivery_terms,
      notes,
      items,
    } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin.from('sales_orders').select('*').eq('id', id).single();
    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Sales Order record not found.' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(existing.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Sales Order is in status '${existing.status}' and cannot be edited.`,
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'At least one line item is required.' });
    }

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculateFinancials(items);

    const updatePayload = {
      customer_id: customer_id || existing.customer_id,
      quotation_id: quotation_id !== undefined ? quotation_id : existing.quotation_id,
      rfq_id: rfq_id !== undefined ? rfq_id : existing.rfq_id,
      order_date: order_date || existing.order_date,
      requested_delivery_date: requested_delivery_date !== undefined ? requested_delivery_date : existing.requested_delivery_date,
      delivery_date: delivery_date !== undefined ? delivery_date : existing.delivery_date,
      priority: priority ? priority.trim().toUpperCase() : existing.priority,
      currency: currency ? currency.trim().toUpperCase() : existing.currency,
      subtotal,
      discount_amount,
      tax_amount,
      total: total_amount,
      customer_reference: customer_reference !== undefined ? (customer_reference || '').trim() : existing.customer_reference,
      payment_terms: payment_terms !== undefined ? (payment_terms || '').trim() : existing.payment_terms,
      delivery_terms: delivery_terms !== undefined ? (delivery_terms || '').trim() : existing.delivery_terms,
      notes: notes !== undefined ? (notes || '').trim() : existing.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedSO, error: updateErr } = await supabaseAdmin
      .from('sales_orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating sales order:', updateErr);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update sales order.' });
    }

    // Replace Line Items
    await supabaseAdmin.from('sales_order_items').delete().eq('sales_order_id', id);

    const lineItemsToInsert = processedItems.map((item) => ({
      sales_order_id: id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount: item.discount,
      tax_rate: item.tax_rate,
      tax: item.tax,
      line_subtotal: item.line_subtotal,
      line_total: item.line_total,
      line_order: item.line_order,
    }));

    await supabaseAdmin.from('sales_order_items').insert(lineItemsToInsert);

    await logSalesOrderActivity(
      id,
      req.profile,
      'UPDATED',
      `Updated sales order details and recalculated total: ${updatedSO.currency} ${total_amount.toLocaleString()}`
    );

    return res.status(200).json({
      success: true,
      data: updatedSO,
      message: 'Sales Order updated successfully.',
    });
  } catch (err) {
    console.error('SalesOrder controller updateSalesOrder exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update sales order.' });
  }
}

/**
 * PATCH /api/sales-orders/:id/status
 * Update sales order workflow status with role check and audit logging
 */
async function updateSalesOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Status parameter is required.' });
    }

    const normalizedStatus = status.trim().toUpperCase();

    const allowedStatuses = [
      'DRAFT',
      'CONFIRMED',
      'IN_PRODUCTION',
      'READY_FOR_DELIVERY',
      'PARTIALLY_DELIVERED',
      'DELIVERED',
      'COMPLETED',
      'ON_HOLD',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Invalid status '${status}'. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const { data: existingSO } = await supabaseAdmin.from('sales_orders').select('*').eq('id', id).single();
    if (!existingSO) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Sales Order record not found.' });
    }

    const oldStatus = existingSO.status;
    const updatePayload = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (normalizedStatus === 'CONFIRMED' && !existingSO.confirmed_at) {
      updatePayload.confirmed_by = req.profile?.id || null;
      updatePayload.confirmed_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin
      .from('sales_orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sales order status:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update sales order status.' });
    }

    await logSalesOrderActivity(
      id,
      req.profile,
      'STATUS_CHANGED',
      `Changed sales order status from ${oldStatus} to ${normalizedStatus}`,
      oldStatus,
      normalizedStatus
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Sales Order status updated to ${normalizedStatus}.`,
    });
  } catch (err) {
    console.error('SalesOrder controller updateSalesOrderStatus exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update status.' });
  }
}

/**
 * GET /api/sales-orders/:id/activity
 * Fetch sales order audit activity log
 */
async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('sales_order_activities')
      .select('*')
      .eq('sales_order_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales order activity timeline:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to retrieve timeline.' });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('SalesOrder controller getActivity exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load activity timeline.' });
  }
}

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  createSalesOrderFromQuotation,
  updateSalesOrder,
  updateSalesOrderStatus,
  getActivity,
};
