const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const bookingController = require('../controller/booking.controller');

router.post('/create', authUser, asyncHandler(bookingController.createBooking));
// Route này phải đặt TRƯỚC route /:id để tránh conflict
router.get('/field/:fieldId', asyncHandler(bookingController.getBookingsByField));
router.get('/my-bookings', authUser, asyncHandler(bookingController.getMyBookings));
router.put('/verify-momo/:bookingId', authUser, asyncHandler(bookingController.verifyMomoPayment));
router.put('/verify-vnpay/:bookingId', authUser, asyncHandler(bookingController.verifyVnpayPayment));
router.get('/:id', asyncHandler(bookingController.getBookingById));

// Admin routes (Admin only)
router.get('/admin/all', authAdmin, asyncHandler(bookingController.getAllBookingsAdmin));
router.put('/admin/status/:bookingId', authAdmin, asyncHandler(bookingController.updateBookingStatusAdmin));

module.exports = router;
