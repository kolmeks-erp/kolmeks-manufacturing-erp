const supabase = require('../config/supabase');

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
