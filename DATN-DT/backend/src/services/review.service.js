const modelReview = require('../models/review.model');
const modelBooking = require('../models/booking.model');
const modelField = require('../models/field.model');

class ReviewService {
    // Tạo đánh giá mới
    async createReview({ userId, fieldId, bookingId, rating, comment, images }) {
        // Kiểm tra booking có thuộc về user này không và đã completed chưa
        const booking = await modelBooking.findOne({
            bookingId,
            userId,
            status: 'completed',
        });

        if (!booking) {
            throw new Error('Bạn chỉ có thể đánh giá sau khi hoàn thành đặt sân');
        }

        // Kiểm tra đã đánh giá booking này chưa
        const existingReview = await modelReview.findOne({ userId, bookingId });
        if (existingReview) {
            throw new Error('Bạn đã đánh giá cho đơn đặt sân này rồi');
        }

        // Tạo review
        const review = await modelReview.create({
            userId,
            fieldId,
            bookingId,
            rating,
            comment,
            images: images || [],
        });

        // Cập nhật rating trung bình cho field
        await this.updateFieldAverageRating(fieldId);

        // Populate user info
        const populatedReview = await modelReview.findById(review._id).populate('userId', 'fullName email avatar');

        return populatedReview;
    }

    // Lấy danh sách đánh giá của một sân
    async getReviewsByField(fieldId, { page = 1, limit = 10 }) {
        const query = { fieldId, isVisible: true };

        const total = await modelReview.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const reviews = await modelReview
            .find(query)
            .populate('userId', 'fullName email avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Tính thống kê rating
        const stats = await modelReview.aggregate([
            { $match: { fieldId: require('mongoose').Types.ObjectId.createFromHexString(fieldId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                },
            },
        ]);

        return {
            reviews,
            stats: stats[0] || {
                averageRating: 0,
                totalReviews: 0,
                rating5: 0,
                rating4: 0,
                rating3: 0,
                rating2: 0,
                rating1: 0,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    // Kiểm tra user có thể đánh giá booking không
    async canReview(userId, bookingId) {
        // Check booking exists and is completed
        const booking = await modelBooking.findOne({
            bookingId,
            userId,
            status: 'completed',
        });

        if (!booking) {
            return { canReview: false, reason: 'Đơn đặt sân chưa hoàn thành' };
        }

        // Check if already reviewed
        const existingReview = await modelReview.findOne({ userId, bookingId });
        if (existingReview) {
            return { canReview: false, reason: 'Đã đánh giá', review: existingReview };
        }

        return { canReview: true };
    }

    // Cập nhật rating trung bình cho field
    async updateFieldAverageRating(fieldId) {
        const result = await modelReview.aggregate([
            { $match: { fieldId: require('mongoose').Types.ObjectId.createFromHexString(fieldId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const avgRating = result[0]?.averageRating || 0;
        const totalReviews = result[0]?.totalReviews || 0;

        await modelField.findByIdAndUpdate(fieldId, {
            rating: Math.round(avgRating * 10) / 10, // Làm tròn 1 chữ số thập phân
            totalReviews,
        });

        return { avgRating, totalReviews };
    }

    // Lấy review của user cho một booking
    async getUserReviewForBooking(userId, bookingId) {
        return await modelReview.findOne({ userId, bookingId }).populate('userId', 'fullName email avatar');
    }

    // Xóa review
    async deleteReview(reviewId, userId) {
        const review = await modelReview.findOne({ _id: reviewId, userId });
        if (!review) {
            throw new Error('Không tìm thấy đánh giá hoặc bạn không có quyền xóa');
        }

        const fieldId = review.fieldId;
        await modelReview.findByIdAndDelete(reviewId);

        // Cập nhật lại rating trung bình
        await this.updateFieldAverageRating(fieldId);

        return { deleted: true };
    }

    // [Admin] Reply to review
    async replyToReview(reviewId, content) {
        const review = await modelReview.findByIdAndUpdate(
            reviewId,
            {
                reply: {
                    content,
                    repliedAt: new Date(),
                },
            },
            { new: true },
        );

        if (!review) {
            throw new Error('Không tìm thấy đánh giá');
        }

        return review;
    }

    // Lấy tất cả đánh giá (cho trang chủ/feedback)
    async getAllReviews({ page = 1, limit = 10 }) {
        const query = { isVisible: true };

        const total = await modelReview.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const reviews = await modelReview
            .find(query)
            .populate('userId', 'fullName email avatar')
            .populate('fieldId', 'name address')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
}

module.exports = new ReviewService();
