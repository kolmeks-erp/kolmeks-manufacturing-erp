const { supabase } = require('../config/supabase');

/**
 * GET /api/warehouses
 * List all warehouses with search, status filtering, and item/location counts
 */
exports.getWarehouses = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = supabase
      .from('warehouses')
      .select('*, storage_locations(id, status), inventory(id, on_hand_quantity)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status.toLowerCase());
    }

    if (search) {
      const term = `%${search.trim()}%`;
      query = query.or(`code.ilike.${term},name.ilike.${term},city.ilike.${term},country.ilike.${term}`);
    }

    const { data: rawWarehouses, error } = await query;

    if (error) {
      console.error('Error fetching warehouses:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve warehouses.' });
    }

    // Transform raw warehouses to include counts
    const warehouses = (rawWarehouses || []).map((wh) => {
      const location_count = Array.isArray(wh.storage_locations) ? wh.storage_locations.length : 0;
      const stock_item_count = Array.isArray(wh.inventory)
        ? wh.inventory.filter((item) => Number(item.on_hand_quantity) > 0).length
        : 0;

      // Omit heavy arrays from listing payload
      const { storage_locations, inventory, ...warehouseData } = wh;

      return {
        ...warehouseData,
        location_count,
        stock_item_count,
      };
    });

    return res.status(200).json({
      success: true,
      data: warehouses,
      count: warehouses.length,
    });
  } catch (err) {
    console.error('Unexpected error in getWarehouses:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while fetching warehouses.' });
  }
};

/**
 * GET /api/warehouses/:id
 * Retrieve warehouse detail along with locations and stock inventory balance
 */
exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: warehouse, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        storage_locations(*),
        inventory(
          id,
          product_id,
          on_hand_quantity,
          available_quantity,
          reserved_quantity,
          status,
          updated_at,
          products(id, product_code, name, unit, category_id, categories(name))
        )
      `)
      .eq('id', id)
      .single();

    if (error || !warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    // Sort locations by code
    if (warehouse.storage_locations) {
      warehouse.storage_locations.sort((a, b) => a.location_code.localeCompare(b.location_code));
    }

    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (err) {
    console.error('Unexpected error in getWarehouseById:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching warehouse.' });
  }
};

/**
 * POST /api/warehouses
 * Create a new warehouse record
 */
exports.createWarehouse = async (req, res) => {
  try {
    const { code, name, description, address, city, state, country, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse code and name are required.',
      });
    }

    const formattedCode = code.trim().toUpperCase();

    // Check code uniqueness
    const { data: existing } = await supabase
      .from('warehouses')
      .select('id')
      .eq('code', formattedCode)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Warehouse code '${formattedCode}' already exists.`,
      });
    }

    const payload = {
      code: formattedCode,
      name: name.trim(),
      description: description ? description.trim() : null,
      address: address ? address.trim() : null,
      city: city ? city.trim() : null,
      state: state ? state.trim() : null,
      country: country ? country.trim() : 'Finland',
      status: status === 'inactive' ? 'inactive' : 'active',
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    };

    const { data: created, error: createError } = await supabase
      .from('warehouses')
      .insert(payload)
      .select()
      .single();

    if (createError) {
      console.error('Error creating warehouse:', createError);
      return res.status(500).json({ success: false, message: 'Failed to create warehouse.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Warehouse created successfully.',
      data: created,
    });
  } catch (err) {
    console.error('Unexpected error in createWarehouse:', err);
    return res.status(500).json({ success: false, message: 'Internal server error creating warehouse.' });
  }
};

/**
 * PATCH /api/warehouses/:id
 * Update warehouse information
 */
exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, address, city, state, country, status } = req.body;

    const { data: existing } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Warehouse not found.' });
    }

    // Code uniqueness check if changed
    if (code && code.trim().toUpperCase() !== existing.code) {
      const formattedCode = code.trim().toUpperCase();
      const { data: codeCheck } = await supabase
        .from('warehouses')
        .select('id')
        .eq('code', formattedCode)
        .neq('id', id)
        .maybeSingle();

      if (codeCheck) {
        return res.status(400).json({
          success: false,
          message: `Warehouse code '${formattedCode}' is already taken by another warehouse.`,
        });
      }
    }

    const payload = {
      ...(code && { code: code.trim().toUpperCase() }),
      ...(name && { name: name.trim() }),
      description: description !== undefined ? (description ? description.trim() : null) : existing.description,
      address: address !== undefined ? (address ? address.trim() : null) : existing.address,
      city: city !== undefined ? (city ? city.trim() : null) : existing.city,
      state: state !== undefined ? (state ? state.trim() : null) : existing.state,
      country: country !== undefined ? (country ? country.trim() : 'Finland') : existing.country,
      ...(status && { status: status === 'inactive' ? 'inactive' : 'active' }),
      updated_by: req.user?.id || null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabase
      .from('warehouses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating warehouse:', updateErr);
      return res.status(500).json({ success: false, message: 'Failed to update warehouse.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('Unexpected error in updateWarehouse:', err);
    return res.status(500).json({ success: false, message: 'Internal server error updating warehouse.' });
  }
};

/**
 * PATCH /api/warehouses/:id/status
 * Deactivate/activate warehouse safely (prevents deactivating if stock exists)
 */
exports.toggleWarehouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or inactive.' });
    }

    if (status === 'inactive') {
      // Check if active stock on hand exists in warehouse
      const { data: stockItems } = await supabase
        .from('inventory')
        .select('id, on_hand_quantity')
        .eq('warehouse_id', id)
        .gt('on_hand_quantity', 0);

      if (stockItems && stockItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate warehouse because it currently holds ${stockItems.length} active inventory stock items. Please transfer or adjust stock out first.`,
        });
      }
    }

    const { data: updated, error } = await supabase
      .from('warehouses')
      .update({
        status,
        updated_by: req.user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update warehouse status.' });
    }

    return res.status(200).json({
      success: true,
      message: `Warehouse status changed to ${status}.`,
      data: updated,
    });
  } catch (err) {
    console.error('Error in toggleWarehouseStatus:', err);
    return res.status(500).json({ success: false, message: 'Internal server error changing warehouse status.' });
  }
};

/**
 * GET /api/warehouses/:id/locations
 * List storage locations for a warehouse
 */
exports.getWarehouseLocations = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: locations, error } = await supabase
      .from('storage_locations')
      .select('*')
      .eq('warehouse_id', id)
      .order('location_code', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve storage locations.' });
    }

    return res.status(200).json({
      success: true,
      data: locations || [],
    });
  } catch (err) {
    console.error('Error in getWarehouseLocations:', err);
    return res.status(500).json({ success: false, message: 'Internal server error fetching locations.' });
  }
};

/**
 * POST /api/warehouses/:id/locations
 * Add storage location to warehouse
 */
exports.createWarehouseLocation = async (req, res) => {
  try {
    const { id: warehouse_id } = req.params;
    const { location_code, name, description, status } = req.body;

    if (!location_code || !name) {
      return res.status(400).json({ success: false, message: 'Location code and name are required.' });
    }

    const formattedCode = location_code.trim().toUpperCase();

    // Unique location_code per warehouse check
    const { data: existing } = await supabase
      .from('storage_locations')
      .select('id')
      .eq('warehouse_id', warehouse_id)
      .eq('location_code', formattedCode)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Location code '${formattedCode}' already exists in this warehouse.`,
      });
    }

    const payload = {
      warehouse_id,
      location_code: formattedCode,
      name: name.trim(),
      description: description ? description.trim() : null,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    const { data: created, error } = await supabase
      .from('storage_locations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating storage location:', error);
      return res.status(500).json({ success: false, message: 'Failed to create storage location.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Storage location created successfully.',
      data: created,
    });
  } catch (err) {
    console.error('Error in createWarehouseLocation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error creating location.' });
  }
};

/**
 * PATCH /api/warehouses/:id/locations/:locationId
 * Update storage location
 */
exports.updateWarehouseLocation = async (req, res) => {
  try {
    const { id: warehouse_id, locationId } = req.params;
    const { location_code, name, description, status } = req.body;

    const { data: existing } = await supabase
      .from('storage_locations')
      .select('*')
      .eq('id', locationId)
      .eq('warehouse_id', warehouse_id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Storage location not found.' });
    }

    if (status === 'inactive' && existing.status !== 'inactive') {
      // Check stock presence at this location
      const { data: stockItems } = await supabase
        .from('inventory')
        .select('id, on_hand_quantity')
        .eq('location_id', locationId)
        .gt('on_hand_quantity', 0);

      if (stockItems && stockItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate storage location because it currently holds ${stockItems.length} stock items.`,
        });
      }
    }

    const payload = {
      ...(location_code && { location_code: location_code.trim().toUpperCase() }),
      ...(name && { name: name.trim() }),
      description: description !== undefined ? (description ? description.trim() : null) : existing.description,
      ...(status && { status: status === 'inactive' ? 'inactive' : 'active' }),
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from('storage_locations')
      .update(payload)
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ success: false, message: 'Failed to update storage location.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Storage location updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('Error in updateWarehouseLocation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error updating location.' });
  }
};
