const Review = require('./review.model');
const Pitch = require('../pitches/pitch.model');
const Booking = require('../bookings/booking.model');
const { BOOKING_STATUS, PAGINATION } = require('../../utils/constants');

/**
 * Tạo đánh giá (user phải đã đặt và hoàn thành booking tại sân đó)
 */
const createReview = async (pitchId, data, userId) => {
  const pitch = await Pitch.findById(pitchId);
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra user đã từng đặt và hoàn thành ở sân này chưa
  const hasBooked = await Booking.findOne({
    user: userId,
    pitch: pitchId,
    status: BOOKING_STATUS.COMPLETED,
  });

  if (!hasBooked) {
    const err = new Error('Bạn chỉ có thể đánh giá sân sau khi đã hoàn thành đặt sân.');
    err.statusCode = 403;
    throw err;
  }

  // Kiểm tra đã review chưa (unique index sẽ bắt lỗi, nhưng báo trước tốt hơn)
  const existing = await Review.findOne({ user: userId, pitch: pitchId });
  if (existing) {
    const err = new Error('Bạn đã đánh giá sân này rồi.');
    err.statusCode = 409;
    throw err;
  }

  const review = await Review.create({ user: userId, pitch: pitchId, ...data });
  return Review.findById(review._id).populate('user', 'name avatar');
};

/**
 * Lấy danh sách đánh giá của một sân
 */
const getPitchReviews = async (pitchId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const pitch = await Pitch.findById(pitchId).select('name averageRating totalReviews');
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  const [reviews, total] = await Promise.all([
    Review.find({ pitch: pitchId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ pitch: pitchId }),
  ]);

  return {
    pitch: { name: pitch.name, averageRating: pitch.averageRating, totalReviews: pitch.totalReviews },
    reviews,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Xóa đánh giá (user xóa review của mình, admin xóa bất kỳ)
 */
const deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error('Không tìm thấy đánh giá.');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && review.user.toString() !== userId) {
    const err = new Error('Bạn không có quyền xóa đánh giá này.');
    err.statusCode = 403;
    throw err;
  }

  await Review.findByIdAndDelete(reviewId);
};

module.exports = { createReview, getPitchReviews, deleteReview };
