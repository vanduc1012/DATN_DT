const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người đánh giá là bắt buộc'],
    },
    pitch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pitch',
      required: [true, 'Sân bóng là bắt buộc'],
    },
    rating: {
      type: Number,
      required: [true, 'Điểm đánh giá là bắt buộc'],
      min: [1, 'Điểm tối thiểu là 1'],
      max: [5, 'Điểm tối đa là 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Nhận xét không được vượt quá 1000 ký tự'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Mỗi user chỉ được review 1 lần cho 1 sân
reviewSchema.index({ user: 1, pitch: 1 }, { unique: true });
reviewSchema.index({ pitch: 1, createdAt: -1 });

/**
 * Middleware: sau khi lưu review, cập nhật averageRating và totalReviews của Pitch
 */
reviewSchema.post('save', async function () {
  await updatePitchRating(this.pitch);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updatePitchRating(doc.pitch);
});

async function updatePitchRating(pitchId) {
  const Pitch = require('../pitches/pitch.model');
  const result = await mongoose.model('Review').aggregate([
    { $match: { pitch: pitchId } },
    { $group: { _id: '$pitch', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await Pitch.findByIdAndUpdate(pitchId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      totalReviews: result[0].count,
    });
  } else {
    await Pitch.findByIdAndUpdate(pitchId, { averageRating: 0, totalReviews: 0 });
  }
}

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
