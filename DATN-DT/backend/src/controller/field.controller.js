const fieldService = require('../services/field.service');
const { uploadMultiple, deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinaryUpload');

const { OK } = require('../core/success.response');

class FieldController {
    // Create new field
    async createField(req, res) {
        const { name, type, description, address, status } = req.body;

        // Upload images to Cloudinary
        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadMultiple(req.files, 'fields');
        }

        const field = await fieldService.createField({
            name,
            type,
            description,
            images,
            address,
            status: status || 'active',
        });

        // return res.status(201).json({
        //     message: 'Thêm sân bóng thành công',
        //     metadata: field,
        // });
        return new OK({
            message: 'Thêm sân bóng thành công',
            metadata: field,
        }).send(res);
    }

    // Get all fields
    async getAllFields(req, res) {
        const result = await fieldService.getAllFields(req.query);

        return new OK({
            message: 'Lấy danh sách sân bóng thành công',
            metadata: result,
        }).send(res);
    }

    // Get field by ID
    async getFieldById(req, res) {
        const field = await fieldService.getFieldById(req.params.id);

        return new OK({
            message: 'Lấy thông tin sân bóng thành công',
            metadata: field,
        }).send(res);
    }

    // Update field
    async updateField(req, res) {
        const { name, type, description, address, status, existingImages } = req.body;

        // Get current field (get raw field data only)
        const { field: currentField } = await fieldService.getFieldById(req.params.id);

        // Upload new images if any
        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = await uploadMultiple(req.files, 'fields');
        }

        // Parse existing images (from frontend)
        let keepImages = [];
        if (existingImages) {
            // existingImages có thể gửi lên là mảng string hoặc string (nếu 1 ảnh)
            if (typeof existingImages === 'string') {
                try {
                    keepImages = JSON.parse(existingImages);
                } catch (e) {
                    keepImages = [existingImages];
                }
            } else if (Array.isArray(existingImages)) {
                keepImages = existingImages;
            } else {
                keepImages = [existingImages];
            }
        }

        // Delete removed images from Cloudinary
        // currentField.images có thể là []
        if (currentField.images && currentField.images.length > 0) {
            const imagesToDelete = currentField.images.filter((img) => !keepImages.includes(img));
            for (const img of imagesToDelete) {
                const publicId = getPublicIdFromUrl(img);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            }
        }

        // Combine existing and new images
        const images = [...keepImages, ...newImages];

        const field = await fieldService.updateField(req.params.id, {
            name,
            type,
            description,
            images,
            address,
            status,
        });

        return new OK({
            message: 'Cập nhật sân bóng thành công',
            metadata: field,
        }).send(res);
    }

    // Delete field
    async deleteField(req, res) {
        const { field } = await fieldService.getFieldById(req.params.id);

        // Delete images from Cloudinary
        if (field.images && field.images.length > 0) {
            for (const img of field.images) {
                const publicId = getPublicIdFromUrl(img);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            }
        }

        await fieldService.deleteField(req.params.id);

        return new OK({
            message: 'Xoá sân bóng thành công',
        }).send(res);
    }

    // Update field status
    async updateFieldStatus(req, res) {
        const { status } = req.body;
        const field = await fieldService.updateFieldStatus(req.params.id, status);

        return new OK({
            message: 'Cập nhật trạng thái thành công',
            metadata: field,
        }).send(res);
    }
}

module.exports = new FieldController();
