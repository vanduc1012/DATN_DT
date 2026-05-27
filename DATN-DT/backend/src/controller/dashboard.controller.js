const dashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    // Lấy thống kê tổng quan
    async getStats(req, res) {
        const { period } = req.query;
        const stats = await dashboardService.getDashboardStats(period);
        return new OK({
            message: 'Lấy thống kê thành công',
            metadata: stats,
        }).send(res);
    }

    // Lấy dữ liệu biểu đồ doanh thu
    async getRevenueChart(req, res) {
        const { days } = req.query;
        const data = await dashboardService.getRevenueChart(parseInt(days) || 7);
        return new OK({
            message: 'Lấy dữ liệu biểu đồ doanh thu thành công',
            metadata: data,
        }).send(res);
    }

    // Lấy phân bố loại sân
    async getFieldTypeDistribution(req, res) {
        const data = await dashboardService.getFieldTypeDistribution();
        return new OK({
            message: 'Lấy phân bố loại sân thành công',
            metadata: data,
        }).send(res);
    }

    // Lấy top sân được đặt nhiều
    async getTopBookedFields(req, res) {
        const { limit } = req.query;
        const data = await dashboardService.getTopBookedFields(parseInt(limit) || 5);
        return new OK({
            message: 'Lấy top sân thành công',
            metadata: data,
        }).send(res);
    }

    // Lấy đơn đặt gần đây
    async getRecentBookings(req, res) {
        const { limit } = req.query;
        const data = await dashboardService.getRecentBookings(parseInt(limit) || 10);
        return new OK({
            message: 'Lấy đơn đặt gần đây thành công',
            metadata: data,
        }).send(res);
    }

    // Lấy tất cả dữ liệu dashboard
    async getFullDashboard(req, res) {
        const { period } = req.query;
        const data = await dashboardService.getFullDashboard(period);
        return new OK({
            message: 'Lấy dữ liệu dashboard thành công',
            metadata: data,
        }).send(res);
    }
}

module.exports = new DashboardController();
