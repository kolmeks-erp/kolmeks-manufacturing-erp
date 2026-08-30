const { supabase } = require('../config/supabase');

/**
 * Helper: Generate unique format code (e.g., AST-CNC-001, PM-2026-000001, MWO-2026-000001, MR-2026-000001)
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
 * Helper: Calculate next due date for maintenance schedule
 */
const calculateNextDueDate = (fromDate, frequencyType, frequencyValue) => {
  const base = fromDate ? new Date(fromDate) : new Date();
  const val = parseInt(frequencyValue, 10) || 30;

  switch (frequencyType) {
    case 'DAILY':
      base.setDate(base.getDate() + 1);
      break;
    case 'WEEKLY':
      base.setDate(base.getDate() + 7);
      break;
    case 'MONTHLY':
      base.setMonth(base.getMonth() + 1);
      break;
    case 'QUARTERLY':
      base.setMonth(base.getMonth() + 3);
      break;
    case 'YEARLY':
      base.setFullYear(base.getFullYear() + 1);
      break;
    case 'CUSTOM_DAYS':
    default:
      base.setDate(base.getDate() + val);
      break;
  }

  return base.toISOString().split('T')[0];
};

/**
 * 1. DASHBOARD TELEMETRY KPIS
 */
const getDashboardKPIs = async (req, res) => {
  try {
    const { data: assets } = await supabase.from('assets').select('status, criticality');
    const { data: workOrders } = await supabase.from('maintenance_work_orders').select('status, priority');
    const { data: schedules } = await supabase.from('maintenance_schedules').select('status, next_due_date');
    const { data: requests } = await supabase.from('maintenance_requests').select('status');
    const { data: downtimes } = await supabase.from('downtime_logs').select('status, duration_minutes');

    const totalAssets = assets?.length || 0;
    const assetsUnderMaintenance = assets?.filter(a => a.status === 'UNDER_MAINTENANCE')?.length || 0;
    const breakdownAssets = assets?.filter(a => a.status === 'BREAKDOWN')?.length || 0;

    const totalWorkOrders = workOrders?.length || 0;
    const openWorkOrders = workOrders?.filter(w => w.status === 'OPEN' || w.status === 'ASSIGNED' || w.status === 'IN_PROGRESS')?.length || 0;
    const completedWorkOrders = workOrders?.filter(w => w.status === 'COMPLETED')?.length || 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const overduePMs = schedules?.filter(s => s.status === 'ACTIVE' && s.next_due_date && s.next_due_date < todayStr)?.length || 0;
    const upcomingPMs = schedules?.filter(s => s.status === 'ACTIVE' && s.next_due_date && s.next_due_date >= todayStr)?.length || 0;

    const openRequests = requests?.filter(r => r.status === 'OPEN' || r.status === 'REVIEWED')?.length || 0;

    let activeDowntimeMinutes = 0;
    if (downtimes && downtimes.length > 0) {
      downtimes.forEach(d => {
        if (d.duration_minutes) {
          activeDowntimeMinutes += parseFloat(d.duration_minutes);
        }
      });
    }

    return res.json({
      success: true,
      data: {
        totalAssets,
        assetsUnderMaintenance,
        breakdownAssets,
        totalWorkOrders,
        openWorkOrders,
        completedWorkOrders,
        overduePMs,
        upcomingPMs,
        openRequests,
        activeDowntimeMinutes: Math.round(activeDowntimeMinutes)
      }
    });
  } catch (error) {
    console.error('getDashboardKPIs Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate maintenance KPIs', error: error.message });
  }
};

/**
 * 2. ASSETS MANAGEMENT
 */
const getAssets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', type, status, criticality, workCenterId } = req.query;

    const from = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const to = from + parseInt(limit, 10) - 1;

    let query = supabase
      .from('assets')
      .select(`
        *,
        machines (id, code, name),
        work_centers (id, code, name)
      `, { count: 'exact' });

    if (type) query = query.eq('asset_type', type);
    if (status) query = query.eq('status', status);
    if (criticality) query = query.eq('criticality', criticality);
    if (workCenterId) query = query.eq('work_center_id', workCenterId);

    if (search) {
      query = query.or(`asset_code.ilike.%${search}%,name.ilike.%${search}%,serial_number.ilike.%${search}%,manufacturer.ilike.%${search}%`);
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
    console.error('getAssets Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assets', error: error.message });
  }
};

const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: asset, error } = await supabase
      .from('assets')
      .select(`
        *,
        machines (*),
        work_centers (*)
      `)
      .eq('id', id)
      .single();

    if (error || !asset) {
      return res.status(404).json({ success: false, message: 'Asset record not found' });
    }

    // Fetch related schedules
    const { data: schedules } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('asset_id', id)
      .order('next_due_date', { ascending: true });

    // Fetch active/recent work orders
    const { data: workOrders } = await supabase
      .from('maintenance_work_orders')
      .select(`
        *,
        assigned_profile:profiles!assigned_to (id, full_name, email)
      `)
      .eq('asset_id', id)
      .order('created_at', { ascending: false });

    // Fetch downtime logs
    const { data: downtimes } = await supabase
      .from('downtime_logs')
      .select('*')
      .eq('asset_id', id)
      .order('start_time', { ascending: false });

    // Fetch timeline activities
    const { data: activities } = await supabase
      .from('maintenance_activities')
      .select('*')
      .eq('asset_id', id)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...asset,
        schedules: schedules || [],
        workOrders: workOrders || [],
        downtimes: downtimes || [],
        activities: activities || []
      }
    });
  } catch (error) {
    console.error('getAssetById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch asset details', error: error.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const {
      asset_code,
      name,
      asset_type = 'CNC_MACHINE',
      machine_id,
      work_center_id,
      manufacturer,
      model,
      serial_number,
      purchase_date,
      installation_date,
      location,
      status = 'AVAILABLE',
      criticality = 'MEDIUM',
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Asset Name is required' });
    }

    let code = asset_code;
    if (!code) {
      code = await generateSequenceNumber('assets', 'asset_code', 'AST');
    }

    const newAsset = {
      asset_code: code,
      name,
      asset_type,
      machine_id: machine_id || null,
      work_center_id: work_center_id || null,
      manufacturer: manufacturer || null,
      model: model || null,
      serial_number: serial_number || null,
      purchase_date: purchase_date || null,
      installation_date: installation_date || null,
      location: location || null,
      status,
      criticality,
      description: description || null,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null
    };

    const { data, error } = await supabase
      .from('assets')
      .insert([newAsset])
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      asset_id: data.id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'System User',
      activity_type: 'CREATED',
      description: `Asset ${code} (${name}) registered`
    }]);

    return res.status(201).json({ success: true, data, message: 'Asset created successfully' });
  } catch (error) {
    console.error('createAsset Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create asset', error: error.message });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, asset_type, machine_id, work_center_id, manufacturer, model, serial_number, location, status, criticality, description } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id || null
    };

    if (name !== undefined) updatePayload.name = name;
    if (asset_type !== undefined) updatePayload.asset_type = asset_type;
    if (machine_id !== undefined) updatePayload.machine_id = machine_id || null;
    if (work_center_id !== undefined) updatePayload.work_center_id = work_center_id || null;
    if (manufacturer !== undefined) updatePayload.manufacturer = manufacturer;
    if (model !== undefined) updatePayload.model = model;
    if (serial_number !== undefined) updatePayload.serial_number = serial_number;
    if (location !== undefined) updatePayload.location = location;
    if (status !== undefined) updatePayload.status = status;
    if (criticality !== undefined) updatePayload.criticality = criticality;
    if (description !== undefined) updatePayload.description = description;

    const { data, error } = await supabase
      .from('assets')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: 'Asset updated successfully' });
  } catch (error) {
    console.error('updateAsset Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update asset', error: error.message });
  }
};

/**
 * 3. PREVENTIVE MAINTENANCE SCHEDULES
 */
const getMaintenanceSchedules = async (req, res) => {
  try {
    const { search = '', assetId, status, type } = req.query;

    let query = supabase
      .from('maintenance_schedules')
      .select(`
        *,
        assets (id, asset_code, name, location),
        assigned_profile:profiles!assigned_to (id, full_name, email)
      `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('maintenance_type', type);

    if (search) {
      query = query.or(`schedule_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('next_due_date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getMaintenanceSchedules Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance schedules', error: error.message });
  }
};

const getMaintenanceScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: schedule, error } = await supabase
      .from('maintenance_schedules')
      .select(`
        *,
        assets (*),
        assigned_profile:profiles!assigned_to (id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    return res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('getMaintenanceScheduleById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch schedule details', error: error.message });
  }
};

const createMaintenanceSchedule = async (req, res) => {
  try {
    const {
      asset_id,
      maintenance_type = 'PREVENTIVE',
      title,
      description,
      frequency_type = 'MONTHLY',
      frequency_value = 30,
      last_completed_date,
      assigned_to,
      priority = 'MEDIUM'
    } = req.body;

    if (!asset_id || !title) {
      return res.status(400).json({ success: false, message: 'Asset and Title are required' });
    }

    const schedule_number = await generateSequenceNumber('maintenance_schedules', 'schedule_number', 'PM');
    const next_due_date = calculateNextDueDate(last_completed_date, frequency_type, frequency_value);

    const newSchedule = {
      schedule_number,
      asset_id,
      maintenance_type,
      title,
      description: description || null,
      frequency_type,
      frequency_value: parseInt(frequency_value, 10) || 30,
      last_completed_date: last_completed_date || null,
      next_due_date,
      assigned_to: assigned_to || null,
      priority,
      status: 'ACTIVE',
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null
    };

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert([newSchedule])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data, message: 'Maintenance schedule created successfully' });
  } catch (error) {
    console.error('createMaintenanceSchedule Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create maintenance schedule', error: error.message });
  }
};

const updateMaintenanceSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, frequency_type, frequency_value, last_completed_date, assigned_to, priority, status } = req.body;

    const { data: existing } = await supabase.from('maintenance_schedules').select('*').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const fType = frequency_type || existing.frequency_type;
    const fVal = frequency_value || existing.frequency_value;
    const lComp = last_completed_date !== undefined ? last_completed_date : existing.last_completed_date;
    const next_due_date = calculateNextDueDate(lComp, fType, fVal);

    const updatePayload = {
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id || null,
      next_due_date
    };

    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (frequency_type !== undefined) updatePayload.frequency_type = frequency_type;
    if (frequency_value !== undefined) updatePayload.frequency_value = parseInt(frequency_value, 10);
    if (last_completed_date !== undefined) updatePayload.last_completed_date = last_completed_date;
    if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to;
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('updateMaintenanceSchedule Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update schedule', error: error.message });
  }
};

/**
 * 4. MAINTENANCE REQUESTS
 */
const getMaintenanceRequests = async (req, res) => {
  try {
    const { search = '', assetId, status, priority } = req.query;

    let query = supabase
      .from('maintenance_requests')
      .select(`
        *,
        assets (id, asset_code, name, location),
        reported_profile:profiles!reported_by (id, full_name, email)
      `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    if (search) {
      query = query.or(`request_number.ilike.%${search}%,issue.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getMaintenanceRequests Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests', error: error.message });
  }
};

const createMaintenanceRequest = async (req, res) => {
  try {
    const { asset_id, issue, priority = 'MEDIUM', description } = req.body;

    if (!asset_id || !issue || !description) {
      return res.status(400).json({ success: false, message: 'Asset, Issue summary, and Description are required' });
    }

    const request_number = await generateSequenceNumber('maintenance_requests', 'request_number', 'MR');

    const newReq = {
      request_number,
      asset_id,
      issue,
      priority,
      reported_by: req.user?.id || null,
      reported_date: new Date().toISOString(),
      description,
      status: 'OPEN'
    };

    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([newReq])
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      request_id: data.id,
      asset_id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Reporter',
      activity_type: 'CREATED',
      description: `Maintenance Request ${request_number} filed for asset issue: ${issue}`
    }]);

    return res.status(201).json({ success: true, data, message: 'Maintenance request submitted' });
  } catch (error) {
    console.error('createMaintenanceRequest Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit maintenance request', error: error.message });
  }
};

const convertRequestToWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, planned_start, planned_end, priority } = req.body;

    const { data: request, error: reqErr } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (reqErr || !request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    const work_order_number = await generateSequenceNumber('maintenance_work_orders', 'work_order_number', 'MWO');

    const newWO = {
      work_order_number,
      asset_id: request.asset_id,
      maintenance_request_id: request.id,
      maintenance_type: 'CORRECTIVE',
      title: `Corrective Repair: ${request.issue}`,
      description: request.description,
      priority: priority || request.priority,
      status: 'OPEN',
      assigned_to: assigned_to || null,
      planned_start: planned_start || new Date().toISOString(),
      planned_end: planned_end || null,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null
    };

    const { data: wo, error: woErr } = await supabase
      .from('maintenance_work_orders')
      .insert([newWO])
      .select()
      .single();

    if (woErr) throw woErr;

    // Update request status
    await supabase
      .from('maintenance_requests')
      .update({ status: 'CONVERTED_TO_WORK_ORDER', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Update asset status to BREAKDOWN or UNDER_MAINTENANCE
    await supabase
      .from('assets')
      .update({ status: 'UNDER_MAINTENANCE', updated_at: new Date().toISOString() })
      .eq('id', request.asset_id);

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      work_order_id: wo.id,
      request_id: request.id,
      asset_id: request.asset_id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Maintenance Supervisor',
      activity_type: 'CONVERTED',
      description: `Converted request ${request.request_number} to Work Order ${work_order_number}`
    }]);

    return res.status(201).json({ success: true, data: wo, message: `Created Work Order ${work_order_number} from request` });
  } catch (error) {
    console.error('convertRequestToWorkOrder Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to convert request to work order', error: error.message });
  }
};

/**
 * 5. MAINTENANCE WORK ORDERS
 */
const getWorkOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', assetId, status, priority, type, assignedTo } = req.query;

    const from = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const to = from + parseInt(limit, 10) - 1;

    let query = supabase
      .from('maintenance_work_orders')
      .select(`
        *,
        assets (id, asset_code, name, location, criticality),
        assigned_profile:profiles!assigned_to (id, full_name, email)
      `, { count: 'exact' });

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (type) query = query.eq('maintenance_type', type);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    if (search) {
      query = query.or(`work_order_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
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
    console.error('getWorkOrders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch work orders', error: error.message });
  }
};

const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: wo, error } = await supabase
      .from('maintenance_work_orders')
      .select(`
        *,
        assets (*),
        maintenance_schedules (*),
        maintenance_requests (*),
        assigned_profile:profiles!assigned_to (id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !wo) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Fetch checklists
    const { data: checklists } = await supabase
      .from('maintenance_checklists')
      .select('*')
      .eq('work_order_id', id)
      .order('sequence', { ascending: true });

    // Fetch spare parts used
    const { data: parts } = await supabase
      .from('maintenance_parts')
      .select(`
        *,
        products (id, product_code, name),
        warehouses (id, code, name),
        storage_locations (id, location_code, name)
      `)
      .eq('work_order_id', id);

    // Fetch downtime logs
    const { data: downtimes } = await supabase
      .from('downtime_logs')
      .select('*')
      .eq('work_order_id', id);

    // Fetch timeline activities
    const { data: activities } = await supabase
      .from('maintenance_activities')
      .select('*')
      .eq('work_order_id', id)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...wo,
        checklists: checklists || [],
        parts: parts || [],
        downtimes: downtimes || [],
        activities: activities || []
      }
    });
  } catch (error) {
    console.error('getWorkOrderById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch work order details', error: error.message });
  }
};

const createWorkOrder = async (req, res) => {
  try {
    const {
      asset_id,
      maintenance_schedule_id,
      maintenance_request_id,
      maintenance_type = 'PREVENTIVE',
      title,
      description,
      priority = 'MEDIUM',
      assigned_to,
      planned_start,
      planned_end,
      checklists = []
    } = req.body;

    if (!asset_id || !title) {
      return res.status(400).json({ success: false, message: 'Asset and Title are required' });
    }

    const work_order_number = await generateSequenceNumber('maintenance_work_orders', 'work_order_number', 'MWO');

    const newWO = {
      work_order_number,
      asset_id,
      maintenance_schedule_id: maintenance_schedule_id || null,
      maintenance_request_id: maintenance_request_id || null,
      maintenance_type,
      title,
      description: description || null,
      priority,
      status: 'OPEN',
      assigned_to: assigned_to || null,
      planned_start: planned_start || new Date().toISOString(),
      planned_end: planned_end || null,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null
    };

    const { data: wo, error } = await supabase
      .from('maintenance_work_orders')
      .insert([newWO])
      .select()
      .single();

    if (error) throw error;

    // Pre-populate checklist items
    let itemsToInsert = [];
    if (Array.isArray(checklists) && checklists.length > 0) {
      itemsToInsert = checklists.map((chk, idx) => ({
        work_order_id: wo.id,
        sequence: (idx + 1) * 10,
        title: chk.title,
        description: chk.description || null,
        required: chk.required !== false,
        completed: false
      }));
    } else {
      // Default inspection checklist
      itemsToInsert = [
        { work_order_id: wo.id, sequence: 10, title: 'Safety Isolations & Lockout Tagout (LOTO)', required: true },
        { work_order_id: wo.id, sequence: 20, title: 'Visual Mechanical & Leak Inspection', required: true },
        { work_order_id: wo.id, sequence: 30, title: 'Perform Servicing / Part Replacement / Calibration', required: true },
        { work_order_id: wo.id, sequence: 40, title: 'Post-Maintenance Test Run & Clearance', required: true }
      ];
    }

    await supabase.from('maintenance_checklists').insert(itemsToInsert);

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      work_order_id: wo.id,
      asset_id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Planner',
      activity_type: 'CREATED',
      description: `Work Order ${work_order_number} created`
    }]);

    return res.status(201).json({ success: true, data: wo, message: 'Work Order created successfully' });
  } catch (error) {
    console.error('createWorkOrder Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create work order', error: error.message });
  }
};

const startWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: wo, error: fetchErr } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    const actual_start = new Date().toISOString();

    const { data: updated, error: updateErr } = await supabase
      .from('maintenance_work_orders')
      .update({
        status: 'IN_PROGRESS',
        actual_start,
        updated_at: actual_start,
        updated_by: req.user?.id || null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Set Asset Status to UNDER_MAINTENANCE
    await supabase
      .from('assets')
      .update({ status: 'UNDER_MAINTENANCE', updated_at: actual_start })
      .eq('id', wo.asset_id);

    // Create an active downtime log
    await supabase.from('downtime_logs').insert([{
      asset_id: wo.asset_id,
      work_order_id: id,
      start_time: actual_start,
      reason: `Maintenance WO ${wo.work_order_number}: ${wo.title}`,
      status: 'ACTIVE'
    }]);

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      work_order_id: id,
      asset_id: wo.asset_id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Technician',
      activity_type: 'STARTED',
      description: `Technician started work on ${wo.work_order_number}`
    }]);

    return res.json({ success: true, data: updated, message: 'Work Order marked IN_PROGRESS' });
  } catch (error) {
    console.error('startWorkOrder Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start work order', error: error.message });
  }
};

const completeWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { root_cause, resolution, notes } = req.body;

    const { data: wo, error: fetchErr } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // Verify required checklists are completed
    const { data: checklists } = await supabase
      .from('maintenance_checklists')
      .select('*')
      .eq('work_order_id', id);

    if (checklists && checklists.length > 0) {
      const incompleteRequired = checklists.filter(c => c.required && !c.completed);
      if (incompleteRequired.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot complete Work Order. ${incompleteRequired.length} required checklist items are incomplete.`
        });
      }
    }

    const actual_end = new Date().toISOString();
    const startTime = wo.actual_start ? new Date(wo.actual_start) : new Date(wo.created_at);
    const endTime = new Date(actual_end);
    const downtime_minutes = Math.max(0, Math.round((endTime - startTime) / (1000 * 60)));

    const { data: updated, error: updateErr } = await supabase
      .from('maintenance_work_orders')
      .update({
        status: 'COMPLETED',
        actual_end,
        downtime_minutes,
        root_cause: root_cause || wo.root_cause,
        resolution: resolution || wo.resolution || 'Serviced and restored to operation.',
        notes: notes || wo.notes,
        updated_at: actual_end,
        updated_by: req.user?.id || null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Restore Asset status to AVAILABLE
    await supabase
      .from('assets')
      .update({ status: 'AVAILABLE', updated_at: actual_end })
      .eq('id', wo.asset_id);

    // Close any active downtime log
    const { data: activeDowntimes } = await supabase
      .from('downtime_logs')
      .select('*')
      .eq('work_order_id', id)
      .eq('status', 'ACTIVE');

    if (activeDowntimes && activeDowntimes.length > 0) {
      for (const dLog of activeDowntimes) {
        const dStart = new Date(dLog.start_time);
        const dMinutes = Math.max(0, Math.round((endTime - dStart) / (1000 * 60)));
        await supabase
          .from('downtime_logs')
          .update({
            status: 'COMPLETED',
            end_time: actual_end,
            duration_minutes: dMinutes,
            updated_at: actual_end
          })
          .eq('id', dLog.id);
      }
    }

    // If linked to PM Schedule, update next due date
    if (wo.maintenance_schedule_id) {
      const { data: sched } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('id', wo.maintenance_schedule_id)
        .single();

      if (sched) {
        const todayStr = new Date().toISOString().split('T')[0];
        const nextDue = calculateNextDueDate(todayStr, sched.frequency_type, sched.frequency_value);
        await supabase
          .from('maintenance_schedules')
          .update({
            last_completed_date: todayStr,
            next_due_date: nextDue,
            updated_at: actual_end
          })
          .eq('id', sched.id);
      }
    }

    // Log Activity
    await supabase.from('maintenance_activities').insert([{
      work_order_id: id,
      asset_id: wo.asset_id,
      actor_id: req.user?.id || null,
      actor_name: req.user?.email || 'Technician',
      activity_type: 'COMPLETED',
      description: `Work Order ${wo.work_order_number} completed. Downtime logged: ${downtime_minutes} mins.`
    }]);

    return res.json({ success: true, data: updated, message: `Work Order completed (${downtime_minutes} mins downtime recorded)` });
  } catch (error) {
    console.error('completeWorkOrder Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete work order', error: error.message });
  }
};

/**
 * 6. SPARE PARTS CONSUMPTION WITH INVENTORY DEDUCTION
 */
const addWorkOrderPart = async (req, res) => {
  try {
    const { id } = req.params; // Work Order ID
    const { product_id, warehouse_id, location_id, quantity, notes } = req.body;

    if (!product_id || !warehouse_id || !quantity || parseFloat(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Product, Warehouse, and positive Quantity are required' });
    }

    const qtyToDeduct = parseFloat(quantity);

    // 1. Verify Work Order
    const { data: wo, error: woErr } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (woErr || !wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // 2. Check stock balance in inventory table
    let stockQuery = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product_id)
      .eq('warehouse_id', warehouse_id);

    if (location_id) {
      stockQuery = stockQuery.eq('location_id', location_id);
    }

    const { data: invBalances, error: invErr } = await stockQuery;

    let availableStock = 0;
    let invRow = null;

    if (invBalances && invBalances.length > 0) {
      invRow = invBalances[0];
      availableStock = parseFloat(invRow.on_hand_quantity || invRow.quantity || 0);
    }

    // STRICT INVENTORY VALIDATION: Reject if stock < requested
    if (availableStock < qtyToDeduct) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. Available stock: ${availableStock}, Requested: ${qtyToDeduct}. Negative stock is prevented.`
      });
    }

    // Fetch product unit price
    const { data: product } = await supabase
      .from('products')
      .select('unit_price, cost_price')
      .eq('id', product_id)
      .single();

    const unit_cost = parseFloat(product?.cost_price || product?.unit_price || 0);
    const total_cost = qtyToDeduct * unit_cost;

    // 3. Deduct stock from inventory table
    const newStock = availableStock - qtyToDeduct;
    if (invRow) {
      await supabase
        .from('inventory')
        .update({ on_hand_quantity: newStock, quantity: newStock })
        .eq('id', invRow.id);
    }

    // 4. Create inventory_transactions record
    const { data: txn, error: txnErr } = await supabase
      .from('inventory_transactions')
      .insert([{
        product_id,
        warehouse_id,
        location_id: location_id || null,
        movement_type: 'MAINTENANCE_CONSUMPTION',
        quantity: qtyToDeduct,
        reference_type: 'MAINTENANCE_WORK_ORDER',
        reference_id: id,
        reason: `Maintenance spare consumption for WO ${wo.work_order_number}`,
        performed_by: req.user?.id || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (txnErr) throw txnErr;

    // 5. Create maintenance_parts record
    const { data: partRow, error: partErr } = await supabase
      .from('maintenance_parts')
      .insert([{
        work_order_id: id,
        product_id,
        warehouse_id,
        location_id: location_id || null,
        quantity: qtyToDeduct,
        unit_cost,
        total_cost,
        inventory_transaction_id: txn.id,
        used_by: req.user?.id || null,
        notes
      }])
      .select()
      .single();

    if (partErr) throw partErr;

    return res.status(201).json({
      success: true,
      data: partRow,
      message: `Spare part consumed (${qtyToDeduct} units). New inventory balance: ${newStock}`
    });
  } catch (error) {
    console.error('addWorkOrderPart Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record spare part consumption', error: error.message });
  }
};

/**
 * 7. CHECKLISTS
 */
const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params; // Checklist item ID
    const { completed, notes } = req.body;

    const updatePayload = {
      completed: !!completed,
      notes: notes || null
    };

    if (completed) {
      updatePayload.completed_by = req.user?.id || null;
      updatePayload.completed_at = new Date().toISOString();
    } else {
      updatePayload.completed_by = null;
      updatePayload.completed_at = null;
    }

    const { data, error } = await supabase
      .from('maintenance_checklists')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: 'Checklist item updated' });
  } catch (error) {
    console.error('updateChecklistItem Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update checklist item', error: error.message });
  }
};

/**
 * 8. DOWNTIME LOGS
 */
const getDowntimeLogs = async (req, res) => {
  try {
    const { search = '', assetId, status } = req.query;

    let query = supabase
      .from('downtime_logs')
      .select(`
        *,
        assets (id, asset_code, name, location),
        maintenance_work_orders (id, work_order_number, title)
      `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    if (search) {
      query = query.or(`reason.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    query = query.order('start_time', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getDowntimeLogs Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch downtime logs', error: error.message });
  }
};

const createDowntimeLog = async (req, res) => {
  try {
    const { asset_id, work_order_id, reason, start_time, notes } = req.body;

    if (!asset_id || !reason) {
      return res.status(400).json({ success: false, message: 'Asset and Breakdown Reason are required' });
    }

    const start = start_time || new Date().toISOString();

    const newLog = {
      asset_id,
      work_order_id: work_order_id || null,
      start_time: start,
      reason,
      status: 'ACTIVE',
      notes
    };

    const { data, error } = await supabase
      .from('downtime_logs')
      .insert([newLog])
      .select()
      .single();

    if (error) throw error;

    // Update Asset Status to BREAKDOWN
    await supabase
      .from('assets')
      .update({ status: 'BREAKDOWN', updated_at: start })
      .eq('id', asset_id);

    return res.status(201).json({ success: true, data, message: 'Asset breakdown downtime recorded' });
  } catch (error) {
    console.error('createDowntimeLog Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record downtime', error: error.message });
  }
};

const closeDowntimeLog = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: log, error: fetchErr } = await supabase
      .from('downtime_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !log) {
      return res.status(404).json({ success: false, message: 'Downtime log not found' });
    }

    const end_time = new Date().toISOString();
    const dStart = new Date(log.start_time);
    const dEnd = new Date(end_time);
    const duration_minutes = Math.max(0, Math.round((dEnd - dStart) / (1000 * 60)));

    const { data: updated, error: updateErr } = await supabase
      .from('downtime_logs')
      .update({
        status: 'COMPLETED',
        end_time,
        duration_minutes,
        updated_at: end_time
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Restore Asset status
    await supabase
      .from('assets')
      .update({ status: 'AVAILABLE', updated_at: end_time })
      .eq('id', log.asset_id);

    return res.json({ success: true, data: updated, message: `Downtime closed (${duration_minutes} mins recorded)` });
  } catch (error) {
    console.error('closeDowntimeLog Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to close downtime log', error: error.message });
  }
};

/**
 * 9. MAINTENANCE HISTORY LOG
 */
const getMaintenanceHistory = async (req, res) => {
  try {
    const { data: completedWOs, error } = await supabase
      .from('maintenance_work_orders')
      .select(`
        *,
        assets (id, asset_code, name, location),
        assigned_profile:profiles!assigned_to (id, full_name, email),
        maintenance_parts (
          id, quantity, unit_cost, total_cost,
          products (id, product_code, name)
        )
      `)
      .eq('status', 'COMPLETED')
      .order('actual_end', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: completedWOs || [] });
  } catch (error) {
    console.error('getMaintenanceHistory Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch maintenance history', error: error.message });
  }
};

module.exports = {
  getDashboardKPIs,
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  getMaintenanceSchedules,
  getMaintenanceScheduleById,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  getMaintenanceRequests,
  createMaintenanceRequest,
  convertRequestToWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  addWorkOrderPart,
  updateChecklistItem,
  getDowntimeLogs,
  createDowntimeLog,
  closeDowntimeLog,
  getMaintenanceHistory
};
