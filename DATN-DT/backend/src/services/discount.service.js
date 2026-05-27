const modelDiscount = require('../models/discount.model');

class DiscountService {
    // Tạo mã giảm giá
    async createDiscount(data) {
        // Check if code already exists
        const existing = await modelDiscount.findOne({ code: data.code.toUpperCase() });
        if (existing) {
            throw new Error('Mã giảm giá đã tồn tại');
        }

        const discount = await modelDiscount.create({
            ...data,
            code: data.code.toUpperCase(),
        });
        return discount;
    }

    // Lấy tất cả mã giảm giá với phân trang và filter
    async getAllDiscounts({ page = 1, limit = 10, search, status }) {
        const query = {};

        // Search by code or name
        if (search) {
            query.$or = [{ code: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }];
        }

        // Filter by status
        if (status === 'active') {
            query.isActive = true;
            query.endDate = { $gte: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            query.endDate = { $lt: new Date() };
        }

        const total = await modelDiscount.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const discounts = await modelDiscount
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            discounts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    // Lấy chi tiết mã giảm giá
    async getDiscountById(id) {
        const discount = await modelDiscount.findById(id);
        if (!discount) {
            throw new Error('Không tìm thấy mã giảm giá');
        }
        return discount;
    }

    // Cập nhật mã giảm giá
    async updateDiscount(id, data) {
        const discount = await modelDiscount.findByIdAndUpdate(
            id,
            { ...data, code: data.code?.toUpperCase() },
            { new: true },
        );
        if (!discount) {
            throw new Error('Không tìm thấy mã giảm giá');
        }
        return discount;
    }

    // Xóa mã giảm giá
    async deleteDiscount(id) {
        const discount = await modelDiscount.findByIdAndDelete(id);
        if (!discount) {
            throw new Error('Không tìm thấy mã giảm giá');
        }
        return discount;
    }

    // Validate và áp dụng mã giảm giá
    async validateDiscount(code, userId, orderValue, fieldId = null) {
        const discount = await modelDiscount.findOne({ code: code.toUpperCase() });

        if (!discount) {
            throw new Error('Mã giảm giá không tồn tại');
        }

        // Check if active
        if (!discount.isActive) {
            throw new Error('Mã giảm giá đã bị vô hiệu hóa');
        }

        // Check date range
        const now = new Date();
        if (now < discount.startDate) {
            throw new Error('Mã giảm giá chưa có hiệu lực');
        }
        if (now > discount.endDate) {
            throw new Error('Mã giảm giá đã hết hạn');
        }

        // Check usage limit
        if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
            throw new Error('Mã giảm giá đã hết lượt sử dụng');
        }

        // Check user usage limit
        if (userId) {
            const userUsage = discount.usersUsed.find((u) => u.userId.toString() === userId.toString());
            if (userUsage && userUsage.count >= discount.usageLimitPerUser) {
                throw new Error('Bạn đã sử dụng hết lượt cho mã giảm giá này');
            }
        }

        // Check min order value
        if (orderValue < discount.minOrderValue) {
            throw new Error(`Đơn hàng tối thiểu ${discount.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`);
        }

        // Check applies to specific fields
        if (discount.appliesTo === 'specific_fields' && fieldId) {
            const isApplicable = discount.specificFields.some((f) => f.toString() === fieldId.toString());
            if (!isApplicable) {
                throw new Error('Mã giảm giá không áp dụng cho sân này');
            }
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = (orderValue * discount.value) / 100;
            // Apply max discount cap if exists
            if (discount.maxDiscountValue && discountAmount > discount.maxDiscountValue) {
                discountAmount = discount.maxDiscountValue;
            }
        } else {
            // Fixed amount
            discountAmount = discount.value;
        }

        // Don't allow discount more than order value
        if (discountAmount > orderValue) {
            discountAmount = orderValue;
        }

        return {
            discount,
            discountAmount: Math.round(discountAmount),
            finalPrice: Math.round(orderValue - discountAmount),
        };
    }

    // Sau khi booking thành công, cập nhật usage
    async useDiscount(code, userId) {
        const discount = await modelDiscount.findOne({ code: code.toUpperCase() });
        if (!discount) return;

        // Increment used count
        discount.usedCount += 1;

        // Track user usage
        const userUsageIndex = discount.usersUsed.findIndex((u) => u.userId.toString() === userId.toString());
        if (userUsageIndex > -1) {
            discount.usersUsed[userUsageIndex].count += 1;
        } else {
            discount.usersUsed.push({ userId, count: 1 });
        }

        await discount.save();
    }
    // Lấy danh sách mã giảm giá phù hợp với người dùng tại checkout
    async getAvailableDiscounts(userId, orderValue, fieldId = null) {
        const now = new Date();

        // Lấy tất cả mã đang active và trong thời hạn
        const candidates = await modelDiscount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate:   { $gte: now },
        }).sort({ value: -1 }); // Sắp xếp giá trị giảm cao nhất lên đầu

        const available = [];

        for (const discount of candidates) {
            // Còn lượt dùng tổng
            if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) continue;

            // Đủ đơn tối thiểu
            if (orderValue < discount.minOrderValue) continue;

            // Kiểm tra giới hạn lượt/người dùng
            if (userId) {
                const userUsage = discount.usersUsed.find(
                    (u) => u.userId.toString() === userId.toString()
                );
                if (userUsage && userUsage.count >= discount.usageLimitPerUser) continue;
            }

            // Kiểm tra áp dụng theo sân cụ thể
            if (discount.appliesTo === 'specific_fields' && fieldId) {
                const ok = discount.specificFields.some((f) => f.toString() === fieldId.toString());
                if (!ok) continue;
            }

            // Tính số tiền giảm thực tế để hiển thị
            let discountAmount = 0;
            if (discount.type === 'percentage') {
                discountAmount = (orderValue * discount.value) / 100;
                if (discount.maxDiscountValue && discountAmount > discount.maxDiscountValue) {
                    discountAmount = discount.maxDiscountValue;
                }
            } else {
                discountAmount = discount.value;
            }
            if (discountAmount > orderValue) discountAmount = orderValue;

            available.push({
                _id:              discount._id,
                code:             discount.code,
                name:             discount.name,
                description:      discount.description,
                type:             discount.type,
                value:            discount.value,
                maxDiscountValue: discount.maxDiscountValue,
                minOrderValue:    discount.minOrderValue,
                endDate:          discount.endDate,
                discountAmount:   Math.round(discountAmount),
                finalPrice:       Math.round(orderValue - discountAmount),
            });
        }

        return available;
    }
}

module.exports = new DiscountService();
