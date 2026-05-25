const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const Booking = require('../bookings/booking.model');
const Pitch = require('../pitches/pitch.model');
const User = require('../users/user.model');
const { success } = require('../../utils/response');

// Middleware check admin role
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới được truy cập.' });
  }
  next();
};

// GET /api/stats/overview — admin only
router.get('/overview', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [totalPitches, activePitches, totalUsers, totalBookings, bookings] = await Promise.all([
      Pitch.countDocuments(),
      Pitch.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.find().lean(),
    ]);

    const revenue = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((s, b) => s + (b.totalPrice || 0), 0);

    const paidRevenue = revenue;

    const statusCount = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    return success(res, {
      pitches: { total: totalPitches, active: activePitches },
      users: { total: totalUsers },
      bookings: { total: totalBookings, ...statusCount },
      revenue: { total: revenue, paid: paidRevenue },
    });
  } catch (err) { next(err); }
});

// GET /api/stats/revenue?period=month&year=2026&month=3
router.get('/revenue', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { period = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    let pipeline = [];

    if (period === 'year') {
      // Doanh thu 12 tháng của năm
      pipeline = [
        { $match: { paymentStatus: 'paid', date: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) } } },
        { $group: { _id: { $month: '$date' }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ];
    } else if (period === 'month') {
      // Doanh thu từng ngày trong tháng
      const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      pipeline = [
        { $match: { paymentStatus: 'paid', date: { $gte: start, $lt: end } } },
        { $group: { _id: { $dayOfMonth: '$date' }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ];
    } else {
      // 7 ngày gần nhất
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      pipeline = [
        { $match: { paymentStatus: 'paid', date: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ];
    }

    const result = await Booking.aggregate(pipeline);
    return success(res, { period, data: result });
  } catch (err) { next(err); }
});

// GET /api/stats/top-pitches — sân được đặt nhiều nhất
router.get('/top-pitches', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const result = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$pitch', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'pitches', localField: '_id', foreignField: '_id', as: 'pitch' } },
      { $unwind: '$pitch' },
      { $project: { count: 1, revenue: 1, 'pitch.name': 1, 'pitch.type': 1, 'pitch.address': 1 } },
    ]);
    return success(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
