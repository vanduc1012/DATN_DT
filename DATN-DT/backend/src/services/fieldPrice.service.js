const modelFieldPrice = require('../models/fieldPrice.model');
const { ConflictRequestError } = require('../core/error.response');

// Chuyển "HH:MM" → số phút để so sánh overlap
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
}

class FieldPriceService {
    // Kiểm tra xung đột khung giờ trong bảng giá
    async checkPriceConflict(fieldId, dayOfWeek, startTime, endTime, excludeId = null) {
        const existing = await modelFieldPrice.find({ fieldId, dayOfWeek });

        const newStart = timeToMinutes(startTime);
        const newEnd   = timeToMinutes(endTime);

        for (const rec of existing) {
            // Bỏ qua chính bản ghi đang được update
            if (excludeId && rec._id.toString() === excludeId.toString()) continue;

            const recStart = timeToMinutes(rec.startTime);
            const recEnd   = timeToMinutes(rec.endTime);

            // Overlap: newStart < recEnd VÀ recStart < newEnd
            if (newStart < recEnd && recStart < newEnd) {
                throw new ConflictRequestError(
                    `Khung giờ ${startTime} - ${endTime} bị trùng với khung giờ đã có ${rec.startTime} - ${rec.endTime} trong ngày ${dayOfWeek}!`
                );
            }
        }
    }

    // Tạo giá mới
    async createFieldPrice({ fieldId, dayOfWeek, startTime, endTime, price }) {
        // Kiểm tra trùng trước khi tạo
        await this.checkPriceConflict(fieldId, dayOfWeek, startTime, endTime);

        const newFieldPrice = await modelFieldPrice.create({ fieldId, dayOfWeek, startTime, endTime, price });
        return newFieldPrice;
    }

    // Lấy tất cả giá theo sân
    async getFieldPrices(fieldId) {
        const prices = await modelFieldPrice.find({ fieldId }).sort({ dayOfWeek: 1, startTime: 1 });
        return prices;
    }

    // Lấy chi tiết một bản ghi giá
    async getFieldPriceById(id) {
        const price = await modelFieldPrice.findById(id);
        return price;
    }

    // Cập nhật giá
    async updateFieldPrice(id, { dayOfWeek, startTime, endTime, price }) {
        // Lấy record hiện tại để biết fieldId và loại trừ chính nó khi check
        const current = await modelFieldPrice.findById(id);
        if (!current) throw new ConflictRequestError('Không tìm thấy bản ghi giá');

        await this.checkPriceConflict(
            current.fieldId,
            dayOfWeek ?? current.dayOfWeek,
            startTime ?? current.startTime,
            endTime   ?? current.endTime,
            id // loại trừ chính record đang sửa
        );

        const updated = await modelFieldPrice.findByIdAndUpdate(
            id,
            { dayOfWeek, startTime, endTime, price },
            { new: true },
        );
        return updated;
    }

    // Xóa giá
    async deleteFieldPrice(id) {
        const deleted = await modelFieldPrice.findByIdAndDelete(id);
        return deleted;
    }
}

module.exports = new FieldPriceService();
