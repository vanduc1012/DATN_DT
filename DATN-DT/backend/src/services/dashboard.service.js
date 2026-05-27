const modelBooking = require('../models/booking.model');
const modelField = require('../models/field.model');
const modelUser = require('../models/users.model');

class DashboardService {
    /**
     * Lấy thống kê tổng quan Dashboard
     * @param {string} period - 'today' | '7days' | '30days'
     */
    async getDashboardStats(period = '7days') {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Tổng doanh thu trong khoảng thời gian
        const revenueResult = await modelBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: now },
                    status: { $in: ['paid', 'completed'] },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    totalBookings: { $sum: 1 },
                },
            },
        ]);

        // So sánh với khoảng trước đó
        const previousStart = new Date(startDate);
        const previousEnd = new Date(startDate);
        const periodDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
        previousStart.setDate(previousStart.getDate() - periodDays);

        const previousRevenue = await modelBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousStart, $lt: previousEnd },
                    status: { $in: ['paid', 'completed'] },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    totalBookings: { $sum: 1 },
                },
            },
        ]);

        // Sân đang hoạt động
        const activeFields = await modelField.countDocuments({ status: 'active' });
        const totalFields = await modelField.countDocuments();

        // Người dùng mới trong khoảng thời gian
        const newUsers = await modelUser.countDocuments({
            createdAt: { $gte: startDate, $lte: now },
        });

        const previousNewUsers = await modelUser.countDocuments({
            createdAt: { $gte: previousStart, $lt: previousEnd },
        });

        // Tính % thay đổi
        const currentRev = revenueResult[0]?.totalRevenue || 0;
        const prevRev = previousRevenue[0]?.totalRevenue || 0;
        const revenueChange = prevRev > 0 ? (((currentRev - prevRev) / prevRev) * 100).toFixed(1) : 0;

        const currentBookings = revenueResult[0]?.totalBookings || 0;
        const prevBookings = previousRevenue[0]?.totalBookings || 0;
        const bookingsChange =
            prevBookings > 0 ? (((currentBookings - prevBookings) / prevBookings) * 100).toFixed(1) : 0;

        const usersChange =
            previousNewUsers > 0 ? (((newUsers - previousNewUsers) / previousNewUsers) * 100).toFixed(1) : 0;

        return {
            totalRevenue: currentRev,
            revenueChange: parseFloat(revenueChange),
            totalBookings: currentBookings,
            bookingsChange: parseFloat(bookingsChange),
            activeFields,
            totalFields,
            newUsers,
            usersChange: parseFloat(usersChange),
        };
    }

    /**
     * Lấy dữ liệu doanh thu theo ngày cho biểu đồ
     * @param {number} days - Số ngày lấy dữ liệu
     */
    async getRevenueChart(days = 7) {
        const result = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayRevenue = await modelBooking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: date, $lt: nextDay },
                        status: { $in: ['paid', 'completed'] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$price' },
                        bookings: { $sum: 1 },
                    },
                },
            ]);

            result.push({
                date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                fullDate: date.toISOString().split('T')[0],
                revenue: dayRevenue[0]?.revenue || 0,
                bookings: dayRevenue[0]?.bookings || 0,
            });
        }

        return result;
    }

    /**
     * Lấy phân bố loại sân
     */
    async getFieldTypeDistribution() {
        const distribution = await modelField.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                },
            },
        ]);

        const typeLabels = {
            5: 'Sân 5 người',
            7: 'Sân 7 người',
            11: 'Sân 11 người',
        };

        return distribution.map((d) => ({
            name: typeLabels[d._id] || `Sân ${d._id} người`,
            value: d.count,
            type: d._id,
        }));
    }

    /**
     * Lấy top sân được đặt nhiều nhất
     * @param {number} limit - Số lượng sân lấy
     */
    async getTopBookedFields(limit = 5) {
        const result = await modelBooking.aggregate([
            {
                $group: {
                    _id: '$fieldId',
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$price' },
                },
            },
            {
                $lookup: {
                    from: 'fields',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'field',
                },
            },
            { $unwind: '$field' },
            {
                $project: {
                    name: '$field.name',
                    bookings: 1,
                    revenue: 1,
                },
            },
            { $sort: { bookings: -1 } },
            { $limit: limit },
        ]);

        return result;
    }

    /**
     * Lấy đơn đặt gần đây
     * @param {number} limit - Số lượng đơn lấy
     */
    async getRecentBookings(limit = 10) {
        const bookings = await modelBooking
            .find()
            .populate('fieldId', 'name type')
            .populate('userId', 'fullName email avatar')
            .sort({ createdAt: -1 })
            .limit(limit);

        return bookings;
    }

    /**
     * Lấy tất cả dữ liệu dashboard một lần
     */
    async getFullDashboard(period = '7days') {
        const [stats, revenueChart, fieldTypes, topFields, recentBookings] = await Promise.all([
            this.getDashboardStats(period),
            this.getRevenueChart(7),
            this.getFieldTypeDistribution(),
            this.getTopBookedFields(5),
            this.getRecentBookings(10),
        ]);

        return {
            stats,
            revenueChart,
            fieldTypes,
            topFields,
            recentBookings,
        };
    }
}

module.exports = new DashboardService();
