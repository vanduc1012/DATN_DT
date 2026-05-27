const mongoose = require('mongoose');
const { Schema } = mongoose;

const discountSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'], // percentage: giảm %, fixed: giảm số tiền cố định
            default: 'percentage',
        },
        value: {
            type: Number,
            required: true, // Nếu type=percentage thì value là %, nếu type=fixed thì value là VND
        },
        minOrderValue: {
            type: Number,
            default: 0, // Đơn tối thiểu để áp dụng
        },
        maxDiscountValue: {
            type: Number,
            default: null, // Giảm tối đa (cho percentage type)
        },
        usageLimit: {
            type: Number,
            default: null, // Số lần sử dụng tối đa (null = không giới hạn)
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usageLimitPerUser: {
            type: Number,
            default: 1, // Số lần mỗi user được dùng
        },
        usersUsed: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                count: { type: Number, default: 1 },
            },
        ],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        appliesTo: {
            type: String,
            enum: ['all', 'specific_fields'], // all: tất cả sân, specific_fields: chỉ một số sân
            default: 'all',
        },
        specificFields: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Field',
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Index để tìm kiếm nhanh theo code
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
