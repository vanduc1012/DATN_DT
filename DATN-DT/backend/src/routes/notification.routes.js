const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const notificationController = require('../controller/notification.controller');

// All routes require authentication
router.use(authUser);

// Get all notifications
router.get('/all', asyncHandler(notificationController.getNotifications));

// Get unread count
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

// Mark all as read  ← phải đặt TRƯỚC /:id để tránh conflict
router.post('/read-all', asyncHandler(notificationController.markAllAsRead));

// Mark a notification as read
router.post('/:id/read', asyncHandler(notificationController.markAsRead));

// Delete a notification
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

// Admin: Send promotion notification
router.post('/admin/promotion', authAdmin, asyncHandler(notificationController.sendPromotion));

// Admin: Send system notification
router.post('/admin/system', authAdmin, asyncHandler(notificationController.sendSystemNotification));

module.exports = router;
