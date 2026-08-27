const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper to generate a unique Goods Receipt Number (e.g. GRN-2026-000101)
 */
function generateGRNNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `GRN-${year}-${randomSuffix}`;
}

/**
 * Audit Log Helper for Goods Receipts
 */
async function logGRNActivity(goods_receipt_id, actorProfile, action, details = {}) {
  try {
    await supabaseAdmin.from('goods_receipt_activities').insert({
      goods_receipt_id,
      performed_by: actorProfile?.id || null,
      action,
      details: {
        actor_name: actorProfile?.full_name || 'Staff User',
        ...details,
      },
    });
  } catch (err) {
    console.warn('Failed to insert Goods Receipt activity log:', err);
  }
}

/**
 * GET /api/purchase-orders/eligible-for-receiving
 * Fetch Purchase Orders that are eligible to have GRNs created against them
 */
async function getEligiblePurchaseOrders(req, res) {
  try {
    // Fetch POs with eligible statuses
    const { data: pos, error: poErr } = await supabaseAdmin
      .from('purchase_orders')
      .select('id, po_number, supplier_id, order_date, expected_delivery, status, total, currency')
      .in('status', ['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'approved', 'sent', 'acknowledged', 'partially_received'])
      .order('order_date', { ascending: false });

    if (poErr) {
      console.error('Error fetching eligible POs:', poErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve eligible purchase orders.',
      });
    }

    if (!pos || pos.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Fetch suppliers
    const supplierIds = Array.from(new Set(pos.map((p) => p.supplier_id).filter(Boolean)));
    let suppliersMap = {};
    if (supplierIds.length > 0) {
      const { data: supps } = await supabaseAdmin.from('suppliers').select('id, supplier_code, name, email, phone').in('id', supplierIds);
      supps?.forEach((s) => {
        suppliersMap[s.id] = s;
      });
    }

    // Fetch PO items
    const poIds = pos.map((p) => p.id);
    const { data: poItems } = await supabaseAdmin
      .from('purchase_order_items')
      .select('id, purchase_order_id, product_id, description, quantity, received_quantity, unit, unit_price')
      .in('purchase_order_id', poIds);

    // Fetch completed GRN items to derive accurate previously received quantities
    const { data: completedGRNs } = await supabaseAdmin
      .from('goods_receipts')
      .select('id')
      .in('purchase_order_id', poIds)
      .eq('status', 'COMPLETED');

    const completedGRNIds = (completedGRNs || []).map((g) => g.id);
    let prevReceivedMap = {};

    if (completedGRNIds.length > 0) {
      const { data: grnItems } = await supabaseAdmin
        .from('goods_receipt_items')
        .select('purchase_order_item_id, accepted_quantity')
        .in('goods_receipt_id', completedGRNIds);

      grnItems?.forEach((gri) => {
        const itemKey = gri.purchase_order_item_id;
        prevReceivedMap[itemKey] = (prevReceivedMap[itemKey] || 0) + Number(gri.accepted_quantity || 0);
      });
    }

    // Products master
    const productIds = Array.from(new Set((poItems || []).map((i) => i.product_id).filter(Boolean)));
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabaseAdmin.from('products').select('id, name, product_code').in('id', productIds);
      prods?.forEach((pr) => {
        productsMap[pr.id] = pr;
      });
    }

    const eligiblePOs = pos
      .map((po) => {
        const items = (poItems || [])
          .filter((i) => i.purchase_order_id === po.id)
          .map((item) => {
            const orderedQty = Number(item.quantity) || 0;
            const prevReceivedQty = prevReceivedMap[item.id] !== undefined ? prevReceivedMap[item.id] : Number(item.received_quantity) || 0;
            const remainingQty = Math.max(0, Number((orderedQty - prevReceivedQty).toFixed(2)));

            return {
              ...item,
              ordered_quantity: orderedQty,
              previously_received_quantity: prevReceivedQty,
              remaining_quantity: remainingQty,
              product_master: item.product_id ? productsMap[item.product_id] || null : null,
            };
          });

        const totalRemaining = items.reduce((acc, curr) => acc + curr.remaining_quantity, 0);

        return {
          ...po,
          supplier: po.supplier_id ? suppliersMap[po.supplier_id] || null : null,
          items,
          total_remaining_quantity: Number(totalRemaining.toFixed(2)),
        };
      })
      .filter((po) => po.items.length > 0 && po.total_remaining_quantity > 0);

    return res.status(200).json({
      success: true,
      data: eligiblePOs,
    });
  } catch (err) {
    console.error('GRN controller getEligiblePurchaseOrders exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load eligible purchase orders.',
    });
  }
}

/**
 * GET /api/goods-receipts
 * Fetch paginated list of goods receipts with search, filtering, and sorting
 */
async function getGoodsReceipts(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const supplier_id = req.query.supplier_id || 'all';
    const purchase_order_id = req.query.purchase_order_id || 'all';
    const receipt_date = req.query.receipt_date || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('goods_receipts').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }
    if (supplier_id && supplier_id !== 'all') {
      query = query.eq('supplier_id', supplier_id);
    }
    if (purchase_order_id && purchase_order_id !== 'all') {
      query = query.eq('purchase_order_id', purchase_order_id);
    }
    if (receipt_date && receipt_date !== 'all') {
      query = query.eq('receipt_date', receipt_date);
    }

    if (search) {
      query = query.or(`grn_number.ilike.%${search}%,delivery_reference.ilike.%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching goods receipts:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve goods receipts list.',
      });
    }

    // Join Suppliers, POs, and Profiles
    const supplierIds = Array.from(new Set((data || []).map((g) => g.supplier_id).filter(Boolean)));
    let suppliersMap = {};
    if (supplierIds.length > 0) {
      const { data: supps } = await supabaseAdmin.from('suppliers').select('id, supplier_code, name').in('id', supplierIds);
      supps?.forEach((s) => {
        suppliersMap[s.id] = s;
      });
    }

    const poIds = Array.from(new Set((data || []).map((g) => g.purchase_order_id).filter(Boolean)));
    let posMap = {};
    if (poIds.length > 0) {
      const { data: pos } = await supabaseAdmin.from('purchase_orders').select('id, po_number, status').in('id', poIds);
      pos?.forEach((p) => {
        posMap[p.id] = p;
      });
    }

    const userIds = Array.from(new Set((data || []).flatMap((g) => [g.received_by, g.created_by]).filter(Boolean)));
    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name, email, department').in('id', userIds);
      profs?.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }

    // Fetch items summary for totals
    const grnIds = (data || []).map((g) => g.id);
    let totalsMap = {};
    if (grnIds.length > 0) {
      const { data: grnItems } = await supabaseAdmin
        .from('goods_receipt_items')
        .select('goods_receipt_id, received_quantity, rejected_quantity, accepted_quantity');

      grnItems?.forEach((item) => {
        if (!totalsMap[item.goods_receipt_id]) {
          totalsMap[item.goods_receipt_id] = { total_received: 0, total_rejected: 0, total_accepted: 0, item_count: 0 };
        }
        totalsMap[item.goods_receipt_id].total_received += Number(item.received_quantity || 0);
        totalsMap[item.goods_receipt_id].total_rejected += Number(item.rejected_quantity || 0);
        totalsMap[item.goods_receipt_id].total_accepted += Number(item.accepted_quantity || 0);
        totalsMap[item.goods_receipt_id].item_count += 1;
      });
    }

    const formattedData = data?.map((grn) => ({
      ...grn,
      supplier: grn.supplier_id ? suppliersMap[grn.supplier_id] || null : null,
      purchase_order: grn.purchase_order_id ? posMap[grn.purchase_order_id] || null : null,
      receiver_user: grn.received_by ? profilesMap[grn.received_by] || null : null,
      creator_user: grn.created_by ? profilesMap[grn.created_by] || null : null,
      totals: totalsMap[grn.id] || { total_received: 0, total_rejected: 0, total_accepted: 0, item_count: 0 },
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
    console.error('GRN controller getGoodsReceipts exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load goods receipts.',
    });
  }
}

/**
 * GET /api/goods-receipts/:id
 * Fetch single goods receipt with items, supplier, PO, profiles, and activities
 */
async function getGoodsReceiptById(req, res) {
  try {
    const { id } = req.params;

    const { data: grn, error: grnErr } = await supabaseAdmin
      .from('goods_receipts')
      .select('*')
      .eq('id', id)
      .single();

    if (grnErr || !grn) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Goods Receipt record not found.',
      });
    }

    // Fetch supplier & PO
    let supplier = null;
    if (grn.supplier_id) {
      const { data: s } = await supabaseAdmin.from('suppliers').select('*').eq('id', grn.supplier_id).single();
      supplier = s || null;
    }

    let purchaseOrder = null;
    if (grn.purchase_order_id) {
      const { data: p } = await supabaseAdmin.from('purchase_orders').select('*').eq('id', grn.purchase_order_id).single();
      purchaseOrder = p || null;
    }

    // Warehouse info if exists
    let warehouse = null;
    if (grn.warehouse_id) {
      const { data: w } = await supabaseAdmin.from('warehouses').select('*').eq('id', grn.warehouse_id).single();
      warehouse = w || null;
    }

    // Profiles map
    const userIds = Array.from(new Set([grn.received_by, grn.created_by, grn.updated_by].filter(Boolean)));
    let profilesMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, full_name, email, department').in('id', userIds);
      profs?.forEach((pr) => {
        profilesMap[pr.id] = pr;
      });
    }

    // Fetch line items
    const { data: items } = await supabaseAdmin
      .from('goods_receipt_items')
      .select('*')
      .eq('goods_receipt_id', id)
      .order('created_at', { ascending: true });

    // Products master
    const productIds = Array.from(new Set((items || []).map((i) => i.product_id).filter(Boolean)));
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabaseAdmin.from('products').select('id, name, product_code, drawing_number').in('id', productIds);
      prods?.forEach((pr) => {
        productsMap[pr.id] = pr;
      });
    }

    const formattedItems = (items || []).map((item) => ({
      ...item,
      product_master: item.product_id ? productsMap[item.product_id] || null : null,
    }));

    // Activities
    const { data: activities } = await supabaseAdmin
      .from('goods_receipt_activities')
      .select('*')
      .eq('goods_receipt_id', id)
      .order('created_at', { ascending: false });

    // Calculate totals
    const totals = (formattedItems || []).reduce(
      (acc, item) => ({
        total_ordered: acc.total_ordered + Number(item.ordered_quantity || 0),
        total_previously_received: acc.total_previously_received + Number(item.previously_received_quantity || 0),
        total_received: acc.total_received + Number(item.received_quantity || 0),
        total_rejected: acc.total_rejected + Number(item.rejected_quantity || 0),
        total_accepted: acc.total_accepted + Number(item.accepted_quantity || 0),
      }),
      { total_ordered: 0, total_previously_received: 0, total_received: 0, total_rejected: 0, total_accepted: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        ...grn,
        supplier,
        purchase_order: purchaseOrder,
        warehouse,
        receiver_user: grn.received_by ? profilesMap[grn.received_by] || null : null,
        creator_user: grn.created_by ? profilesMap[grn.created_by] || null : null,
        items: formattedItems,
        totals,
        activities: activities || [],
      },
    });
  } catch (err) {
    console.error('GRN controller getGoodsReceiptById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load goods receipt details.',
    });
  }
}

/**
 * POST /api/goods-receipts
 * Create a new Goods Receipt note against an approved Purchase Order
 */
async function createGoodsReceipt(req, res) {
  try {
    const {
      purchase_order_id,
      receipt_date,
      delivery_reference,
      warehouse_id,
      notes,
      items,
    } = req.body;

    if (!purchase_order_id) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'A valid Purchase Order must be selected.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'At least one item receiving line is required.',
      });
    }

    // Fetch PO
    const { data: po, error: poErr } = await supabaseAdmin
      .from('purchase_orders')
      .select('id, po_number, supplier_id, status')
      .eq('id', purchase_order_id)
      .single();

    if (poErr || !po) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Selected Purchase Order record not found.',
      });
    }

    if (['CANCELLED', 'DRAFT'].includes(po.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Cannot create Goods Receipt for Purchase Order in status '${po.status}'.`,
      });
    }

    // Fetch PO items
    const { data: poItems } = await supabaseAdmin
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchase_order_id);

    if (!poItems || poItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Selected Purchase Order has no line items.',
      });
    }

    // Fetch completed GRNs to compute accurate previously received quantities
    const { data: completedGRNs } = await supabaseAdmin
      .from('goods_receipts')
      .select('id')
      .eq('purchase_order_id', purchase_order_id)
      .eq('status', 'COMPLETED');

    const completedGRNIds = (completedGRNs || []).map((g) => g.id);
    let prevReceivedMap = {};

    if (completedGRNIds.length > 0) {
      const { data: grnItems } = await supabaseAdmin
        .from('goods_receipt_items')
        .select('purchase_order_item_id, accepted_quantity')
        .in('goods_receipt_id', completedGRNIds);

      grnItems?.forEach((gri) => {
        const itemKey = gri.purchase_order_item_id;
        prevReceivedMap[itemKey] = (prevReceivedMap[itemKey] || 0) + Number(gri.accepted_quantity || 0);
      });
    }

    // Validate items and check for over-receiving
    const validatedItems = [];
    for (const item of items) {
      const poItem = poItems.find((pi) => pi.id === item.purchase_order_item_id);
      if (!poItem) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: `Invalid Purchase Order item specified (${item.purchase_order_item_id}).`,
        });
      }

      const orderedQty = Number(poItem.quantity) || 0;
      const prevReceivedQty = prevReceivedMap[poItem.id] !== undefined ? prevReceivedMap[poItem.id] : Number(poItem.received_quantity) || 0;
      const remainingQty = Math.max(0, Number((orderedQty - prevReceivedQty).toFixed(2)));

      const receivedQty = Math.max(0, Number(item.received_quantity) || 0);
      const rejectedQty = Math.max(0, Number(item.rejected_quantity) || 0);

      if (receivedQty > remainingQty) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: `Received quantity cannot exceed remaining quantity for item: ${poItem.description}. (Ordered: ${orderedQty}, Prev Received: ${prevReceivedQty}, Remaining: ${remainingQty}, Attempted: ${receivedQty}).`,
        });
      }

      if (rejectedQty > receivedQty) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: `Rejected quantity (${rejectedQty}) cannot exceed received quantity (${receivedQty}) for item: ${poItem.description}.`,
        });
      }

      if (rejectedQty > 0 && !item.rejection_reason?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: `A rejection reason is required when rejected quantity is greater than 0 for item: ${poItem.description}.`,
        });
      }

      const acceptedQty = Math.max(0, Number((receivedQty - rejectedQty).toFixed(2)));

      validatedItems.push({
        purchase_order_item_id: poItem.id,
        product_id: poItem.product_id || null,
        description: poItem.description,
        ordered_quantity: orderedQty,
        previously_received_quantity: prevReceivedQty,
        received_quantity: receivedQty,
        rejected_quantity: rejectedQty,
        accepted_quantity: acceptedQty,
        unit: poItem.unit || 'pcs',
        rejection_reason: rejectedQty > 0 ? (item.rejection_reason || '').trim() : null,
        notes: (item.notes || '').trim(),
      });
    }

    const currentUserId = req.profile?.id;
    const grnNumber = generateGRNNumber();

    const newGRN = {
      grn_number: grnNumber,
      purchase_order_id: po.id,
      supplier_id: po.supplier_id,
      receipt_date: receipt_date || new Date().toISOString().split('T')[0],
      delivery_reference: (delivery_reference || '').trim(),
      received_by: currentUserId || null,
      warehouse_id: warehouse_id || null,
      status: 'IN_PROGRESS',
      notes: (notes || '').trim(),
      created_by: currentUserId || null,
    };

    const { data: insertedGRN, error: insertErr } = await supabaseAdmin
      .from('goods_receipts')
      .insert(newGRN)
      .select()
      .single();

    if (insertErr || !insertedGRN) {
      console.error('Error inserting goods receipt:', insertErr);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to create Goods Receipt record.',
      });
    }

    // Insert GRN items
    const grnItemsToInsert = validatedItems.map((v) => ({
      goods_receipt_id: insertedGRN.id,
      ...v,
    }));

    await supabaseAdmin.from('goods_receipt_items').insert(grnItemsToInsert);

    await logGRNActivity(insertedGRN.id, req.profile, 'CREATED', {
      message: `Created Goods Receipt ${grnNumber} for PO ${po.po_number}.`,
    });

    return res.status(201).json({
      success: true,
      data: insertedGRN,
      message: `Goods Receipt ${grnNumber} created successfully.`,
    });
  } catch (err) {
    console.error('GRN controller createGoodsReceipt exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create Goods Receipt.',
    });
  }
}

/**
 * PATCH /api/goods-receipts/:id
 * Update draft / in-progress Goods Receipt note
 */
async function updateGoodsReceipt(req, res) {
  try {
    const { id } = req.params;
    const { receipt_date, delivery_reference, warehouse_id, notes, items } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('goods_receipts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Goods Receipt record not found.' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(existing.status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Goods Receipt is in status '${existing.status}' and cannot be updated.`,
      });
    }

    const updatePayload = {
      receipt_date: receipt_date || existing.receipt_date,
      delivery_reference: delivery_reference !== undefined ? delivery_reference.trim() : existing.delivery_reference,
      warehouse_id: warehouse_id !== undefined ? warehouse_id : existing.warehouse_id,
      notes: notes !== undefined ? notes.trim() : existing.notes,
      updated_by: req.profile?.id || null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedGRN, error: updateErr } = await supabaseAdmin
      .from('goods_receipts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update Goods Receipt.' });
    }

    if (items && Array.isArray(items)) {
      // Re-validate and replace items
      const { data: poItems } = await supabaseAdmin
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', existing.purchase_order_id);

      const validatedItems = [];
      for (const item of items) {
        const poItem = poItems.find((pi) => pi.id === item.purchase_order_item_id);
        if (poItem) {
          const orderedQty = Number(poItem.quantity) || 0;
          const prevReceivedQty = Number(item.previously_received_quantity || poItem.received_quantity) || 0;
          const remainingQty = Math.max(0, Number((orderedQty - prevReceivedQty).toFixed(2)));

          const receivedQty = Math.max(0, Number(item.received_quantity) || 0);
          const rejectedQty = Math.max(0, Number(item.rejected_quantity) || 0);

          if (receivedQty > remainingQty) {
            return res.status(400).json({
              success: false,
              error: 'ValidationError',
              message: `Received quantity cannot exceed remaining quantity for item: ${poItem.description}.`,
            });
          }

          const acceptedQty = Math.max(0, Number((receivedQty - rejectedQty).toFixed(2)));

          validatedItems.push({
            goods_receipt_id: id,
            purchase_order_item_id: poItem.id,
            product_id: poItem.product_id || null,
            description: poItem.description,
            ordered_quantity: orderedQty,
            previously_received_quantity: prevReceivedQty,
            received_quantity: receivedQty,
            rejected_quantity: rejectedQty,
            accepted_quantity: acceptedQty,
            unit: poItem.unit || 'pcs',
            rejection_reason: rejectedQty > 0 ? (item.rejection_reason || '').trim() : null,
            notes: (item.notes || '').trim(),
          });
        }
      }

      await supabaseAdmin.from('goods_receipt_items').delete().eq('goods_receipt_id', id);
      await supabaseAdmin.from('goods_receipt_items').insert(validatedItems);
    }

    await logGRNActivity(id, req.profile, 'UPDATED', { message: 'Updated Goods Receipt specifications and quantities.' });

    return res.status(200).json({
      success: true,
      data: updatedGRN,
      message: 'Goods Receipt updated successfully.',
    });
  } catch (err) {
    console.error('GRN controller updateGoodsReceipt exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update Goods Receipt.' });
  }
}

/**
 * POST /api/goods-receipts/:id/complete
 * Complete a Goods Receipt note, update PO line received_quantity, and transition PO status
 */
async function completeGoodsReceipt(req, res) {
  try {
    const { id } = req.params;

    const { data: grn, error: grnErr } = await supabaseAdmin
      .from('goods_receipts')
      .select('*')
      .eq('id', id)
      .single();

    if (grnErr || !grn) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Goods Receipt record not found.' });
    }

    if (grn.status.toUpperCase() === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'This Goods Receipt has already been completed.',
      });
    }

    if (grn.status.toUpperCase() === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Cancelled Goods Receipts cannot be completed.',
      });
    }

    // Fetch GRN items
    const { data: grnItems } = await supabaseAdmin
      .from('goods_receipt_items')
      .select('*')
      .eq('goods_receipt_id', id);

    if (!grnItems || grnItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Goods Receipt has no items to complete.',
      });
    }

    // Fetch PO items
    const { data: poItems } = await supabaseAdmin
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', grn.purchase_order_id);

    // Concurrency check: Re-verify total accepted quantities across all COMPLETED GRNs (excluding this current GRN)
    const { data: completedGRNs } = await supabaseAdmin
      .from('goods_receipts')
      .select('id')
      .eq('purchase_order_id', grn.purchase_order_id)
      .eq('status', 'COMPLETED')
      .neq('id', id);

    const completedGRNIds = (completedGRNs || []).map((g) => g.id);
    let prevAcceptedMap = {};

    if (completedGRNIds.length > 0) {
      const { data: existingGRNItems } = await supabaseAdmin
        .from('goods_receipt_items')
        .select('purchase_order_item_id, accepted_quantity')
        .in('goods_receipt_id', completedGRNIds);

      existingGRNItems?.forEach((gri) => {
        const itemKey = gri.purchase_order_item_id;
        prevAcceptedMap[itemKey] = (prevAcceptedMap[itemKey] || 0) + Number(gri.accepted_quantity || 0);
      });
    }

    // Verify over-receiving against concurrency state
    for (const item of grnItems) {
      const poItem = poItems.find((pi) => pi.id === item.purchase_order_item_id);
      if (poItem) {
        const orderedQty = Number(poItem.quantity) || 0;
        const prevAccepted = prevAcceptedMap[poItem.id] || 0;
        const currentAccepted = Number(item.accepted_quantity) || 0;
        const totalNewAccepted = Number((prevAccepted + currentAccepted).toFixed(2));

        if (totalNewAccepted > orderedQty) {
          return res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: `Completing this receipt would exceed ordered quantity for '${poItem.description}'. (Ordered: ${orderedQty}, Prev Accepted: ${prevAccepted}, Attempted: ${currentAccepted}).`,
          });
        }
      }
    }

    // Update GRN status to COMPLETED
    const { data: completedGRN, error: updateErr } = await supabaseAdmin
      .from('goods_receipts')
      .update({
        status: 'COMPLETED',
        updated_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to complete Goods Receipt.' });
    }

    // Recalculate total accepted quantities for ALL completed GRNs (including this one now)
    const { data: allCompletedGRNs } = await supabaseAdmin
      .from('goods_receipts')
      .select('id')
      .eq('purchase_order_id', grn.purchase_order_id)
      .eq('status', 'COMPLETED');

    const allCompletedGRNIds = (allCompletedGRNs || []).map((g) => g.id);
    let totalAcceptedByPOItem = {};

    if (allCompletedGRNIds.length > 0) {
      const { data: allGRNItems } = await supabaseAdmin
        .from('goods_receipt_items')
        .select('purchase_order_item_id, accepted_quantity')
        .in('goods_receipt_id', allCompletedGRNIds);

      allGRNItems?.forEach((gri) => {
        const itemKey = gri.purchase_order_item_id;
        totalAcceptedByPOItem[itemKey] = (totalAcceptedByPOItem[itemKey] || 0) + Number(gri.accepted_quantity || 0);
      });
    }

    // Update received_quantity on each PO item
    let allFullyReceived = true;
    let anyReceived = false;

    for (const poItem of (poItems || [])) {
      const newTotalReceived = Number((totalAcceptedByPOItem[poItem.id] || 0).toFixed(2));
      const orderedQty = Number(poItem.quantity) || 0;

      await supabaseAdmin
        .from('purchase_order_items')
        .update({ received_quantity: newTotalReceived, updated_at: new Date().toISOString() })
        .eq('id', poItem.id);

      if (newTotalReceived < orderedQty) {
        allFullyReceived = false;
      }
      if (newTotalReceived > 0) {
        anyReceived = true;
      }
    }

    // Transition Purchase Order status based on total receipts
    let newPOStatus = 'PARTIALLY_RECEIVED';
    if (allFullyReceived && (poItems || []).length > 0) {
      newPOStatus = 'RECEIVED';
    } else if (!anyReceived) {
      newPOStatus = 'APPROVED';
    }

    await supabaseAdmin
      .from('purchase_orders')
      .update({ status: newPOStatus, updated_at: new Date().toISOString() })
      .eq('id', grn.purchase_order_id);

    // AUTO-POST ACCEPTED GRN ITEMS TO INVENTORY LEDGER
    try {
      let warehouseId = grn.warehouse_id;
      if (!warehouseId) {
        const { data: defaultWh } = await supabaseAdmin
          .from('warehouses')
          .select('id')
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        warehouseId = defaultWh?.id;
      }

      if (warehouseId) {
        for (const item of (grnItems || [])) {
          const acceptedQty = Number(item.accepted_quantity || 0);
          if (acceptedQty > 0 && item.product_id) {
            // Idempotency check: verify if already posted
            const { data: existingTxn } = await supabaseAdmin
              .from('inventory_transactions')
              .select('id')
              .eq('reference_type', 'GRN')
              .eq('reference_id', grn.id)
              .eq('product_id', item.product_id)
              .eq('movement_type', 'RECEIPT')
              .maybeSingle();

            if (!existingTxn) {
              const { data: existingInv } = await supabaseAdmin
                .from('inventory')
                .select('*')
                .eq('product_id', item.product_id)
                .eq('warehouse_id', warehouseId)
                .is('location_id', null)
                .maybeSingle();

              const currentOnHand = Number(existingInv?.on_hand_quantity || 0);
              const newOnHand = currentOnHand + acceptedQty;

              if (existingInv) {
                await supabaseAdmin
                  .from('inventory')
                  .update({
                    on_hand_quantity: newOnHand,
                    available_quantity: Math.max(0, newOnHand - Number(existingInv.reserved_quantity || 0)),
                    status: 'in_stock',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', existingInv.id);
              } else {
                await supabaseAdmin
                  .from('inventory')
                  .insert({
                    product_id: item.product_id,
                    warehouse_id: warehouseId,
                    on_hand_quantity: newOnHand,
                    available_quantity: newOnHand,
                    status: 'in_stock',
                  });
              }

              await supabaseAdmin
                .from('inventory_transactions')
                .insert({
                  product_id: item.product_id,
                  warehouse_id: warehouseId,
                  movement_type: 'RECEIPT',
                  quantity: acceptedQty,
                  unit: item.unit || 'pcs',
                  reference_type: 'GRN',
                  reference_id: grn.id,
                  reason: 'GRN Receipt',
                  notes: `Auto-posted from GRN ${grn.grn_number}`,
                  performed_by: req.profile?.id || null,
                });
            }
          }
        }
      }
    } catch (invPostErr) {
      console.error('Error auto-posting GRN to inventory:', invPostErr);
    }

    // Audit logs
    await logGRNActivity(id, req.profile, 'COMPLETED', {
      message: `Completed Goods Receipt ${grn.grn_number}. Purchase Order updated to ${newPOStatus}. Inventory ledger updated.`,
    });

    try {
      await supabaseAdmin.from('purchase_order_activities').insert({
        purchase_order_id: grn.purchase_order_id,
        user_id: req.profile?.id || null,
        action: 'GOODS_RECEIVED',
        details: {
          grn_number: grn.grn_number,
          new_po_status: newPOStatus,
          actor_name: req.profile?.full_name || 'Warehouse Staff',
        },
      });
    } catch (e) {
      console.warn('Failed to log PO receiving activity:', e);
    }

    return res.status(200).json({
      success: true,
      data: completedGRN,
      message: `Goods Receipt ${grn.grn_number} marked as COMPLETED. Purchase Order status updated to ${newPOStatus}.`,
    });
  } catch (err) {
    console.error('GRN controller completeGoodsReceipt exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to complete Goods Receipt.' });
  }
}

/**
 * POST /api/goods-receipts/:id/cancel
 * Cancel a Goods Receipt note
 */
async function cancelGoodsReceipt(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: grn } = await supabaseAdmin.from('goods_receipts').select('*').eq('id', id).single();

    if (!grn) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Goods Receipt record not found.' });
    }

    if (grn.status.toUpperCase() === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Completed Goods Receipts cannot be cancelled without a controlled reversal process.',
      });
    }

    const { data: updatedGRN } = await supabaseAdmin
      .from('goods_receipts')
      .update({
        status: 'CANCELLED',
        notes: reason ? `[Cancellation Reason]: ${reason}\n${grn.notes || ''}` : grn.notes,
        updated_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    await logGRNActivity(id, req.profile, 'CANCELLED', { cancellation_reason: reason || 'Not specified' });

    return res.status(200).json({
      success: true,
      data: updatedGRN,
      message: `Goods Receipt ${grn.grn_number} has been cancelled.`,
    });
  } catch (err) {
    console.error('GRN controller cancelGoodsReceipt exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to cancel Goods Receipt.' });
  }
}

/**
 * GET /api/goods-receipts/:id/activities
 * Fetch activity logs for a Goods Receipt
 */
async function getGoodsReceiptActivities(req, res) {
  try {
    const { id } = req.params;

    const { data: activities, error } = await supabaseAdmin
      .from('goods_receipt_activities')
      .select('*')
      .eq('goods_receipt_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to fetch GRN activities.' });
    }

    return res.status(200).json({
      success: true,
      data: activities || [],
    });
  } catch (err) {
    console.error('GRN controller getGoodsReceiptActivities exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load GRN activities.' });
  }
}

module.exports = {
  getEligiblePurchaseOrders,
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  updateGoodsReceipt,
  completeGoodsReceipt,
  cancelGoodsReceipt,
  getGoodsReceiptActivities,
};
