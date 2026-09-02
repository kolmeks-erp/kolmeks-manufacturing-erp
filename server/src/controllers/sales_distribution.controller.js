const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate human-readable numbers
 */
function generateNumber(prefix) {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${randomSuffix}`;
}

/**
 * Server-side Financial Calculator for Sales Line Items
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
      lineDiscount = Number(((lineSubtotal * Math.min(100, discInput)) / 100).toFixed(2));
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
 * GET /api/sales/dashboard
 * Live Sales & Distribution KPI Telemetry & Funnel
 */
async function getSalesDashboard(req, res) {
  try {
    const { data: quotations } = await supabaseAdmin.from('quotations').select('id, total, status');
    const { data: orders } = await supabaseAdmin.from('sales_orders').select('id, total, status, created_at');
    const { data: deliveries } = await supabaseAdmin.from('delivery_orders').select('id, status, dispatch_date');
    const { data: returns } = await supabaseAdmin.from('sales_returns').select('id, status');
    const { data: invoices } = await supabaseAdmin.from('sales_invoices').select('id, outstanding_amount, status');

    const totalQuotationCount = quotations?.length || 0;
    const totalQuotationValue = quotations?.reduce((acc, q) => acc + (Number(q.total) || 0), 0) || 0;

    const openOrders = orders?.filter(o => !['CANCELLED', 'CLOSED', 'COMPLETED'].includes((o.status || '').toUpperCase())) || [];
    const openOrdersCount = openOrders.length;
    const openOrdersValue = openOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const deliveriesToday = deliveries?.filter(d => d.dispatch_date && d.dispatch_date.startsWith(todayStr))?.length || 0;
    const pendingDeliveries = deliveries?.filter(d => ['DRAFT', 'READY', 'IN_TRANSIT'].includes((d.status || '').toUpperCase()))?.length || 0;

    const totalReturnsCount = returns?.length || 0;
    const outstandingReceivables = invoices?.reduce((acc, inv) => acc + (Number(inv.outstanding_amount) || 0), 0) || 0;

    // Funnel counts
    const draftQuotations = quotations?.filter(q => q.status === 'DRAFT')?.length || 0;
    const approvedQuotations = quotations?.filter(q => ['APPROVED', 'ACCEPTED'].includes(q.status))?.length || 0;
    const confirmedOrders = orders?.filter(o => o.status === 'CONFIRMED')?.length || 0;

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalQuotationCount,
          totalQuotationValue,
          openOrdersCount,
          openOrdersValue,
          pendingDeliveries,
          deliveriesToday,
          totalReturnsCount,
          outstandingReceivables,
        },
        funnel: {
          draftQuotations,
          approvedQuotations,
          confirmedOrders,
          totalOrders: orders?.length || 0,
          deliveredOrders: deliveries?.filter(d => d.status === 'DELIVERED')?.length || 0,
        }
      }
    });
  } catch (err) {
    console.error('getSalesDashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load Sales Dashboard.' });
  }
}

/**
 * QUOTATION ENDPOINTS
 */
async function getQuotations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';

    let query = supabaseAdmin.from('quotations').select('*', { count: 'exact' });
    if (status && status !== 'all') query = query.ilike('status', status);
    if (search) query = query.ilike('quotation_number', `%${search}%`);

    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    const { data, count, error } = await query;

    if (error) throw error;

    const customerIds = Array.from(new Set(data?.map(q => q.customer_id).filter(Boolean)));
    let customersMap = {};
    if (customerIds.length > 0) {
      const { data: custs } = await supabaseAdmin.from('customers').select('id, company_name, customer_code').in('id', customerIds);
      custs?.forEach(c => { customersMap[c.id] = c; });
    }

    const formatted = data?.map(q => ({
      ...q,
      customer_master: q.customer_id ? customersMap[q.customer_id] || null : null,
    }));

    return res.status(200).json({
      success: true,
      data: formatted || [],
      meta: { page, limit, total: count || 0 }
    });
  } catch (err) {
    console.error('getQuotations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load quotations.' });
  }
}

async function getQuotationById(req, res) {
  try {
    const { id } = req.params;
    const { data: quotation, error } = await supabaseAdmin.from('quotations').select('*').eq('id', id).single();
    if (error || !quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const { data: customer } = await supabaseAdmin.from('customers').select('*').eq('id', quotation.customer_id).single();
    const { data: items } = await supabaseAdmin.from('quotation_items').select('*').eq('quotation_id', id).order('line_order', { ascending: true });

    let opportunity = null;
    if (quotation.opportunity_id) {
      const { data: opp } = await supabaseAdmin.from('crm_opportunities').select('*').eq('id', quotation.opportunity_id).single();
      opportunity = opp || null;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...quotation,
        customer_master: customer || null,
        opportunity_master: opportunity,
        items: items || [],
      }
    });
  } catch (err) {
    console.error('getQuotationById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load quotation details.' });
  }
}

async function createQuotation(req, res) {
  try {
    const { customer_id, opportunity_id, quotation_date, valid_until, currency, payment_terms, delivery_terms, notes, items } = req.body;
    if (!customer_id) return res.status(400).json({ success: false, message: 'Customer is required.' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Line items required.' });

    const { processedItems, subtotal, discount_amount, tax_amount, total_amount } = calculateFinancials(items);
    const quotationNumber = generateNumber('QT');

    const newQuotation = {
      quotation_number: quotationNumber,
      customer_id,
      opportunity_id: opportunity_id || null,
      quotation_date: quotation_date || new Date().toISOString().split('T')[0],
      valid_until: valid_until || null,
      currency: (currency || 'INR').toUpperCase(),
      subtotal,
      discount: discount_amount,
      tax: tax_amount,
      total: total_amount,
      payment_terms: (payment_terms || '').trim(),
      delivery_terms: (delivery_terms || '').trim(),
      notes: (notes || '').trim(),
      status: 'DRAFT',
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('quotations').insert(newQuotation).select().single();
    if (error) throw error;

    const lineItems = processedItems.map(item => ({
      quotation_id: inserted.id,
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
    await supabaseAdmin.from('quotation_items').insert(lineItems);

    return res.status(201).json({ success: true, data: inserted, message: `Quotation ${quotationNumber} created successfully.` });
  } catch (err) {
    console.error('createQuotation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create quotation.' });
  }
}

async function updateQuotationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status required.' });

    const normalizedStatus = status.trim().toUpperCase();
    const allowed = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
    if (!allowed.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status ${status}.` });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('quotations')
      .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: updated, message: `Quotation status updated to ${normalizedStatus}.` });
  } catch (err) {
    console.error('updateQuotationStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update quotation status.' });
  }
}

/**
 * ORDER FULFILLMENT & STOCK RESERVATIONS
 */
async function getOrderFulfillment(req, res) {
  try {
    const { data: orders } = await supabaseAdmin.from('sales_orders').select('*').order('created_at', { ascending: false });
    const { data: items } = await supabaseAdmin.from('sales_order_items').select('*');

    const summary = orders?.map(order => {
      const orderItems = items?.filter(i => i.sales_order_id === order.id) || [];
      const totalOrdered = orderItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
      const totalReserved = orderItems.reduce((acc, i) => acc + (Number(i.reserved_quantity) || 0), 0);
      const totalDelivered = orderItems.reduce((acc, i) => acc + (Number(i.delivered_quantity) || 0), 0);
      const totalBackorder = orderItems.reduce((acc, i) => acc + (Number(i.backorder_quantity) || 0), 0);

      const fulfillmentPct = totalOrdered > 0 ? Math.min(100, Math.round((totalDelivered / totalOrdered) * 100)) : 0;

      return {
        ...order,
        totalOrdered,
        totalReserved,
        totalDelivered,
        totalBackorder,
        fulfillmentPct,
      };
    });

    return res.status(200).json({ success: true, data: summary || [] });
  } catch (err) {
    console.error('getOrderFulfillment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load fulfillment data.' });
  }
}

/**
 * PICKING API
 */
async function getPickings(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('sales_pickings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getPickings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load pickings.' });
  }
}

async function createPicking(req, res) {
  try {
    const { sales_order_id, warehouse_id, notes, items } = req.body;
    if (!sales_order_id || !warehouse_id) {
      return res.status(400).json({ success: false, message: 'Sales order and warehouse are required.' });
    }

    const pickingNumber = generateNumber('PK');
    const newPicking = {
      picking_number: pickingNumber,
      sales_order_id,
      warehouse_id,
      picker_id: req.profile?.id || null,
      status: 'PENDING',
      notes: (notes || '').trim(),
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('sales_pickings').insert(newPicking).select().single();
    if (error) throw error;

    if (items && Array.isArray(items)) {
      const pickingItems = items.map(i => ({
        picking_id: inserted.id,
        sales_order_item_id: i.sales_order_item_id || null,
        product_id: i.product_id,
        location_id: i.location_id || null,
        requested_quantity: Math.max(0, Number(i.requested_quantity) || 0),
        picked_quantity: 0,
        status: 'PENDING'
      }));
      await supabaseAdmin.from('sales_picking_items').insert(pickingItems);
    }

    return res.status(201).json({ success: true, data: inserted, message: `Picking List ${pickingNumber} generated.` });
  } catch (err) {
    console.error('createPicking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create picking list.' });
  }
}

async function updatePickingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, items } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status required.' });

    const updatePayload = {
      status: status.toUpperCase(),
      updated_at: new Date().toISOString(),
    };
    if (status.toUpperCase() === 'PICKED') {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin.from('sales_pickings').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && item.picked_quantity !== undefined) {
          await supabaseAdmin.from('sales_picking_items').update({
            picked_quantity: Number(item.picked_quantity),
            status: Number(item.picked_quantity) >= Number(item.requested_quantity) ? 'PICKED' : 'SHORTAGE'
          }).eq('id', item.id);

          if (item.sales_order_item_id) {
            await supabaseAdmin.from('sales_order_items').update({
              picked_quantity: Number(item.picked_quantity)
            }).eq('id', item.sales_order_item_id);
          }
        }
      }
    }

    return res.status(200).json({ success: true, data: updated, message: `Picking list updated to ${status}.` });
  } catch (err) {
    console.error('updatePickingStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update picking status.' });
  }
}

/**
 * PACKING API
 */
async function getPackings(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('sales_packings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getPackings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load packings.' });
  }
}

async function createPacking(req, res) {
  try {
    const { sales_order_id, picking_id, total_packages, total_weight_kg, notes, items } = req.body;
    if (!sales_order_id) return res.status(400).json({ success: false, message: 'Sales Order ID required.' });

    const packingNumber = generateNumber('PAK');
    const newPacking = {
      packing_number: packingNumber,
      sales_order_id,
      picking_id: picking_id || null,
      packer_id: req.profile?.id || null,
      total_packages: Math.max(1, Number(total_packages) || 1),
      total_weight_kg: Math.max(0, Number(total_weight_kg) || 0),
      status: 'PACKED',
      packed_at: new Date().toISOString(),
      notes: (notes || '').trim(),
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('sales_packings').insert(newPacking).select().single();
    if (error) throw error;

    if (items && Array.isArray(items)) {
      const packingItems = items.map(i => ({
        packing_id: inserted.id,
        sales_order_item_id: i.sales_order_item_id || null,
        product_id: i.product_id,
        package_number: i.package_number || 'PKG-01',
        packed_quantity: Math.max(0, Number(i.packed_quantity) || 0),
      }));
      await supabaseAdmin.from('sales_packing_items').insert(packingItems);

      for (const i of items) {
        if (i.sales_order_item_id) {
          await supabaseAdmin.from('sales_order_items').update({
            packed_quantity: Number(i.packed_quantity) || 0
          }).eq('id', i.sales_order_item_id);
        }
      }
    }

    return res.status(201).json({ success: true, data: inserted, message: `Packing Slip ${packingNumber} created.` });
  } catch (err) {
    console.error('createPacking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create packing slip.' });
  }
}

/**
 * DELIVERY ORDERS API
 */
async function getDeliveries(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('delivery_orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const customerIds = Array.from(new Set(data?.map(d => d.customer_id).filter(Boolean)));
    let customersMap = {};
    if (customerIds.length > 0) {
      const { data: custs } = await supabaseAdmin.from('customers').select('id, company_name').in('id', customerIds);
      custs?.forEach(c => { customersMap[c.id] = c; });
    }

    const formatted = data?.map(d => ({
      ...d,
      customer_master: d.customer_id ? customersMap[d.customer_id] || null : null,
    }));

    return res.status(200).json({ success: true, data: formatted || [] });
  } catch (err) {
    console.error('getDeliveries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load deliveries.' });
  }
}

async function getDeliveryById(req, res) {
  try {
    const { id } = req.params;
    const { data: delivery, error } = await supabaseAdmin.from('delivery_orders').select('*').eq('id', id).single();
    if (error || !delivery) return res.status(404).json({ success: false, message: 'Delivery record not found.' });

    const { data: customer } = await supabaseAdmin.from('customers').select('*').eq('id', delivery.customer_id).single();
    const { data: items } = await supabaseAdmin.from('delivery_order_items').select('*').eq('delivery_id', id);

    return res.status(200).json({
      success: true,
      data: {
        ...delivery,
        customer_master: customer || null,
        items: items || [],
      }
    });
  } catch (err) {
    console.error('getDeliveryById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load delivery details.' });
  }
}

async function createDelivery(req, res) {
  try {
    const { sales_order_id, customer_id, warehouse_id, packing_id, delivery_address, carrier, tracking_reference, expected_delivery_date, notes, items } = req.body;
    if (!sales_order_id || !customer_id) {
      return res.status(400).json({ success: false, message: 'Sales Order and Customer are required.' });
    }

    const deliveryNumber = generateNumber('DO');
    const newDelivery = {
      delivery_number: deliveryNumber,
      sales_order_id,
      customer_id,
      warehouse_id: warehouse_id || null,
      packing_id: packing_id || null,
      delivery_address: (delivery_address || '').trim(),
      carrier: (carrier || '').trim(),
      tracking_reference: (tracking_reference || '').trim(),
      expected_delivery_date: expected_delivery_date || null,
      status: 'READY',
      notes: (notes || '').trim(),
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('delivery_orders').insert(newDelivery).select().single();
    if (error) throw error;

    if (items && Array.isArray(items)) {
      const delItems = items.map(i => ({
        delivery_id: inserted.id,
        sales_order_item_id: i.sales_order_item_id || null,
        product_id: i.product_id,
        quantity: Math.max(0, Number(i.quantity) || 0),
        batch_id: i.batch_id || null,
        serial_number_id: i.serial_number_id || null,
      }));
      await supabaseAdmin.from('delivery_order_items').insert(delItems);
    }

    return res.status(201).json({ success: true, data: inserted, message: `Delivery Order ${deliveryNumber} created.` });
  } catch (err) {
    console.error('createDelivery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create delivery order.' });
  }
}

async function dispatchDelivery(req, res) {
  try {
    const { id } = req.params;
    const { carrier, tracking_reference } = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('delivery_orders')
      .update({
        status: 'DISPATCHED',
        carrier: carrier || undefined,
        tracking_reference: tracking_reference || undefined,
        dispatch_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: updated, message: 'Delivery dispatched successfully.' });
  } catch (err) {
    console.error('dispatchDelivery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch delivery.' });
  }
}

async function confirmDelivery(req, res) {
  try {
    const { id } = req.params;
    const { proof_reference, notes } = req.body;

    const { data: delivery, error: fetchErr } = await supabaseAdmin.from('delivery_orders').select('*').eq('id', id).single();
    if (fetchErr || !delivery) return res.status(404).json({ success: false, message: 'Delivery order not found.' });

    const { data: updated, error } = await supabaseAdmin
      .from('delivery_orders')
      .update({
        status: 'DELIVERED',
        actual_delivery_date: new Date().toISOString(),
        confirmed_by: req.profile?.id || null,
        proof_reference: (proof_reference || '').trim(),
        notes: notes ? `${delivery.notes || ''} ${notes}`.trim() : delivery.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update Sales Order line item delivered quantities
    const { data: delItems } = await supabaseAdmin.from('delivery_order_items').select('*').eq('delivery_id', id);
    if (delItems) {
      for (const item of delItems) {
        if (item.sales_order_item_id) {
          const { data: soItem } = await supabaseAdmin.from('sales_order_items').select('delivered_quantity').eq('id', item.sales_order_item_id).single();
          const curDelivered = Number(soItem?.delivered_quantity) || 0;
          await supabaseAdmin.from('sales_order_items').update({
            delivered_quantity: curDelivered + (Number(item.quantity) || 0)
          }).eq('id', item.sales_order_item_id);
        }
      }
    }

    // Update Sales Order overall status
    if (delivery.sales_order_id) {
      await supabaseAdmin.from('sales_orders').update({
        status: 'FULFILLED',
        updated_at: new Date().toISOString(),
      }).eq('id', delivery.sales_order_id);
    }

    return res.status(200).json({ success: true, data: updated, message: 'Delivery marked as DELIVERED.' });
  } catch (err) {
    console.error('confirmDelivery error:', err);
    return res.status(500).json({ success: false, message: 'Failed to confirm delivery.' });
  }
}

/**
 * SALES RETURNS API
 */
async function getSalesReturns(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('sales_returns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getSalesReturns error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load sales returns.' });
  }
}

async function createSalesReturn(req, res) {
  try {
    const { sales_order_id, delivery_id, customer_id, return_date, reason, notes, items } = req.body;
    if (!customer_id || !reason) return res.status(400).json({ success: false, message: 'Customer and return reason are required.' });

    const returnNumber = generateNumber('SR');
    const newReturn = {
      return_number: returnNumber,
      sales_order_id: sales_order_id || null,
      delivery_id: delivery_id || null,
      customer_id,
      return_date: return_date || new Date().toISOString().split('T')[0],
      reason: reason.trim(),
      status: 'REQUESTED',
      notes: (notes || '').trim(),
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('sales_returns').insert(newReturn).select().single();
    if (error) throw error;

    if (items && Array.isArray(items)) {
      const retItems = items.map(i => ({
        return_id: inserted.id,
        sales_order_item_id: i.sales_order_item_id || null,
        product_id: i.product_id,
        quantity: Math.max(0, Number(i.quantity) || 0),
        unit_price: Math.max(0, Number(i.unit_price) || 0),
        reason: i.reason || reason,
      }));
      await supabaseAdmin.from('sales_return_items').insert(retItems);
    }

    return res.status(201).json({ success: true, data: inserted, message: `Sales Return Request ${returnNumber} submitted.` });
  } catch (err) {
    console.error('createSalesReturn error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create sales return.' });
  }
}

async function updateSalesReturnStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const normalized = status.toUpperCase();
    const { data: updated, error } = await supabaseAdmin.from('sales_returns').update({
      status: normalized,
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: updated, message: `Sales return updated to ${normalized}.` });
  } catch (err) {
    console.error('updateSalesReturnStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update sales return status.' });
  }
}

/**
 * CREDIT NOTES API
 */
async function getCreditNotes(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('credit_notes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getCreditNotes error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load credit notes.' });
  }
}

async function createCreditNote(req, res) {
  try {
    const { sales_return_id, invoice_id, customer_id, credit_date, currency, subtotal, tax_amount, total_amount, notes } = req.body;
    if (!customer_id) return res.status(400).json({ success: false, message: 'Customer ID required.' });

    const cnNumber = generateNumber('CN');
    const newCN = {
      credit_note_number: cnNumber,
      sales_return_id: sales_return_id || null,
      invoice_id: invoice_id || null,
      customer_id,
      credit_date: credit_date || new Date().toISOString().split('T')[0],
      currency: (currency || 'INR').toUpperCase(),
      subtotal: Math.max(0, Number(subtotal) || 0),
      tax_amount: Math.max(0, Number(tax_amount) || 0),
      total_amount: Math.max(0, Number(total_amount) || 0),
      status: 'POSTED',
      notes: (notes || '').trim(),
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('credit_notes').insert(newCN).select().single();
    if (error) throw error;

    if (sales_return_id) {
      await supabaseAdmin.from('sales_returns').update({ status: 'CREDITED' }).eq('id', sales_return_id);
    }

    return res.status(201).json({ success: true, data: inserted, message: `Credit Note ${cnNumber} posted.` });
  } catch (err) {
    console.error('createCreditNote error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create credit note.' });
  }
}

/**
 * PRICING RULES API
 */
async function getPricingRules(req, res) {
  try {
    const { data, error } = await supabaseAdmin.from('sales_pricings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getPricingRules error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load pricing rules.' });
  }
}

async function createPricingRule(req, res) {
  try {
    const { product_id, customer_id, base_price, min_quantity, discount_percentage, currency, effective_date, expiry_date } = req.body;
    if (!product_id || base_price === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and Base Price are required.' });
    }

    const newRule = {
      product_id,
      customer_id: customer_id || null,
      base_price: Math.max(0, Number(base_price) || 0),
      min_quantity: Math.max(1, Number(min_quantity) || 1),
      discount_percentage: Math.max(0, Math.min(100, Number(discount_percentage) || 0)),
      currency: (currency || 'INR').toUpperCase(),
      effective_date: effective_date || new Date().toISOString().split('T')[0],
      expiry_date: expiry_date || null,
      is_active: true,
      created_by: req.profile?.id || null,
    };

    const { data: inserted, error } = await supabaseAdmin.from('sales_pricings').insert(newRule).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data: inserted, message: 'Pricing rule configured successfully.' });
  } catch (err) {
    console.error('createPricingRule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create pricing rule.' });
  }
}

/**
 * SALES REPORTS API
 */
async function getSalesReports(req, res) {
  try {
    const { data: orders } = await supabaseAdmin.from('sales_orders').select('*');
    const { data: returns } = await supabaseAdmin.from('sales_returns').select('*');
    const { data: customers } = await supabaseAdmin.from('customers').select('id, company_name');

    let custMap = {};
    customers?.forEach(c => { custMap[c.id] = c.company_name; });

    const customerSummary = {};
    orders?.forEach(o => {
      const name = custMap[o.customer_id] || 'Unknown Customer';
      if (!customerSummary[name]) {
        customerSummary[name] = { name, totalOrders: 0, totalRevenue: 0, returnsCount: 0 };
      }
      customerSummary[name].totalOrders += 1;
      customerSummary[name].totalRevenue += Number(o.total) || 0;
    });

    returns?.forEach(r => {
      const name = custMap[r.customer_id] || 'Unknown Customer';
      if (customerSummary[name]) {
        customerSummary[name].returnsCount += 1;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        customerPerformance: Object.values(customerSummary),
        totalOrdersCount: orders?.length || 0,
        totalReturnsCount: returns?.length || 0,
      }
    });
  } catch (err) {
    console.error('getSalesReports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate sales reports.' });
  }
}

module.exports = {
  getSalesDashboard,
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotationStatus,
  getOrderFulfillment,
  getPickings,
  createPicking,
  updatePickingStatus,
  getPackings,
  createPacking,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  dispatchDelivery,
  confirmDelivery,
  getSalesReturns,
  createSalesReturn,
  updateSalesReturnStatus,
  getCreditNotes,
  createCreditNote,
  getPricingRules,
  createPricingRule,
  getSalesReports,
};
