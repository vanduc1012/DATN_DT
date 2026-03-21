const mongoose = require('mongoose');
const { PITCH_STATUS, PITCH_TYPES } = require('../../utils/constants');

const pitchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sân là bắt buộc'],
      trim: true,
      minlength: [3, 'Tên sân phải có ít nhất 3 ký tự'],
      maxlength: [200, 'Tên sân không được vượt quá 200 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự'],
    },
    address: {
      type: String,
      required: [true, 'Địa chỉ là bắt buộc'],
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(PITCH_TYPES),
      required: [true, 'Loại sân là bắt buộc'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Giá thuê sân là bắt buộc'],
      min: [0, 'Giá không thể âm'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String], // ['Đèn chiếu sáng', 'Giữ xe', 'Phòng thay đồ', ...]
      default: [],
    },
    openTime: {
      type: String, // 'HH:mm'
      default: '06:00',
    },
    closeTime: {
      type: String, // 'HH:mm'
      default: '22:00',
    },
    status: {
      type: String,
      enum: Object.values(PITCH_STATUS),
      default: PITCH_STATUS.ACTIVE,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Chủ sân là bắt buộc'],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Text search index
pitchSchema.index({ name: 'text', address: 'text', district: 'text', city: 'text' });
pitchSchema.index({ owner: 1 });
pitchSchema.index({ status: 1 });
pitchSchema.index({ type: 1 });

const Pitch = mongoose.model('Pitch', pitchSchema);

module.exports = Pitch;
