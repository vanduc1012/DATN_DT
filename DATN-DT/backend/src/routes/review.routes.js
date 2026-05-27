const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');
const reviewController = require('../controller/review.controller');

// Public - Lấy tất cả đánh giá
router.get('/all', asyncHandler(reviewController.getAllReviews));

// Public - Lấy đánh giá của sân
router.get('/field/:fieldId', asyncHandler(reviewController.getReviewsByField));

// User routes - cần auth
router.post('/create', authUser, asyncHandler(reviewController.createReview));
router.get('/can-review/:bookingId', authUser, asyncHandler(reviewController.canReview));
router.get('/my-review/:bookingId', authUser, asyncHandler(reviewController.getUserReviewForBooking));
router.delete('/:reviewId', authUser, asyncHandler(reviewController.deleteReview));

// Admin route
router.post('/:reviewId/reply', authUser, asyncHandler(reviewController.replyToReview));

module.exports = router;
