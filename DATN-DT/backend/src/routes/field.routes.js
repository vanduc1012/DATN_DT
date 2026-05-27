const express = require('express');
const router = express.Router();
const multer = require('multer');

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

const { asyncHandler, authAdmin } = require('../auth/checkAuth');
const fieldController = require('../controller/field.controller');

// Get all fields
router.get('/', asyncHandler(fieldController.getAllFields));

// Get field by ID
router.get('/:id', asyncHandler(fieldController.getFieldById));

// Create new field (Admin only)
router.post('/create', authAdmin, upload.array('images', 5), asyncHandler(fieldController.createField));

// Update field (Admin only)
router.put('/update/:id', authAdmin, upload.array('images', 5), asyncHandler(fieldController.updateField));

// Delete field (Admin only)
router.delete('/delete/:id', authAdmin, asyncHandler(fieldController.deleteField));

// Update field status (Admin only)
router.patch('/status/:id', authAdmin, asyncHandler(fieldController.updateFieldStatus));

module.exports = router;
