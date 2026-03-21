const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { createBookingSchema, updateBookingStatusSchema } = require('./booking.validator');

// GET  /api/bookings/available/:pitchId?date=YYYY-MM-DD (public)
router.get('/available/:pitchId', bookingController.getAvailableSlots);

// GET  /api/bookings/my (user: lịch đặt của mình)
router.get('/my', authenticate, bookingController.getMyBookings);

// GET  /api/bookings (admin/owner: tất cả booking)
router.get('/', authenticate, authorize('admin', 'owner'), bookingController.getAllBookings);

// POST /api/bookings (user)
router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);

// GET  /api/bookings/:id
router.get('/:id', authenticate, bookingController.getBookingById);

// PATCH /api/bookings/:id/status (owner/admin/user hủy)
router.patch(
  '/:id/status',
  authenticate,
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus,
);

// PATCH /api/bookings/:id/payment (user thanh toán online)
router.patch('/:id/payment', authenticate, bookingController.updatePaymentStatus);

module.exports = router;
