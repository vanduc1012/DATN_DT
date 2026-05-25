const bookingService = require('./booking.service');
const { success, paginated } = require('../../utils/response');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user);
    return success(res, booking, 'Đặt sân thành công', 201);
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { bookings, pagination: pg } = await bookingService.getMyBookings(req.user.id, req.query);
    return paginated(res, bookings, pg, 'Lấy danh sách đặt sân thành công');
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { bookings, pagination: pg } = await bookingService.getAllBookings(req.query, req.user.id, req.user.role);
    return paginated(res, bookings, pg, 'Lấy tất cả đặt sân thành công');
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
    return success(res, booking, 'Lấy thông tin đặt sân thành công');
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role,
    );
    return success(res, booking, 'Cập nhật trạng thái thành công');
  } catch (err) {
    next(err);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { pitchId } = req.params;
    const { date } = req.query;
    if (!date) {
      return next(Object.assign(new Error('Vui lòng cung cấp ngày (date).'), { statusCode: 400 }));
    }
    const data = await bookingService.getAvailableSlots(pitchId, date);
    return success(res, data, 'Lấy lịch sân thành công');
  } catch (err) {
    next(err);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body; // 'online' | 'cash'
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
    if (!booking) return next(Object.assign(new Error('Không tìm thấy đặt sân.'), { statusCode: 404 }));
    if (booking.paymentStatus === 'paid') {
      return next(Object.assign(new Error('Đặt sân này đã được thanh toán.'), { statusCode: 400 }));
    }
    const Booking = require('./booking.model');
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid', paymentMethod: paymentMethod || 'online' },
      { new: true }
    ).populate('pitch', 'name address type').populate('user', 'name email');
    return success(res, updated, 'Thanh toán thành công!');
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getBookingById, updateBookingStatus, getAvailableSlots, updatePaymentStatus };
