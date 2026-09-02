const { supabase, supabaseAdmin } = require('../config/supabase');
const NotificationService = require('../services/notification.service');

const db = supabaseAdmin || supabase;

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { count, error } = await db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .eq('is_dismissed', false);

    if (error) throw error;
    return res.status(200).json({ success: true, count: count || 0 });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      tab = 'all', // 'all', 'unread', 'mentions', 'approvals', 'reminders'
      category,
      priority,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let query = db
      .from('notifications')
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey(id, full_name, email, role)
      `, { count: 'exact' })
      .eq('recipient_id', userId)
      .eq('is_dismissed', false);

    // Apply tab filters
    if (tab === 'unread') {
      query = query.eq('is_read', false);
    } else if (tab === 'approvals') {
      query = query.eq('category', 'Approvals');
    } else if (tab === 'mentions') {
      query = query.ilike('message', '%@%');
    }

    // Apply category filter
    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    // Apply priority filter
    if (priority && priority !== 'ALL') {
      query = query.eq('priority', priority);
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},message.ilike.${searchTerm},related_record_reference.ilike.${searchTerm}`);
    }

    // Sorting: Urgent/High unread first, then created_at DESC
    query = query.order('created_at', { ascending: false });

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/:id
exports.getNotificationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await db
      .from('notifications')
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey(id, full_name, email, role)
      `)
      .eq('id', id)
      .eq('recipient_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getNotificationById error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/unread
exports.markAsUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await db
      .from('notifications')
      .update({ is_read: false, read_at: null })
      .eq('id', id)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('markAsUnread error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/:id/dismiss
exports.dismissNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await db
      .from('notifications')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Notification dismissed.' });
  } catch (err) {
    console.error('dismissNotification error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/reminders
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = db
      .from('reminders')
      .select('*')
      .eq('recipient_id', userId)
      .order('due_date', { ascending: true });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getReminders error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications/reminders
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      due_date,
      reminder_time,
      priority = 'NORMAL',
      related_module,
      related_record_id,
      related_record_reference,
      related_route,
    } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ success: false, message: 'Title and due date are required.' });
    }

    const { data, error } = await db
      .from('reminders')
      .insert({
        title,
        description: description || null,
        recipient_id: userId,
        due_date,
        reminder_time: reminder_time || due_date,
        priority,
        status: 'PENDING',
        related_module: related_module || 'General',
        related_record_id: related_record_id || null,
        related_record_reference: related_record_reference || null,
        related_route: related_route || null,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('createReminder error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/reminders/:id/status
exports.updateReminderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // 'COMPLETED', 'DISMISSED', 'PENDING'

    const { data, error } = await db
      .from('reminders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('updateReminderStatus error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let { data, error } = await db
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // If no preferences row exists yet, create default
      const { data: newPrefs, error: insertErr } = await db
        .from('notification_preferences')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertErr) throw insertErr;
      data = newPrefs;
    } else if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getPreferences error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await db
      .from('notification_preferences')
      .upsert(
        { user_id: userId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('updatePreferences error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/types
exports.getNotificationTypes = async (req, res) => {
  try {
    const { data, error } = await db
      .from('notification_types')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getNotificationTypes error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/reports
exports.getNotificationReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      { count: totalCount },
      { count: unreadCount },
      { count: urgentCount },
      { data: byCategory },
      { data: recentDeliveryLogs },
    ] = await Promise.all([
      db.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', userId),
      db.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', userId).eq('is_read', false),
      db.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', userId).eq('priority', 'URGENT'),
      db.from('notifications').select('category').eq('recipient_id', userId),
      db.from('notification_delivery_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    // Aggregate category metrics
    const categoryCounts = (byCategory || []).reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalCount: totalCount || 0,
        unreadCount: unreadCount || 0,
        urgentCount: urgentCount || 0,
        categoryCounts,
        recentDeliveryLogs: recentDeliveryLogs || [],
      },
    });
  } catch (err) {
    console.error('getNotificationReports error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
