const { supabase } = require('../config/supabase');

class NotificationService {
  /**
   * Dispatch a business event notification safely to single user, role, or department.
   * @param {Object} params
   * @param {string} params.type_code Notification type code (e.g. 'APPROVAL_REQUIRED', 'PO_APPROVED')
   * @param {string} [params.recipient_id] Specific user profile ID
   * @param {string} [params.recipient_role] Role code (e.g. 'purchase_manager', 'quality_manager')
   * @param {string} [params.recipient_department] Department name or ID
   * @param {string} [params.sender_id] Sender profile ID
   * @param {string} params.title Concise notification title
   * @param {string} params.message Concise notification body context
   * @param {string} [params.category='System'] Category name
   * @param {string} [params.priority='NORMAL'] Priority ('LOW', 'NORMAL', 'HIGH', 'URGENT')
   * @param {string} [params.related_module='General'] Related ERP module
   * @param {string} [params.related_record_id] UUID of related record
   * @param {string} [params.related_record_reference] Friendly reference code (e.g. PO-2026-000101)
   * @param {string} [params.related_route] Secure frontend route path
   * @param {string} [params.event_key] Unique key to prevent duplicate notifications
   */
  static async dispatchNotification(params) {
    try {
      const {
        type_code,
        recipient_id,
        recipient_role,
        recipient_department,
        sender_id,
        title,
        message,
        category = 'System',
        priority = 'NORMAL',
        related_module = 'General',
        related_record_id,
        related_record_reference,
        related_route,
        event_key,
      } = params;

      if (!title || !message) {
        throw new Error('Title and message are required for notification dispatch.');
      }

      // Idempotency check: prevent duplicate notifications for same event
      if (event_key) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('event_key', event_key)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`Notification event '${event_key}' already dispatched. Skipping duplicate.`);
          return { success: true, duplicate: true };
        }
      }

      // Resolve target recipient user IDs
      let targetRecipientIds = [];
      if (recipient_id) {
        targetRecipientIds.push(recipient_id);
      } else if (recipient_role) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', recipient_role);
        if (profiles) targetRecipientIds = profiles.map((p) => p.id);
      } else if (recipient_department) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('department_id', recipient_department);
        if (profiles) targetRecipientIds = profiles.map((p) => p.id);
      }

      if (targetRecipientIds.length === 0) {
        console.warn(`No target recipients found for notification event '${title}'.`);
        return { success: false, reason: 'No valid recipients' };
      }

      // Resolve notification type ID if type_code provided
      let typeId = null;
      if (type_code) {
        const { data: nType } = await supabase
          .from('notification_types')
          .select('id')
          .eq('code', type_code)
          .single();
        if (nType) typeId = nType.id;
      }

      const createdNotifications = [];

      for (const recId of targetRecipientIds) {
        // Check recipient notification preferences server-side
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', recId)
          .single();

        // Check if category in-app notification is enabled (Mandatory urgent alerts bypass preferences)
        const catKey = `in_app_${category.toLowerCase()}`;
        if (prefs && priority !== 'URGENT' && priority !== 'HIGH' && prefs[catKey] === false) {
          console.log(`Notification suppressed by user preferences for user ${recId}.`);
          continue;
        }

        const { data: notif, error } = await supabase
          .from('notifications')
          .insert({
            type_id: typeId,
            recipient_id: recId,
            sender_id: sender_id || null,
            title,
            message,
            category,
            priority,
            related_module,
            related_record_id: related_record_id || null,
            related_record_reference: related_record_reference || null,
            related_route: related_route || null,
            event_key: event_key || null,
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting notification for user ${recId}:`, error);
          continue;
        }

        // Log delivery status
        await supabase.from('notification_delivery_logs').insert({
          notification_id: notif.id,
          channel: 'IN_APP',
          status: 'SENT',
        });

        createdNotifications.push(notif);
      }

      return {
        success: true,
        count: createdNotifications.length,
        data: createdNotifications,
      };
    } catch (err) {
      console.error('NotificationService.dispatchNotification error:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = NotificationService;
