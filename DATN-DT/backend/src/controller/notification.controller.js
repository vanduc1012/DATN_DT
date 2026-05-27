const NotificationService = require('../services/notification.service');
const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const User = require('../models/users.model');

class NotificationController {
    // Get all notifications for logged-in user
    async getNotifications(req, res) {
        const userId = req.user.id;
        const { page, limit } = req.query;

        const result = await NotificationService.getNotificationsByUser(userId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return new OK({
            message: 'Lấy danh sách thông báo thành công',
            metadata: result,
        }).send(res);
    }

    // Mark a notification as read
    async markAsRead(req, res) {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await NotificationService.markAsRead(id, userId);

        if (!notification) {
            throw new BadRequestError('Không tìm thấy thông báo');
        }

        return new OK({
            message: 'Đã đánh dấu đã đọc',
            metadata: notification,
        }).send(res);
    }

    // Mark all notifications as read
    async markAllAsRead(req, res) {
        const userId = req.user.id;

        await NotificationService.markAllAsRead(userId);

        return new OK({
            message: 'Đã đánh dấu tất cả đã đọc',
            metadata: { success: true },
        }).send(res);
    }

    // Delete a notification
    async deleteNotification(req, res) {
        const userId = req.user.id;
        const { id } = req.params;

        await NotificationService.deleteNotification(id, userId);

        return new OK({
            message: 'Đã xóa thông báo',
            metadata: { success: true },
        }).send(res);
    }

    // Get unread count
    async getUnreadCount(req, res) {
        const userId = req.user.id;

        const count = await NotificationService.getUnreadCount(userId);

        return new OK({
            message: 'Lấy số thông báo chưa đọc thành công',
            metadata: { unreadCount: count },
        }).send(res);
    }

    // Admin: Send promotion notification to all users
    async sendPromotion(req, res) {
        const { title, message, userIds } = req.body;

        if (!title || !message) {
            throw new BadRequestError('Vui lòng nhập tiêu đề và nội dung');
        }

        let targetUsers;
        if (userIds && userIds.length > 0) {
            // Send to specific users
            targetUsers = userIds;
        } else {
            // Send to all users
            const allUsers = await User.find({}, '_id');
            targetUsers = allUsers.map((u) => u._id);
        }

        let sentCount = 0;
        for (const userId of targetUsers) {
            await NotificationService.createNotification({
                userId,
                type: 'promotion',
                title: `🎉 ${title}`,
                message,
                data: { type: 'promotion' },
            });
            sentCount++;
        }

        return new OK({
            message: `Đã gửi thông báo khuyến mãi đến ${sentCount} người dùng`,
            metadata: { sentCount },
        }).send(res);
    }

    // Admin: Send system notification to all users
    async sendSystemNotification(req, res) {
        const { title, message, userIds } = req.body;

        if (!title || !message) {
            throw new BadRequestError('Vui lòng nhập tiêu đề và nội dung');
        }

        let targetUsers;
        if (userIds && userIds.length > 0) {
            targetUsers = userIds;
        } else {
            const allUsers = await User.find({}, '_id');
            targetUsers = allUsers.map((u) => u._id);
        }

        let sentCount = 0;
        for (const userId of targetUsers) {
            await NotificationService.createNotification({
                userId,
                type: 'system',
                title: `📢 ${title}`,
                message,
                data: { type: 'system' },
            });
            sentCount++;
        }

        return new OK({
            message: `Đã gửi thông báo hệ thống đến ${sentCount} người dùng`,
            metadata: { sentCount },
        }).send(res);
    }
}

module.exports = new NotificationController();
