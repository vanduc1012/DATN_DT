const modelField = require('../models/field.model');
const modelFieldPrice = require('../models/fieldPrice.model');

class FieldService {
    // Create new field
    async createField(data) {
        const field = await modelField.create(data);
        return field;
    }

    // Get all fields
    async getAllFields(query = {}) {
        const { search, type, status, page = 1, limit = 10 } = query;

        const filter = {};

        // Search by name or address
        if (search) {
            filter.$or = [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }];
        }

        // Filter by type
        if (type) {
            filter.type = type;
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [fields, total] = await Promise.all([
            modelField.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            modelField.countDocuments(filter),
        ]);

        return {
            fields,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get field by ID
    async getFieldById(id) {
        const field = await modelField.findById(id);
        if (!field) {
            throw new Error('Không tìm thấy sân bóng');
        }
        return field;
    }

    // Update field
    async updateField(id, data) {
        const field = await modelField.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
        if (!field) {
            throw new Error('Không tìm thấy sân bóng');
        }
        return field;
    }

    // Delete field
    async deleteField(id) {
        const field = await modelField.findByIdAndDelete(id);
        if (!field) {
            throw new Error('Không tìm thấy sân bóng');
        }
        return field;
    }

    // Update field status
    async updateFieldStatus(id, status) {
        const field = await modelField.findByIdAndUpdate(id, { status }, { new: true });
        if (!field) {
            throw new Error('Không tìm thấy sân bóng');
        }
        return field;
    }

    async getFieldById(id) {
        const field = await modelField.findById(id);
        if (!field) {
            throw new Error('Không tìm thấy sân bóng');
        }
        const fieldPrice = await modelFieldPrice.find({ fieldId: id });
        return { field, fieldPrice };
    }
}

module.exports = new FieldService();
