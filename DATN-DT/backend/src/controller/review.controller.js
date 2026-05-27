const reviewService = require('../services/review.service');
const { OK, Created } = require('../core/success.response');

class ReviewController {
    // Tạo đánh giá
    async createReview(req, res) {
        const { fieldId, bookingId, rating, comment, images } = req.body;
        const userId = req.user.id;

        const review = await reviewService.createReview({
            userId,
            fieldId,
            bookingId,
            rating,
            comment,
            images,
        });

        return new Created({
            message: 'Đánh giá thành công!',
            metadata: review,
        }).send(res);
    }

    // Lấy đánh giá của một sân
    async getReviewsByField(req, res) {
        const { fieldId } = req.params;
        const { page, limit } = req.query;

        const result = await reviewService.getReviewsByField(fieldId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });

        return new OK({
            message: 'Lấy danh sách đánh giá thành công',
            metadata: result,
        }).send(res);
    }

    // Kiểm tra có thể đánh giá không
    async canReview(req, res) {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const result = await reviewService.canReview(userId, bookingId);

        return new OK({
            message: 'Kiểm tra quyền đánh giá',
            metadata: result,
        }).send(res);
    }

    // Lấy review của user cho booking
    async getUserReviewForBooking(req, res) {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const review = await reviewService.getUserReviewForBooking(userId, bookingId);

        return new OK({
            message: 'Lấy đánh giá của bạn',
            metadata: review,
        }).send(res);
    }

    // Xóa đánh giá
    async deleteReview(req, res) {
        const { reviewId } = req.params;
        const userId = req.user.id;

        await reviewService.deleteReview(reviewId, userId);

        return new OK({
            message: 'Xóa đánh giá thành công',
        }).send(res);
    }

    // [Admin] Reply
    async replyToReview(req, res) {
        const { reviewId } = req.params;
        const { content } = req.body;

        const review = await reviewService.replyToReview(reviewId, content);

        return new OK({
            message: 'Trả lời đánh giá thành công',
            metadata: review,
        }).send(res);
    }

    // Lấy tất cả đánh giá
    async getAllReviews(req, res) {
        const { page, limit } = req.query;

        const result = await reviewService.getAllReviews({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });

        return new OK({
            message: 'Lấy danh sách đánh giá thành công',
            metadata: result,
        }).send(res);
    }
}

module.exports = new ReviewController();
