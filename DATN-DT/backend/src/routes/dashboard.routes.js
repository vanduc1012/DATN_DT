const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin } = require('../auth/checkAuth');
const dashboardController = require('../controller/dashboard.controller');

// Tất cả routes chỉ admin mới xem được
router.get('/stats', authAdmin, asyncHandler(dashboardController.getStats));
router.get('/revenue-chart', authAdmin, asyncHandler(dashboardController.getRevenueChart));
router.get('/field-distribution', authAdmin, asyncHandler(dashboardController.getFieldTypeDistribution));
router.get('/top-fields', authAdmin, asyncHandler(dashboardController.getTopBookedFields));
router.get('/recent-bookings', authAdmin, asyncHandler(dashboardController.getRecentBookings));
router.get('/full', authAdmin, asyncHandler(dashboardController.getFullDashboard));

module.exports = router;
