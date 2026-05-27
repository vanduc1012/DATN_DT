const fieldPriceService = require('../services/fieldPrice.service');

const { OK } = require('../core/success.response');

class fieldPriceController {
    // Tạo giá mới
    async createFieldPrice(req, res) {
        const { fieldId, dayOfWeek, startTime, endTime, price } = req.body;
        const fieldPrice = await fieldPriceService.createFieldPrice({ fieldId, dayOfWeek, startTime, endTime, price });
        return new OK({
            message: 'Tạo giá sân bóng thành công',
            metadata: fieldPrice,
        }).send(res);
    }

    // Lấy tất cả giá theo sân
    async getFieldPrices(req, res) {
        const { fieldId } = req.params;
        const prices = await fieldPriceService.getFieldPrices(fieldId);
        return new OK({
            message: 'Lấy danh sách giá thành công',
            metadata: prices,
        }).send(res);
    }

    // Lấy chi tiết một bản ghi giá
    async getFieldPriceById(req, res) {
        const { id } = req.params;
        const price = await fieldPriceService.getFieldPriceById(id);
        return new OK({
            message: 'Lấy chi tiết giá thành công',
            metadata: price,
        }).send(res);
    }

    // Cập nhật giá
    async updateFieldPrice(req, res) {
        const { id } = req.params;
        const { dayOfWeek, startTime, endTime, price } = req.body;
        const updated = await fieldPriceService.updateFieldPrice(id, { dayOfWeek, startTime, endTime, price });
        return new OK({
            message: 'Cập nhật giá thành công',
            metadata: updated,
        }).send(res);
    }

    // Xóa giá
    async deleteFieldPrice(req, res) {
        const { id } = req.params;
        const deleted = await fieldPriceService.deleteFieldPrice(id);
        return new OK({
            message: 'Xóa giá thành công',
            metadata: deleted,
        }).send(res);
    }
}

module.exports = new fieldPriceController();
