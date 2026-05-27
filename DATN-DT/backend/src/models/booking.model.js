const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        // ID nhóm booking (để gộp đơn hàng nhiều slot)
        bookingId: {
            type: String,
            required: false,
        },

        fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Field',
            required: true,
        },

        bookingDate: {
            type: Date,
            required: true,
        },

        startTime: {
            type: String, // "17:00"
            required: true,
        },

        endTime: {
            type: String,
            required: true,
        },

        price: {
            type: Number, // lưu giá tại thời điểm đặt (đã trừ giảm giá nếu có)
            required: true,
        },

        originalPrice: {
            type: Number, // giá gốc trước khi giảm
            default: null,
        },

        discountCode: {
            type: String,
            default: null,
        },

        discountAmount: {
            type: Number, // số tiền được giảm
            default: 0,
        },

        note: {
            type: String,
            default: '',
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'paid', 'cancelled'],
            default: 'pending',
        },

        typePayment: {
            type: String,
            enum: ['cash', 'momo', 'vnpay', 'failed'],
            default: 'cash',
        },

        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Booking', bookingSchema);
