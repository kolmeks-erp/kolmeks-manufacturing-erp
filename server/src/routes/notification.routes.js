const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// All routes require authentication
router.use(authenticateUser);

// Unread count (used by topbar bell)
router.get('/unread-count', notificationController.getUnreadCount);

// Main Notifications CRUD & Queries
router.get('/', notificationController.getNotifications);
router.get('/types', notificationController.getNotificationTypes);
router.get('/reports', notificationController.getNotificationReports);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Preferences
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Reminders
router.get('/reminders', notificationController.getReminders);
router.post('/reminders', notificationController.createReminder);
router.put('/reminders/:id/status', notificationController.updateReminderStatus);

// Individual Notification Actions
router.get('/:id', notificationController.getNotificationById);
router.put('/:id/read', notificationController.markAsRead);
router.put('/:id/unread', notificationController.markAsUnread);
router.delete('/:id/dismiss', notificationController.dismissNotification);

module.exports = router;
