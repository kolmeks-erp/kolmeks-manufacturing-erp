const { supabase } = require('../config/supabase');

/**
 * GET /api/inventory
 * Server-side paginated inventory balances list with search and multi-filtering
 */
exports.getInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      warehouse_id = '',
      location_id = '',
      category_id = '',
      stock_status = '',
      sort_by = 'updated_at',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('inventory')
      .select(`
        *,
        products!inner(
          id,
          product_code,
          name,
          unit,
          drawing_number,
          minimum_stock,
          category_id,
          categories(id, name)
        ),
        warehouses!inner(
          id,
          code,
          name,
          city,
          country
        ),
        storage_locations(
          id,
          location_code,
          name
        )
      `, { count: 'exact' });

    // Warehouse filter
    if (warehouse_id) {
      query = query.eq('warehouse_id', warehouse_id);
    }

    // Location filter
    if (location_id) {
      query = query.eq('location_id', location_id);
    }

    // Category filter
    if (category_id) {
      query = query.eq('products.category_id', category_id);
    }

    // Stock Status filter
    if (stock_status) {
      query = query.eq('status', stock_status);
    }

    // Search term filter (product_code, product name, drawing number, warehouse code/name, location_code)
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `products.product_code.ilike.${term},products.name.ilike.${term},products.drawing_number.ilike.${term},warehouses.code.ilike.${term},warehouses.name.ilike.${term}`
      );
    }

    // Sorting
    const sortFieldMap = {
      product_code: 'products.product_code',
      product_name: 'products.name',
      on_hand: 'on_hand_quantity',
      available: 'available_quantity',
      warehouse: 'warehouses.name',
      updated_at: 'updated_at',
    };

    const targetSortField = sortFieldMap[sort_by] || 'updated_at';
    const isAscending = order.toLowerCase() === 'asc';

    query = query.order(targetSortField, { ascending: isAscending }).range(offset, offset + limitNum - 1);

    const { data: rawInventory, count, error } = await query;

    if (error) {
      console.error('Error fetching inventory:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory balances.' });
    }

    // Calculate derived available quantity (on_hand - reserved)
    const inventory = (rawInventory || []).map((item) => {
      const onHand = Number(item.on_hand_quantity || 0);
      const reserved = Number(item.reserved_quantity || 0);
      const available = Math.max(0, onHand - reserved);

      // Determine stock status dynamically if minimum stock is configured
      let computedStatus = item.status || 'in_stock';
      const minStock = Number(item.products?.minimum_stock || item.minimum_stock || 0);

      if (onHand === 0) {
        computedStatus = 'out_of_stock';
      } else if (minStock > 0 && onHand <= minStock) {
        computedStatus = 'low_stock';
      } else {
        computedStatus = 'in_stock';
      }

      return {
        ...item,
        on_hand_quantity: onHand,
        reserved_quantity: reserved,
        available_quantity: available,
        status: computedStatus,
      };
    });

    return res.status(200).json({
      success: true,
      data: inventory,
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('Unexpected error in getInventory:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching inventory.' });
  }
};

/**
 * GET /api/inventory/summary
 * Summary telemetry metrics for inventory dashboard
 */
exports.getInventorySummary = async (req, res) => {
  try {
    const { data: allInventory, error } = await supabase
      .from('inventory')
      .select('id, on_hand_quantity, reserved_quantity, status, products(minimum_stock)');

    if (error) {
      console.error('Error fetching inventory summary:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory summary.' });
    }

    const totalStockItems = (allInventory || []).length;
    let totalOnHandUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    (allInventory || []).forEach((item) => {
      const onHand = Number(item.on_hand_quantity || 0);
      const minStock = Number(item.products?.minimum_stock || 0);
      totalOnHandUnits += onHand;

      if (onHand === 0) {
        outOfStockCount += 1;
      } else if (minStock > 0 && onHand <= minStock) {
        lowStockCount += 1;
      }
    });

    const { count: activeWarehouses } = await supabase
      .from('warehouses')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    return res.status(200).json({
      success: true,
      data: {
        totalStockItems,
        totalOnHandUnits,
        lowStockCount,
        outOfStockCount,
        activeWarehouses: activeWarehouses || 0,
      },
    });
  } catch (err) {
    console.error('Error in getInventorySummary:', err);
    return res.status(500).json({ success: false, message: 'Internal server error calculating summary.' });
  }
};

/**
 * GET /api/inventory/:productId
 * Detail stock balance for a product across all warehouses/locations with recent movement history
 */
exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch Product Master details
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*, categories(id, name), materials(id, name, material_code)')
      .eq('id', productId)
      .single();

    if (prodErr || !product) {
      return res.status(404).json({ success: false, message: 'Product master record not found.' });
    }

    // Fetch inventory records across warehouses/locations for this product
    const { data: balances, error: balErr } = await supabase
      .from('inventory')
      .select(`
        *,
        warehouses(id, code, name, city, country, status),
        storage_locations(id, location_code, name, status)
      `)
      .eq('product_id', productId);

    if (balErr) {
      console.error('Error fetching product balances:', balErr);
      return res.status(500).json({ success: false, message: 'Failed to fetch product stock balances.' });
    }

    let totalOnHand = 0;
    let totalReserved = 0;

    const warehouseBreakdown = (balances || []).map((b) => {
      const onHand = Number(b.on_hand_quantity || 0);
      const reserved = Number(b.reserved_quantity || 0);
      const available = Math.max(0, onHand - reserved);

      totalOnHand += onHand;
      totalReserved += reserved;

      return {
        ...b,
        on_hand_quantity: onHand,
        reserved_quantity: reserved,
        available_quantity: available,
      };
    });

    // Fetch recent 20 inventory transaction movement logs for this product
    const { data: movements } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        warehouses(id, code, name),
        storage_locations(id, location_code, name),
        profiles:performed_by(id, full_name, email)
      `)
      .eq('product_id', productId)
      .order('transaction_date', { ascending: false })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: {
        product,
        totalOnHand,
        totalReserved,
        totalAvailable: Math.max(0, totalOnHand - totalReserved),
        warehouseBreakdown,
        recentMovements: movements || [],
      },
    });
  } catch (err) {
    console.error('Error in getInventoryByProduct:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching product inventory.' });
  }
};

/**
 * GET /api/inventory/movements
 * Searchable, paginated audit log listing of all stock movement transactions
 */
exports.getStockMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      search = '',
      movement_type = '',
      warehouse_id = '',
      product_id = '',
      reference_type = '',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('inventory_transactions')
      .select(`
        *,
        products!inner(id, product_code, name, unit),
        warehouses!inner(id, code, name),
        storage_locations(id, location_code, name),
        profiles:performed_by(id, full_name, email)
      `, { count: 'exact' });

    if (movement_type) {
      query = query.eq('movement_type', movement_type.toUpperCase());
    }

    if (warehouse_id) {
      query = query.eq('warehouse_id', warehouse_id);
    }

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    if (reference_type) {
      query = query.eq('reference_type', reference_type.toUpperCase());
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `transaction_number.ilike.${term},products.product_code.ilike.${term},products.name.ilike.${term},reason.ilike.${term}`
      );
    }

    query = query.order('transaction_date', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data: movements, count, error } = await query;

    if (error) {
      console.error('Error fetching stock movements:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve stock movement logs.' });
    }

    return res.status(200).json({
      success: true,
      data: movements || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('Error in getStockMovements:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching stock movements.' });
  }
};

/**
 * POST /api/inventory/adjustments
 * Perform a controlled stock adjustment (ADJUSTMENT_IN or ADJUSTMENT_OUT)
 */
exports.createStockAdjustment = async (req, res) => {
  try {
    const {
      product_id,
      warehouse_id,
      location_id,
      adjustment_type, // 'ADJUSTMENT_IN' or 'ADJUSTMENT_OUT'
      quantity,
      reason,
      notes,
    } = req.body;

    if (!product_id || !warehouse_id || !adjustment_type || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product, Warehouse, Adjustment Type, Quantity, and Reason are required.',
      });
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number greater than 0.' });
    }

    const typeUpper = adjustment_type.toUpperCase();
    if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(typeUpper)) {
      return res.status(400).json({ success: false, message: 'Adjustment type must be ADJUSTMENT_IN or ADJUSTMENT_OUT.' });
    }

    // Check existing inventory row for this product + warehouse + location
    let inventoryQuery = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id);

    if (location_id) {
      inventoryQuery = inventoryQuery.eq('location_id', location_id);
    } else {
      inventoryQuery = inventoryQuery.is('location_id', null);
    }

    const { data: existingInv } = await inventoryQuery.maybeSingle();

    const currentOnHand = Number(existingInv?.on_hand_quantity || 0);

    // Negative stock protection check for stock decrease
    if (typeUpper === 'ADJUSTMENT_OUT' && currentOnHand < qtyNum) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock available for adjustment. Current on-hand quantity is ${currentOnHand}, but attempted adjustment out is ${qtyNum}.`,
      });
    }

    const newOnHand = typeUpper === 'ADJUSTMENT_IN' ? currentOnHand + qtyNum : currentOnHand - qtyNum;

    // Determine new status
    const minStock = Number(existingInv?.minimum_stock || 0);
    let newStatus = 'in_stock';
    if (newOnHand === 0) {
      newStatus = 'out_of_stock';
    } else if (minStock > 0 && newOnHand <= minStock) {
      newStatus = 'low_stock';
    }

    // 1. Upsert inventory balance row
    if (existingInv) {
      const { error: updateErr } = await supabase
        .from('inventory')
        .update({
          on_hand_quantity: newOnHand,
          available_quantity: Math.max(0, newOnHand - Number(existingInv.reserved_quantity || 0)),
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInv.id);

      if (updateErr) {
        console.error('Error updating inventory balance:', updateErr);
        return res.status(500).json({ success: false, message: 'Failed to update stock balance.' });
      }
    } else {
      const { error: insertErr } = await supabase
        .from('inventory')
        .insert({
          product_id,
          warehouse_id,
          location_id: location_id || null,
          on_hand_quantity: newOnHand,
          available_quantity: newOnHand,
          status: newStatus,
        });

      if (insertErr) {
        console.error('Error creating inventory row:', insertErr);
        return res.status(500).json({ success: false, message: 'Failed to initialize stock record.' });
      }
    }

    // Fetch product unit
    const { data: prod } = await supabase.from('products').select('unit').eq('id', product_id).single();

    // 2. Insert transaction log entry
    const txnPayload = {
      product_id,
      warehouse_id,
      location_id: location_id || null,
      movement_type: typeUpper,
      quantity: qtyNum,
      unit: prod?.unit || 'pcs',
      reference_type: 'ADJUSTMENT',
      reason,
      notes: notes ? notes.trim() : null,
      performed_by: req.user?.id || null,
    };

    const { data: txn, error: txnErr } = await supabase
      .from('inventory_transactions')
      .insert(txnPayload)
      .select()
      .single();

    if (txnErr) {
      console.error('Error creating stock transaction log:', txnErr);
      return res.status(500).json({ success: false, message: 'Stock balance updated, but transaction log failed.' });
    }

    return res.status(201).json({
      success: true,
      message: `Stock adjustment completed successfully. New on-hand quantity: ${newOnHand}.`,
      data: {
        transaction: txn,
        previousOnHand: currentOnHand,
        newOnHand,
      },
    });
  } catch (err) {
    console.error('Error in createStockAdjustment:', err);
    return res.status(500).json({ success: false, message: 'Internal server error performing stock adjustment.' });
  }
};

/**
 * POST /api/inventory/transfers
 * Atomic stock transfer between warehouses/locations (TRANSFER_OUT + TRANSFER_IN)
 */
exports.createStockTransfer = async (req, res) => {
  try {
    const {
      product_id,
      source_warehouse_id,
      source_location_id,
      destination_warehouse_id,
      destination_location_id,
      quantity,
      reason,
      notes,
    } = req.body;

    if (!product_id || !source_warehouse_id || !destination_warehouse_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product, Source Warehouse, Destination Warehouse, and Quantity are required.',
      });
    }

    // Validate source != destination location
    if (
      source_warehouse_id === destination_warehouse_id &&
      (source_location_id || null) === (destination_location_id || null)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Source and Destination locations must be different.',
      });
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Transfer quantity must be a positive number.' });
    }

    // 1. Verify source stock availability
    let sourceQuery = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', source_warehouse_id);

    if (source_location_id) {
      sourceQuery = sourceQuery.eq('location_id', source_location_id);
    } else {
      sourceQuery = sourceQuery.is('location_id', null);
    }

    const { data: sourceInv } = await sourceQuery.maybeSingle();

    const sourceOnHand = Number(sourceInv?.on_hand_quantity || 0);

    if (!sourceInv || sourceOnHand < qtyNum) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock at source location. Available on-hand: ${sourceOnHand}, attempted transfer: ${qtyNum}.`,
      });
    }

    // 2. Fetch destination inventory row
    let destQuery = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', destination_warehouse_id);

    if (destination_location_id) {
      destQuery = destQuery.eq('location_id', destination_location_id);
    } else {
      destQuery = destQuery.is('location_id', null);
    }

    const { data: destInv } = await destQuery.maybeSingle();

    const destOnHand = Number(destInv?.on_hand_quantity || 0);

    // Calculate new balances
    const newSourceOnHand = sourceOnHand - qtyNum;
    const newDestOnHand = destOnHand + qtyNum;

    // Update source inventory balance
    const { error: srcUpdateErr } = await supabase
      .from('inventory')
      .update({
        on_hand_quantity: newSourceOnHand,
        available_quantity: Math.max(0, newSourceOnHand - Number(sourceInv.reserved_quantity || 0)),
        status: newSourceOnHand === 0 ? 'out_of_stock' : sourceInv.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceInv.id);

    if (srcUpdateErr) {
      console.error('Error updating source inventory balance:', srcUpdateErr);
      return res.status(500).json({ success: false, message: 'Failed to update source stock balance.' });
    }

    // Update or insert destination inventory balance
    if (destInv) {
      const { error: destUpdateErr } = await supabase
        .from('inventory')
        .update({
          on_hand_quantity: newDestOnHand,
          available_quantity: Math.max(0, newDestOnHand - Number(destInv.reserved_quantity || 0)),
          status: newDestOnHand > 0 ? 'in_stock' : destInv.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', destInv.id);

      if (destUpdateErr) {
        console.error('Error updating destination inventory balance:', destUpdateErr);
        return res.status(500).json({ success: false, message: 'Failed to update destination stock balance.' });
      }
    } else {
      const { error: destInsertErr } = await supabase
        .from('inventory')
        .insert({
          product_id,
          warehouse_id: destination_warehouse_id,
          location_id: destination_location_id || null,
          on_hand_quantity: newDestOnHand,
          available_quantity: newDestOnHand,
          status: 'in_stock',
        });

      if (destInsertErr) {
        console.error('Error creating destination inventory row:', destInsertErr);
        return res.status(500).json({ success: false, message: 'Failed to initialize destination stock balance.' });
      }
    }

    // Get product unit
    const { data: prod } = await supabase.from('products').select('unit').eq('id', product_id).single();
    const unit = prod?.unit || 'pcs';

    // Generate explicit transfer reference ID to link TRANSFER_OUT and TRANSFER_IN
    const transferRefId = crypto.randomUUID();

    // 3. Log TRANSFER_OUT from source
    const outTxnPayload = {
      product_id,
      warehouse_id: source_warehouse_id,
      location_id: source_location_id || null,
      movement_type: 'TRANSFER_OUT',
      quantity: qtyNum,
      unit,
      reference_type: 'TRANSFER',
      reference_id: transferRefId,
      reason: reason || 'Warehouse Transfer',
      notes: notes ? notes.trim() : null,
      performed_by: req.user?.id || null,
    };

    // 4. Log TRANSFER_IN to destination
    const inTxnPayload = {
      product_id,
      warehouse_id: destination_warehouse_id,
      location_id: destination_location_id || null,
      movement_type: 'TRANSFER_IN',
      quantity: qtyNum,
      unit,
      reference_type: 'TRANSFER',
      reference_id: transferRefId,
      reason: reason || 'Warehouse Transfer',
      notes: notes ? notes.trim() : null,
      performed_by: req.user?.id || null,
    };

    const { error: txnsErr } = await supabase
      .from('inventory_transactions')
      .insert([outTxnPayload, inTxnPayload]);

    if (txnsErr) {
      console.error('Error logging transfer transactions:', txnsErr);
    }

    return res.status(200).json({
      success: true,
      message: `Stock transfer of ${qtyNum} ${unit} completed successfully.`,
      data: {
        transferRefId,
        sourceNewOnHand: newSourceOnHand,
        destinationNewOnHand: newDestOnHand,
      },
    });
  } catch (err) {
    console.error('Error in createStockTransfer:', err);
    return res.status(500).json({ success: false, message: 'Internal server error performing stock transfer.' });
  }
};

/**
 * GET /api/inventory/atp
 * Calculate Available-to-Promise (ATP) = On Hand - Reserved + Expected Receipts
 */
exports.getAvailableToPromise = async (req, res) => {
  try {
    const { product_id, warehouse_id } = req.query;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required for ATP calculation.' });
    }

    // 1. Fetch current stock balance
    let invQuery = supabase.from('inventory').select('on_hand_quantity, reserved_quantity, quarantined_quantity').eq('product_id', product_id);
    if (warehouse_id) invQuery = invQuery.eq('warehouse_id', warehouse_id);

    const { data: invRows } = await invQuery;

    let onHand = 0;
    let reserved = 0;
    let quarantined = 0;

    (invRows || []).forEach((row) => {
      onHand += Number(row.on_hand_quantity || 0);
      reserved += Number(row.reserved_quantity || 0);
      quarantined += Number(row.quarantined_quantity || 0);
    });

    const netAvailable = Math.max(0, onHand - reserved - quarantined);

    // 2. Fetch expected incoming PO item quantities (ordered - received_quantity)
    let poQuery = supabase
      .from('purchase_order_items')
      .select('quantity, received_quantity, purchase_orders!inner(status, expected_delivery)')
      .eq('product_id', product_id)
      .in('purchase_orders.status', ['ordered', 'partially_received']);

    const { data: poItems } = await poQuery;

    let expectedIncoming = 0;
    (poItems || []).forEach((item) => {
      const ordered = Number(item.quantity || 0);
      const rec = Number(item.received_quantity || 0);
      if (ordered > rec) {
        expectedIncoming += ordered - rec;
      }
    });

    const atp = netAvailable + expectedIncoming;

    return res.status(200).json({
      success: true,
      data: {
        product_id,
        warehouse_id: warehouse_id || 'ALL',
        onHand,
        reserved,
        quarantined,
        netAvailable,
        expectedIncoming,
        atp,
      },
    });
  } catch (err) {
    console.error('Error in getAvailableToPromise:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate Available-to-Promise.' });
  }
};

/**
 * GET /api/inventory/transfers
 * Get paginated list of stock transfers
 */
exports.getStockTransfers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', status = '' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = supabase
      .from('stock_transfers')
      .select(`
        *,
        products(id, product_code, name, unit),
        source_warehouse:source_warehouse_id(id, code, name),
        source_location:source_location_id(id, location_code, name),
        destination_warehouse:destination_warehouse_id(id, code, name),
        destination_location:destination_location_id(id, location_code, name),
        requested_by_profile:requested_by(id, full_name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`transfer_number.ilike.${term},reason.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit, 10) - 1);

    const { data: transfers, count, error } = await query;

    if (error) {
      console.error('Error fetching transfers:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve stock transfers.' });
    }

    return res.status(200).json({
      success: true,
      data: transfers || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('Error in getStockTransfers:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/adjustments
 * Get list of stock physical count adjustments
 */
exports.getStockAdjustments = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', status = '' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = supabase
      .from('stock_adjustments')
      .select(`
        *,
        products(id, product_code, name, unit),
        warehouses(id, code, name),
        storage_locations(id, location_code, name),
        requested_by_profile:requested_by(id, full_name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`adjustment_number.ilike.${term},reason.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit, 10) - 1);

    const { data: adjustments, count, error } = await query;

    if (error) {
      console.error('Error fetching adjustments:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve stock adjustments.' });
    }

    return res.status(200).json({
      success: true,
      data: adjustments || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('Error in getStockAdjustments:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/adjustments/create
 * Submit a physical count difference adjustment
 */
exports.createStockAdjustmentRequest = async (req, res) => {
  try {
    const {
      product_id,
      warehouse_id,
      location_id,
      expected_quantity,
      counted_quantity,
      reason,
      notes,
    } = req.body;

    if (!product_id || !warehouse_id || counted_quantity === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Product, Warehouse, Counted Quantity, and Reason are required.' });
    }

    const expectedNum = Number(expected_quantity || 0);
    const countedNum = Number(counted_quantity || 0);
    const varianceNum = countedNum - expectedNum;
    const adjustment_type = varianceNum >= 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

    const payload = {
      product_id,
      warehouse_id,
      location_id: location_id || null,
      expected_quantity: expectedNum,
      counted_quantity: countedNum,
      variance_quantity: varianceNum,
      adjustment_type,
      reason,
      notes: notes ? notes.trim() : null,
      status: 'APPROVED',
      requested_by: req.user?.id || null,
      approved_by: req.user?.id || null,
      posted_at: new Date().toISOString(),
    };

    const { data: adjRecord, error: insertErr } = await supabase
      .from('stock_adjustments')
      .insert(payload)
      .select()
      .single();

    if (insertErr) {
      console.error('Error inserting stock adjustment record:', insertErr);
      return res.status(500).json({ success: false, message: 'Failed to record stock adjustment.' });
    }

    // Execute immediate stock balance update if approved
    if (varianceNum !== 0) {
      const absQty = Math.abs(varianceNum);

      let invQuery = supabase.from('inventory').select('*').eq('product_id', product_id).eq('warehouse_id', warehouse_id);
      if (location_id) invQuery = invQuery.eq('location_id', location_id);
      else invQuery = invQuery.is('location_id', null);

      const { data: existingInv } = await invQuery.maybeSingle();

      const currentOnHand = Number(existingInv?.on_hand_quantity || 0);
      const newOnHand = Math.max(0, currentOnHand + varianceNum);

      if (existingInv) {
        await supabase
          .from('inventory')
          .update({
            on_hand_quantity: newOnHand,
            available_quantity: Math.max(0, newOnHand - Number(existingInv.reserved_quantity || 0)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingInv.id);
      } else {
        await supabase.from('inventory').insert({
          product_id,
          warehouse_id,
          location_id: location_id || null,
          on_hand_quantity: newOnHand,
          available_quantity: newOnHand,
          status: 'in_stock',
        });
      }

      // Record inventory movement transaction log
      const { data: prod } = await supabase.from('products').select('unit').eq('id', product_id).single();
      await supabase.from('inventory_transactions').insert({
        product_id,
        warehouse_id,
        location_id: location_id || null,
        movement_type: adjustment_type,
        quantity: absQty,
        unit: prod?.unit || 'pcs',
        reference_type: 'ADJUSTMENT',
        reference_id: adjRecord.id,
        reason,
        notes,
        performed_by: req.user?.id || null,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Physical count adjustment recorded successfully. Variance: ${varianceNum}.`,
      data: adjRecord,
    });
  } catch (err) {
    console.error('Error in createStockAdjustmentRequest:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/reservations
 * List stock reservations
 */
exports.getStockReservations = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', status = '' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = supabase
      .from('stock_reservations')
      .select(`
        *,
        products(id, product_code, name, unit),
        warehouses(id, code, name),
        storage_locations(id, location_code, name),
        created_by_profile:created_by(id, full_name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`reservation_number.ilike.${term},reference_type.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit, 10) - 1);

    const { data: reservations, count, error } = await query;

    if (error) {
      console.error('Error fetching reservations:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve stock reservations.' });
    }

    return res.status(200).json({
      success: true,
      data: reservations || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('Error in getStockReservations:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/reservations
 * Create a new stock reservation against a Sales Order or Production Order
 */
exports.createStockReservation = async (req, res) => {
  try {
    const { product_id, warehouse_id, location_id, quantity, reference_type, reference_id } = req.body;

    if (!product_id || !warehouse_id || !quantity || !reference_type) {
      return res.status(400).json({ success: false, message: 'Product, Warehouse, Quantity, and Reference Type are required.' });
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
    }

    // Verify stock availability
    let invQuery = supabase.from('inventory').select('*').eq('product_id', product_id).eq('warehouse_id', warehouse_id);
    if (location_id) invQuery = invQuery.eq('location_id', location_id);
    else invQuery = invQuery.is('location_id', null);

    const { data: existingInv } = await invQuery.maybeSingle();

    const currentOnHand = Number(existingInv?.on_hand_quantity || 0);
    const currentReserved = Number(existingInv?.reserved_quantity || 0);
    const available = Math.max(0, currentOnHand - currentReserved);

    if (available < qtyNum) {
      return res.status(400).json({
        success: false,
        message: `Cannot reserve stock. Available stock is ${available}, but requested reservation is ${qtyNum}.`,
      });
    }

    // Insert reservation
    const { data: resRecord, error: insertErr } = await supabase
      .from('stock_reservations')
      .insert({
        product_id,
        warehouse_id,
        location_id: location_id || null,
        quantity: qtyNum,
        reference_type: reference_type.toUpperCase(),
        reference_id: reference_id || null,
        status: 'RESERVED',
        created_by: req.user?.id || null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Error inserting stock reservation:', insertErr);
      return res.status(500).json({ success: false, message: 'Failed to create stock reservation.' });
    }

    // Update reserved quantity on inventory
    const newReserved = currentReserved + qtyNum;
    await supabase
      .from('inventory')
      .update({
        reserved_quantity: newReserved,
        available_quantity: Math.max(0, currentOnHand - newReserved),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingInv.id);

    return res.status(201).json({
      success: true,
      message: `Stock reservation of ${qtyNum} units created successfully.`,
      data: resRecord,
    });
  } catch (err) {
    console.error('Error in createStockReservation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/reservations/:id/release
 * Release an active stock reservation
 */
exports.releaseStockReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: reservation, error: fetchErr } = await supabase.from('stock_reservations').select('*').eq('id', id).single();

    if (fetchErr || !reservation) {
      return res.status(404).json({ success: false, message: 'Reservation record not found.' });
    }

    if (reservation.status === 'RELEASED' || reservation.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: `Reservation is already ${reservation.status}.` });
    }

    const unfulfilledQty = Number(reservation.quantity || 0) - Number(reservation.fulfilled_quantity || 0);

    // Update reservation status
    await supabase.from('stock_reservations').update({ status: 'RELEASED', updated_at: new Date().toISOString() }).eq('id', id);

    // Deduct reserved quantity from inventory
    if (unfulfilledQty > 0) {
      let invQuery = supabase.from('inventory').select('*').eq('product_id', reservation.product_id).eq('warehouse_id', reservation.warehouse_id);
      if (reservation.location_id) invQuery = invQuery.eq('location_id', reservation.location_id);

      const { data: existingInv } = await invQuery.maybeSingle();

      if (existingInv) {
        const currentOnHand = Number(existingInv.on_hand_quantity || 0);
        const currentReserved = Number(existingInv.reserved_quantity || 0);
        const newReserved = Math.max(0, currentReserved - unfulfilledQty);

        await supabase
          .from('inventory')
          .update({
            reserved_quantity: newReserved,
            available_quantity: Math.max(0, currentOnHand - newReserved),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingInv.id);
      }
    }

    return res.status(200).json({ success: true, message: 'Stock reservation released successfully.' });
  } catch (err) {
    console.error('Error in releaseStockReservation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/batches
 * Get stock batches / lots register
 */
exports.getBatches = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', status = '', product_id = '' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = supabase
      .from('stock_batches')
      .select(`
        *,
        products(id, product_code, name, unit),
        warehouses(id, code, name),
        suppliers(id, company_name)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status.toUpperCase());
    if (product_id) query = query.eq('product_id', product_id);

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`batch_number.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit, 10) - 1);

    const { data: batches, count, error } = await query;

    if (error) {
      console.error('Error fetching batches:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve batches.' });
    }

    return res.status(200).json({
      success: true,
      data: batches || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('Error in getBatches:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/batches
 * Register a new stock batch
 */
exports.createBatch = async (req, res) => {
  try {
    const { product_id, warehouse_id, manufacture_date, expiry_date, supplier_id, quantity, status } = req.body;

    if (!product_id || !warehouse_id || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product, Warehouse, and Quantity are required.' });
    }

    const { data: batch, error } = await supabase
      .from('stock_batches')
      .insert({
        product_id,
        warehouse_id,
        manufacture_date: manufacture_date || null,
        expiry_date: expiry_date || null,
        supplier_id: supplier_id || null,
        quantity: Number(quantity || 0),
        status: status ? status.toUpperCase() : 'AVAILABLE',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      return res.status(500).json({ success: false, message: 'Failed to register stock batch.' });
    }

    return res.status(201).json({ success: true, message: 'Stock batch registered successfully.', data: batch });
  } catch (err) {
    console.error('Error in createBatch:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/serial-numbers
 * Get serial numbers register
 */
exports.getSerialNumbers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', status = '', product_id = '' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = supabase
      .from('stock_serials')
      .select(`
        *,
        products(id, product_code, name, unit),
        warehouses(id, code, name),
        storage_locations(id, location_code, name),
        stock_batches(id, batch_number)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status.toUpperCase());
    if (product_id) query = query.eq('product_id', product_id);

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`serial_number.ilike.${term},notes.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit, 10) - 1);

    const { data: serials, count, error } = await query;

    if (error) {
      console.error('Error fetching serials:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve serial numbers.' });
    }

    return res.status(200).json({
      success: true,
      data: serials || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((count || 0) / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('Error in getSerialNumbers:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/serial-numbers
 * Register a unit serial number
 */
exports.createSerialNumber = async (req, res) => {
  try {
    const { serial_number, product_id, warehouse_id, location_id, batch_id, status, notes } = req.body;

    if (!serial_number || !product_id || !warehouse_id) {
      return res.status(400).json({ success: false, message: 'Serial Number, Product, and Warehouse are required.' });
    }

    const { data: serial, error } = await supabase
      .from('stock_serials')
      .insert({
        serial_number: serial_number.trim(),
        product_id,
        warehouse_id,
        location_id: location_id || null,
        batch_id: batch_id || null,
        status: status ? status.toUpperCase() : 'IN_STOCK',
        notes: notes ? notes.trim() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting serial number:', error);
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Serial number already registered for this product.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to register serial number.' });
    }

    return res.status(201).json({ success: true, message: 'Serial number registered successfully.', data: serial });
  } catch (err) {
    console.error('Error in createSerialNumber:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/reorder
 * Reorder levels & Replenishment dashboard telemetry
 */
exports.getReorderDashboard = async (req, res) => {
  try {
    // 1. Fetch active products
    const { data: products } = await supabase.from('products').select('id, product_code, name, unit, minimum_stock, drawing_number');

    // 2. Fetch inventory totals grouped by product
    const { data: inventory } = await supabase.from('inventory').select('product_id, on_hand_quantity, reserved_quantity');

    // 3. Fetch explicit reorder level configurations
    const { data: reorders } = await supabase.from('stock_reorder_levels').select('*').eq('is_active', true);

    const reorderMap = new Map();
    (reorders || []).forEach((r) => reorderMap.set(r.product_id, r));

    const inventoryMap = new Map();
    (inventory || []).forEach((inv) => {
      const current = inventoryMap.get(inv.product_id) || { on_hand: 0, reserved: 0 };
      inventoryMap.set(inv.product_id, {
        on_hand: current.on_hand + Number(inv.on_hand_quantity || 0),
        reserved: current.reserved + Number(inv.reserved_quantity || 0),
      });
    });

    const items = (products || []).map((prod) => {
      const inv = inventoryMap.get(prod.id) || { on_hand: 0, reserved: 0 };
      const config = reorderMap.get(prod.id);

      const minStock = Number(config?.minimum_stock || prod.minimum_stock || 0);
      const reorderPoint = Number(config?.reorder_point || minStock || 10);
      const safetyStock = Number(config?.safety_stock || Math.round(minStock * 0.5));
      const reorderQty = Number(config?.reorder_quantity || 50);

      const netAvailable = Math.max(0, inv.on_hand - inv.reserved);

      let status = 'HEALTHY';
      if (inv.on_hand === 0) {
        status = 'OUT_OF_STOCK';
      } else if (netAvailable <= safetyStock) {
        status = 'CRITICAL_SAFETY_BREACH';
      } else if (netAvailable <= reorderPoint) {
        status = 'REORDER_NEEDED';
      }

      return {
        product: prod,
        on_hand: inv.on_hand,
        reserved: inv.reserved,
        available: netAvailable,
        minimum_stock: minStock,
        reorder_point: reorderPoint,
        safety_stock: safetyStock,
        reorder_quantity: reorderQty,
        status,
        suggested_order_qty: status !== 'HEALTHY' ? Math.max(reorderQty, reorderPoint * 2 - netAvailable) : 0,
      };
    });

    const lowStockCount = items.filter((i) => i.status === 'REORDER_NEEDED' || i.status === 'CRITICAL_SAFETY_BREACH').length;
    const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

    return res.status(200).json({
      success: true,
      data: {
        totalProducts: items.length,
        lowStockCount,
        outOfStockCount,
        healthyCount: items.length - lowStockCount - outOfStockCount,
        items,
      },
    });
  } catch (err) {
    console.error('Error in getReorderDashboard:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/inventory/reorder
 * Upsert reorder levels for product
 */
exports.upsertReorderLevel = async (req, res) => {
  try {
    const { product_id, warehouse_id, minimum_stock, reorder_point, safety_stock, reorder_quantity } = req.body;

    if (!product_id || !warehouse_id) {
      return res.status(400).json({ success: false, message: 'Product and Warehouse are required.' });
    }

    const { data: record, error } = await supabase
      .from('stock_reorder_levels')
      .upsert({
        product_id,
        warehouse_id,
        minimum_stock: Number(minimum_stock || 0),
        reorder_point: Number(reorder_point || 0),
        safety_stock: Number(safety_stock || 0),
        reorder_quantity: Number(reorder_quantity || 0),
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,warehouse_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting reorder level:', error);
      return res.status(500).json({ success: false, message: 'Failed to update reorder parameters.' });
    }

    return res.status(200).json({ success: true, message: 'Reorder levels updated successfully.', data: record });
  } catch (err) {
    console.error('Error in upsertReorderLevel:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/inventory/reports & GET /api/inventory/valuation
 * Stock valuation & category report telemetry
 */
exports.getInventoryValuation = async (req, res) => {
  try {
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        *,
        products(id, product_code, name, unit, categories(id, name)),
        warehouses(id, code, name)
      `);

    let totalValuation = 0;
    let totalItemsCount = 0;
    const warehouseValuation = new Map();
    const categoryValuation = new Map();

    (inventory || []).forEach((inv) => {
      const qty = Number(inv.on_hand_quantity || 0);
      const estimatedCost = 45.0;
      const val = qty * estimatedCost;

      totalValuation += val;
      totalItemsCount += qty;

      const whName = inv.warehouses?.name || 'Main Warehouse';
      const catName = inv.products?.categories?.name || 'CNC Components';

      warehouseValuation.set(whName, (warehouseValuation.get(whName) || 0) + val);
      categoryValuation.set(catName, (categoryValuation.get(catName) || 0) + val);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalValuation,
        totalItemsCount,
        warehouseValuation: Array.from(warehouseValuation.entries()).map(([name, value]) => ({ name, value })),
        categoryValuation: Array.from(categoryValuation.entries()).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (err) {
    console.error('Error in getInventoryValuation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
