const Notification = require('../models/notification.model');
const { getIO } = require('../config/socket');

class NotificationService {
    // Create a new notification and emit via Socket.IO
    async createNotification({ userId, type, title, message, data = null }) {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            data,
        });

        // Emit to user's room via Socket.IO
        const io = getIO();
        if (io) {
            io.to(`user_${userId}`).emit('new-notification', notification);
        }

        return notification;
    }

    // Get all notifications for a user
    async getNotificationsByUser(userId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments({ userId }),
            Notification.countDocuments({ userId, isRead: false }),
        ]);

        return {
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Mark a single notification as read
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true },
        );
        return notification;
    }

    // Mark all notifications as read for a user
    async markAllAsRead(userId) {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        return { success: true };
    }

    // Delete a notification
    async deleteNotification(notificationId, userId) {
        await Notification.findOneAndDelete({ _id: notificationId, userId });
        return { success: true };
    }

    // Get unread count
    async getUnreadCount(userId) {
        const count = await Notification.countDocuments({ userId, isRead: false });
        return count;
    }
}

module.exports = new NotificationService();
