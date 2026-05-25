const Booking = require('./booking.model');
const Pitch = require('../pitches/pitch.model');
const { BOOKING_STATUS, PAGINATION, SUPER_ADMIN_EMAIL } = require('../../utils/constants');

/**
 * Kiểm tra xung đột lịch đặt sân
 * Một booking bị xung đột nếu cùng sân, cùng ngày, và thời gian chồng nhau,
 * và trạng thái không phải cancelled
 */
const checkConflict = async (pitchId, date, startTime, endTime, excludeBookingId = null) => {
  const filter = {
    pitch: pitchId,
    date: new Date(date),
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    $or: [
      // Booking mới bắt đầu trong khoảng booking cũ
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) filter._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(filter);
  return conflict;
};

/**
 * Tính tổng tiền dựa trên giờ và giá sân
 */
const calcTotalPrice = (startTime, endTime, pricePerHour) => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  if (hours <= 0) {
    const err = new Error('Giờ kết thúc phải sau giờ bắt đầu.');
    err.statusCode = 400;
    throw err;
  }
  return Number((hours * pricePerHour).toFixed(0));
};

// ─────────────────────────────────────────────────────────────

/**
 * Tạo booking mới
 */
const createBooking = async (data, requestingUser) => {
  const { pitch: pitchId, date, startTime, endTime, note } = data;
  const userId = requestingUser.id;

  if (requestingUser.role === 'admin' || requestingUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    const err = new Error('Tài khoản quản trị viên không thể thực hiện đặt sân.');
    err.statusCode = 403;
    throw err;
  }

  // Ngăn chặn đặt khung giờ đã trôi qua trong ngày hôm nay
  const reqDateStr = new Date(date).toISOString().split('T')[0];
  const todayStr = new Date().toLocaleDateString('en-CA');
  if (reqDateStr === todayStr) {
    const [sh] = startTime.split(':').map(Number);
    const currentHour = new Date().getHours();
    if (sh <= currentHour) {
      const err = new Error('Không thể đặt khung giờ đã trôi qua trong ngày hôm nay.');
      err.statusCode = 400;
      throw err;
    }
  }

  const pitch = await Pitch.findById(pitchId);
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  if (pitch.status !== 'active') {
    const err = new Error('Sân bóng hiện không hoạt động.');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra xung đột lịch
  const conflict = await checkConflict(pitchId, date, startTime, endTime);
  if (conflict) {
    const err = new Error(`Khung giờ ${startTime} - ${endTime} ngày ${new Date(date).toLocaleDateString('vi-VN')} đã được đặt.`);
    err.statusCode = 409;
    throw err;
  }

  const totalPrice = calcTotalPrice(startTime, endTime, pitch.pricePerHour);

  const booking = await Booking.create({
    user: userId,
    pitch: pitchId,
    date: new Date(date),
    startTime,
    endTime,
    totalPrice,
    note,
  });

  return Booking.findById(booking._id)
    .populate('pitch', 'name address type pricePerHour')
    .populate('user', 'name email phone');
};

/**
 * Lấy danh sách booking của user hiện tại
 */
const getMyBookings = async (userId, query = {}) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { user: userId };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('pitch', 'name address type images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Lấy tất cả bookings (admin)
 * hoặc bookings của sân mình (owner)
 */
const getAllBookings = async (query = {}, userId, userRole) => {
  const { page = 1, limit = 10, status, pitchId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (status) filter.status = status;

  if (userRole === 'owner') {
    // Lấy danh sách sân của owner này
    const pitches = await Pitch.find({ owner: userId }).select('_id');
    const pitchIds = pitches.map((p) => p._id);
    filter.pitch = { $in: pitchIds };
  }

  if (pitchId) filter.pitch = pitchId;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('pitch', 'name address type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Lấy chi tiết booking theo ID
 */
const getBookingById = async (id, userId, userRole) => {
  const booking = await Booking.findById(id)
    .populate('pitch', 'name address type pricePerHour owner')
    .populate('user', 'name email phone');

  if (!booking) {
    const err = new Error('Không tìm thấy đặt sân.');
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra quyền: chỉ user đặt, owner của sân, hoặc admin mới xem được
  const isOwner = userRole === 'admin' ||
    booking.user._id.toString() === userId ||
    (booking.pitch.owner && booking.pitch.owner.toString() === userId);

  if (!isOwner) {
    const err = new Error('Bạn không có quyền xem đặt sân này.');
    err.statusCode = 403;
    throw err;
  }

  return booking;
};

/**
 * Cập nhật trạng thái booking (owner xác nhận/hủy, user cũng có thể hủy)
 */
const updateBookingStatus = async (id, { status, cancelReason }, userId, userRole) => {
  const booking = await Booking.findById(id).populate('pitch', 'owner');
  if (!booking) {
    const err = new Error('Không tìm thấy đặt sân.');
    err.statusCode = 404;
    throw err;
  }

  // User chỉ được hủy booking của chính mình
  if (userRole === 'user') {
    if (booking.user.toString() !== userId) {
      const err = new Error('Bạn không có quyền thay đổi trạng thái đặt sân này.');
      err.statusCode = 403;
      throw err;
    }
    if (status !== BOOKING_STATUS.CANCELLED) {
      const err = new Error('Người dùng chỉ có thể hủy đặt sân.');
      err.statusCode = 403;
      throw err;
    }
  }

  booking.status = status;
  if (cancelReason) booking.cancelReason = cancelReason;
  await booking.save();

  return Booking.findById(booking._id)
    .populate('pitch', 'name address type')
    .populate('user', 'name email phone');
};

/**
 * Kiểm tra khung giờ còn trống
 */
const getAvailableSlots = async (pitchId, date) => {
  const pitch = await Pitch.findById(pitchId);
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  const bookings = await Booking.find({
    pitch: pitchId,
    date: new Date(date),
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
  }).select('startTime endTime status');

  return {
    pitch: { name: pitch.name, openTime: pitch.openTime, closeTime: pitch.closeTime },
    bookedSlots: bookings.map((b) => ({ startTime: b.startTime, endTime: b.endTime, status: b.status })),
  };
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getAvailableSlots,
};
