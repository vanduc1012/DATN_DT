const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const discountController = require('../controller/discount.controller');

// Public route - validate discount (user cần auth)
router.post('/validate', authUser, asyncHandler(discountController.validateDiscount));

// Lấy mã giảm giá phù hợp với đơn hàng (user)
router.get('/available', authUser, asyncHandler(discountController.getAvailableDiscounts));

// Admin routes (Admin only)
router.get('/', authAdmin, asyncHandler(discountController.getAllDiscounts));
router.get('/:id', authAdmin, asyncHandler(discountController.getDiscountById));
router.post('/create', authAdmin, asyncHandler(discountController.createDiscount));
router.put('/:id', authAdmin, asyncHandler(discountController.updateDiscount));
router.delete('/:id', authAdmin, asyncHandler(discountController.deleteDiscount));

module.exports = router;
