const reviewService = require('./review.service');
const { success, paginated } = require('../../utils/response');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.params.pitchId, req.body, req.user.id);
    return success(res, review, 'Đánh giá thành công', 201);
  } catch (err) {
    next(err);
  }
};

const getPitchReviews = async (req, res, next) => {
  try {
    const { pitch, reviews, pagination: pg } = await reviewService.getPitchReviews(
      req.params.pitchId,
      req.query,
    );
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: { pitch, reviews },
      pagination: pg,
    });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
    return success(res, null, 'Xóa đánh giá thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getPitchReviews, deleteReview };
