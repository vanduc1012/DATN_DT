const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../utils/constants');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người đặt sân là bắt buộc'],
    },
    pitch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pitch',
      required: [true, 'Sân bóng là bắt buộc'],
    },
    date: {
      type: Date,
      required: [true, 'Ngày đặt sân là bắt buộc'],
    },
    startTime: {
      type: String, // 'HH:mm'
      required: [true, 'Giờ bắt đầu là bắt buộc'],
      match: [/^\d{2}:\d{2}$/, 'Giờ bắt đầu không đúng định dạng HH:mm'],
    },
    endTime: {
      type: String, // 'HH:mm'
      required: [true, 'Giờ kết thúc là bắt buộc'],
      match: [/^\d{2}:\d{2}$/, 'Giờ kết thúc không đúng định dạng HH:mm'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    note: {
      type: String,
      maxlength: 500,
    },
    cancelReason: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index để query nhanh, kiểm tra conflict
bookingSchema.index({ pitch: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
