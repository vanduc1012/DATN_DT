const bookingService = require('../services/booking.service');

const { OK, Created } = require('../core/success.response');

class BookingController {
    async createBooking(req, res) {
        const { bookingId, typePayment, fieldId, bookingDate, slots, note, discountCode, discountAmount, finalPrice } =
            req.body;
        const userId = req.user.id;
        const booking = await bookingService.createBooking({
            bookingId,
            typePayment,
            userId,
            fieldId,
            bookingDate,
            slots, // Array of {startTime, endTime, price}
            note,
            discountCode,
            discountAmount,
            finalPrice,
        });
        return new Created({
            message: 'Create booking successfully',
            metadata: booking,
        }).send(res);
    }

    async getBookingById(req, res) {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id);
        return new OK({
            message: 'Lấy thông tin đơn đặt sân thành công',
            metadata: booking,
        }).send(res);
    }

    async getBookingsByField(req, res) {
        const { fieldId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Missing date parameter' });
        }

        const bookings = await bookingService.getBookingsByField(fieldId, date);
        return new OK({
            message: 'Lấy danh sách đặt sân thành công',
            metadata: bookings,
        }).send(res);
    }

    async verifyMomoPayment(req, res) {
        const { bookingId } = req.params;
        // Trong thực tế nên verify signature từ MoMo trước
        const result = await bookingService.momoCallback(bookingId);
        return new OK({
            message: 'Xác thực thanh toán thành công',
            metadata: result,
        }).send(res);
    }

    async verifyVnpayPayment(req, res) {
        const { bookingId } = req.params;
        const result = await bookingService.vnpayCallback(bookingId);
        return new OK({
            message: 'Xác thực thanh toán thành công',
            metadata: result,
        }).send(res);
    }

    async getMyBookings(req, res) {
        const userId = req.user.id;
        const bookings = await bookingService.getBookingsByUser(userId);
        return new OK({
            message: 'Lấy lịch sử đặt sân thành công',
            metadata: bookings,
        }).send(res);
    }

    async cancelBooking(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        const booking = await bookingService.cancelBooking(id, userId);
        return new OK({
            message: 'Hủy đơn đặt sân thành công',
            metadata: booking,
        }).send(res);
    }

    async cancelBookingAdmin(req, res) {
        const { id } = req.params;
        const booking = await bookingService.cancelBooking(id, null, true);
        return new OK({
            message: 'Hủy đơn đặt sân thành công',
            metadata: booking,
        }).send(res);
    }

    // Admin: Get all bookings with filters
    async getAllBookingsAdmin(req, res) {
        const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
        const result = await bookingService.getAllBookingsAdmin({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            search,
            startDate,
            endDate,
        });
        return new OK({
            message: 'Lấy danh sách đơn hàng thành công',
            metadata: result,
        }).send(res);
    }

    // Admin: Update booking status
    async updateBookingStatusAdmin(req, res) {
        const { bookingId } = req.params;
        const { status } = req.body;
        const result = await bookingService.updateBookingStatus(bookingId, status);
        return new OK({
            message: 'Cập nhật trạng thái thành công',
            metadata: result,
        }).send(res);
    }
}

module.exports = new BookingController();
