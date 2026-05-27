const discountService = require('../services/discount.service');
const { OK, Created } = require('../core/success.response');

class DiscountController {
    // Tạo mã giảm giá
    async createDiscount(req, res) {
        const discount = await discountService.createDiscount(req.body);
        return new Created({
            message: 'Tạo mã giảm giá thành công',
            metadata: discount,
        }).send(res);
    }

    // Lấy tất cả mã giảm giá
    async getAllDiscounts(req, res) {
        const { page, limit, search, status } = req.query;
        const result = await discountService.getAllDiscounts({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search,
            status,
        });
        return new OK({
            message: 'Lấy danh sách mã giảm giá thành công',
            metadata: result,
        }).send(res);
    }

    // Lấy chi tiết mã giảm giá
    async getDiscountById(req, res) {
        const discount = await discountService.getDiscountById(req.params.id);
        return new OK({
            message: 'Lấy chi tiết mã giảm giá thành công',
            metadata: discount,
        }).send(res);
    }

    // Cập nhật mã giảm giá
    async updateDiscount(req, res) {
        const discount = await discountService.updateDiscount(req.params.id, req.body);
        return new OK({
            message: 'Cập nhật mã giảm giá thành công',
            metadata: discount,
        }).send(res);
    }

    // Xóa mã giảm giá
    async deleteDiscount(req, res) {
        await discountService.deleteDiscount(req.params.id);
        return new OK({
            message: 'Xóa mã giảm giá thành công',
        }).send(res);
    }

    // Validate mã giảm giá (cho user checkout)
    async validateDiscount(req, res) {
        const { code, orderValue, fieldId } = req.body;
        const userId = req.user?.id;

        const result = await discountService.validateDiscount(code, userId, orderValue, fieldId);
        return new OK({
            message: 'Mã giảm giá hợp lệ',
            metadata: {
                code: result.discount.code,
                name: result.discount.name,
                type: result.discount.type,
                value: result.discount.value,
                discountAmount: result.discountAmount,
                finalPrice: result.finalPrice,
            },
        }).send(res);
    }

    // Lấy danh sách mã phù hợp với đơn hàng hiện tại
    async getAvailableDiscounts(req, res) {
        const { orderValue, fieldId } = req.query;
        const userId = req.user?.id;

        const result = await discountService.getAvailableDiscounts(
            userId,
            parseFloat(orderValue) || 0,
            fieldId || null
        );
        return new OK({
            message: 'Lấy danh sách mã giảm giá thành công',
            metadata: result,
        }).send(res);
    }
}

module.exports = new DiscountController();
