const express = require('express');
const router = express.Router();
const Joi = require('joi');
const reviewController = require('./review.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');

const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'any.required': 'Điểm đánh giá là bắt buộc (1-5)',
    'number.min': 'Điểm tối thiểu là 1',
    'number.max': 'Điểm tối đa là 5',
  }),
  comment: Joi.string().max(1000).optional(),
});

// GET  /api/reviews/:pitchId (public)
router.get('/:pitchId', reviewController.getPitchReviews);

// POST /api/reviews/:pitchId (user đã hoàn thành booking)
router.post('/:pitchId', authenticate, validate(createReviewSchema), reviewController.createReview);

// DELETE /api/reviews/:id (user xóa review của mình, admin xóa bất kỳ)
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
