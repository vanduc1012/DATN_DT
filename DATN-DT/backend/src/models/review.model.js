const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        fieldId: {
            type: Schema.Types.ObjectId,
            ref: 'Field',
            required: true,
        },
        bookingId: {
            type: String, // Group booking ID
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
            maxlength: 1000,
        },
        images: [
            {
                type: String, // URLs of review images
            },
        ],
        // Admin có thể ẩn review không phù hợp
        isVisible: {
            type: Boolean,
            default: true,
        },
        // Owner trả lời
        reply: {
            content: { type: String, default: '' },
            repliedAt: { type: Date },
        },
    },
    {
        timestamps: true,
    },
);

// Mỗi user chỉ được đánh giá 1 lần cho mỗi booking
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });
reviewSchema.index({ fieldId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
