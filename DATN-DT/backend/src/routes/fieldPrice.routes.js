const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin } = require('../auth/checkAuth');
const fieldPriceController = require('../controller/fieldPrice.controller');

// Get all prices by field ID
router.get('/:fieldId', asyncHandler(fieldPriceController.getFieldPrices));

// Get price by ID
router.get('/detail/:id', asyncHandler(fieldPriceController.getFieldPriceById));

// Create new price (Admin only)
router.post('/create', asyncHandler(fieldPriceController.createFieldPrice));

// Update price (Admin only)
router.put('/update/:id', authAdmin, asyncHandler(fieldPriceController.updateFieldPrice));

// Delete price (Admin only)
router.delete('/delete/:id', authAdmin, asyncHandler(fieldPriceController.deleteFieldPrice));

module.exports = router;
