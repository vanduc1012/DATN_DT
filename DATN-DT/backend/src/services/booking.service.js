const modelBooking = require('../models/booking.model');
const Field = require('../models/field.model');
const mongoose = require('mongoose');
const { ConflictRequestError, ForbiddenError, NotFoundError } = require('../core/error.response');

const crypto = require('crypto');
const https = require('https');

const NotificationService = require('./notification.service');
const DiscountService = require('./discount.service');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

function generatePayID() {
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

// Chuyển "HH:MM" sang số phút để so sánh dễ hơn
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
}

class BookingService {
    // ─── Kiểm tra xung đột khung giờ ───────────────────────────────────
    async checkSlotConflicts(fieldId, bookingDate, slots) {
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await modelBooking
            .find({
                fieldId,
                bookingDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ['cancelled'] },
            })
            .select('startTime endTime');

        for (const newSlot of slots) {
            const newStart = timeToMinutes(newSlot.startTime);
            const newEnd   = timeToMinutes(newSlot.endTime);

            for (const existing of existingBookings) {
                const existStart = timeToMinutes(existing.startTime);
                const existEnd   = timeToMinutes(existing.endTime);

                // Overlap: newStart < existEnd VÀ existStart < newEnd
                if (newStart < existEnd && existStart < newEnd) {
                    throw new ConflictRequestError(
                        `Khung giờ ${newSlot.startTime} - ${newSlot.endTime} đã trùng với khung giờ đã đặt ${existing.startTime} - ${existing.endTime}. Vui lòng chọn khung giờ khác!`
                    );
                }
            }
        }
    }

    async createBooking({
        bookingId,
        typePayment,
        userId,
        fieldId,
        bookingDate,
        slots,
        note,
        discountCode,
        discountAmount,
        finalPrice,
    }) {
        // ── Bước 1: Kiểm tra xung đột khung giờ TRƯỚC KHI làm bất cứ điều gì ──
        await this.checkSlotConflicts(fieldId, bookingDate, slots);

        // Calculate original total
        const originalPrice = slots.reduce((total, slot) => total + slot.price, 0);

        // Use finalPrice from client if discount applied, otherwise use original
        const totalPrice = finalPrice && finalPrice < originalPrice ? finalPrice : originalPrice;
        const actualDiscountAmount = discountAmount || originalPrice - totalPrice;

        // Prepare booking documents - mỗi slot giữ giá riêng, slot đầu lưu discount info
        const bookingDocs = slots.map((slot, index) => ({
            userId,
            fieldId,
            bookingId, // Save Group ID
            bookingDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            price: slot.price, // Giữ giá gốc của slot
            originalPrice: index === 0 ? originalPrice : null, // Tổng giá gốc (chỉ slot đầu)
            discountCode: index === 0 ? discountCode : null,
            discountAmount: index === 0 ? actualDiscountAmount : 0,
            status: 'pending',
            typePayment,
            note,
        }));

        if (typePayment === 'cash') {
            const result = await modelBooking.insertMany(bookingDocs);

            // Cập nhật lượt dùng mã giảm giá
            if (discountCode) {
                await DiscountService.useDiscount(discountCode, userId);
            }

            // Send notification for cash booking
            await this.sendBookingNotification(userId, fieldId, slots, bookingDate, 'pending');

            return result;
        } else if (typePayment === 'momo') {
            // Log bookings first
            await modelBooking.insertMany(bookingDocs);

            return new Promise(async (resolve, reject) => {
                const accessKey = 'F8BBA842ECF85';
                const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                const partnerCode = 'MOMO';
                const orderId = bookingId + generatePayID(); // Use the passed UUID as orderId
                const requestId = orderId;
                const orderInfo = `Thanh toan don hang ${bookingId}`;
                const redirectUrl = `http://localhost:5173/booking-success/${bookingId}`; // Redirect back to generic success page
                const ipnUrl = 'http://localhost:3000/api/payment/momo'; // Should serve via ngrok
                const requestType = 'payWithMethod';
                const amount = totalPrice.toString(); // Amount must be string (use discounted price)
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'San Bong ProMax',
                    storeId: 'SanBongProMax',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });
        } else if (typePayment === 'vnpay') {
            // Insert bookings vào DB trước (giống MoMo)
            await modelBooking.insertMany(bookingDocs);

            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                loggerFn: ignoreLogger,
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: totalPrice,
                vnp_IpAddr: '127.0.0.1',
                vnp_TxnRef: `${bookingId}${generatePayID()}`, // Fixed: remove space and +
                vnp_OrderInfo: `Thanh toan don hang ${bookingId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:5173/booking-success/${bookingId}`, // Redirect về frontend
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });

            return vnpayResponse;
        }
    }

    async getBookingById(id) {
        // Nếu là ID Mongo (ObjectID 24 chars) -> Tìm 1
        if (mongoose.Types.ObjectId.isValid(id)) {
            const booking = await modelBooking
                .findById(id)
                .populate('fieldId', 'name address images type')
                .populate('userId', 'name email phone');

            if (!booking) {
                throw new Error('Không tìm thấy đơn đặt sân');
            }
            return booking;
        } else {
            // Nếu là UUID -> Tìm theo group bookingId
            const bookings = await modelBooking
                .find({ bookingId: id })
                .populate('fieldId', 'name address images type')
                .populate('userId', 'name email phone');

            if (!bookings || bookings.length === 0) {
                throw new Error('Không tìm thấy đơn đặt sân');
            }
            // Trả về mảng hoặc object chứa mảng
            return { isGroup: true, bookings };
        }
    }

    async getBookingsByField(fieldId, date) {
        // Tạo range query: đầu ngày đến cuối ngày
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await modelBooking
            .find({
                fieldId,
                bookingDate: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
                status: { $ne: 'cancelled' }, // Lấy tất cả trừ cancelled
            })
            .select('startTime endTime status');

        return bookings;
    }

    async momoCallback(bookingId) {
        try {
            // Update trạng thái thanh toán thành công cho tất cả các slot trong đơn hàng
            const result = await modelBooking.updateMany(
                { bookingId: bookingId },
                {
                    $set: {
                        status: 'paid',
                        typePayment: 'momo',
                    },
                },
            );

            // Get booking details and send notification
            const bookings = await modelBooking.find({ bookingId }).populate('fieldId', 'name');
            if (bookings.length > 0) {
                const booking = bookings[0];
                const slots = bookings.map((b) => ({ startTime: b.startTime, endTime: b.endTime }));

                // Cập nhật lượt dùng mã giảm giá khi thanh toán MoMo thành công
                if (booking.discountCode) {
                    await DiscountService.useDiscount(booking.discountCode, booking.userId).catch(() => {});
                }

                await this.sendBookingNotification(
                    booking.userId,
                    booking.fieldId._id,
                    slots,
                    booking.bookingDate,
                    'paid',
                    booking.fieldId.name,
                );
            }

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
            throw error;
        }
    }

    async vnpayCallback(bookingId) {
        try {
            // Update trạng thái thanh toán thành công cho tất cả các slot trong đơn hàng
            const result = await modelBooking.updateMany(
                { bookingId: bookingId },
                {
                    $set: {
                        status: 'paid',
                        typePayment: 'vnpay',
                    },
                },
            );

            // Get booking details and send notification
            const bookings = await modelBooking.find({ bookingId }).populate('fieldId', 'name');
            if (bookings.length > 0) {
                const booking = bookings[0];
                const slots = bookings.map((b) => ({ startTime: b.startTime, endTime: b.endTime }));

                // Cập nhật lượt dùng mã giảm giá khi thanh toán VNPay thành công
                if (booking.discountCode) {
                    await DiscountService.useDiscount(booking.discountCode, booking.userId).catch(() => {});
                }

                await this.sendBookingNotification(
                    booking.userId,
                    booking.fieldId._id,
                    slots,
                    booking.bookingDate,
                    'paid',
                    booking.fieldId.name,
                );
            }

            return result;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
            throw error;
        }
    }

    async getBookingsByUser(userId) {
        const bookings = await modelBooking
            .find({ userId })
            .populate('fieldId', 'name address images type')
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
        return bookings;
    }

    // Admin: Get all bookings với filter và phân trang
    async getAllBookingsAdmin({ page = 1, limit = 10, status, search, startDate, endDate }) {
        const query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by date range
        if (startDate && endDate) {
            query.bookingDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Đếm tổng số records
        let totalQuery = modelBooking.find(query);

        // Nếu có search, cần populate trước rồi filter
        // Tuy nhiên MongoDB không hỗ trợ search on populated fields trực tiếp
        // Workaround: query tất cả rồi filter, hoặc dùng aggregation
        // Đơn giản: bỏ qua search on user/field name, chỉ search bookingId
        if (search) {
            query.$or = [{ bookingId: { $regex: search, $options: 'i' } }];
        }

        const total = await modelBooking.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const bookings = await modelBooking
            .find(query)
            .populate('fieldId', 'name address images type')
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    async findBookingForUpdate(id) {
        let booking = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            booking = await modelBooking
                .findById(id)
                .populate('fieldId', 'name address')
                .populate('userId', 'fullName email');
        }

        if (!booking) {
            const groupBooking = await modelBooking
                .findOne({ bookingId: id })
                .populate('fieldId', 'name address')
                .populate('userId', 'fullName email');
            if (groupBooking) booking = groupBooking;
        }

        return booking;
    }

    async cancelBooking(id, userId, isAdmin = false) {
        const booking = await this.findBookingForUpdate(id);
        if (!booking) {
            throw new NotFoundError('Không tìm thấy đơn đặt sân');
        }

        if (!isAdmin && String(booking.userId._id || booking.userId) !== String(userId)) {
            throw new ForbiddenError('Bạn không có quyền hủy đơn đặt sân này');
        }

        const query = booking.bookingId ? { bookingId: booking.bookingId } : { _id: booking._id };

        const updateResult = await modelBooking.updateMany(query, {
            status: 'cancelled',
        });

        if (updateResult.matchedCount === 0) {
            throw new NotFoundError('Không tìm thấy đơn đặt sân');
        }

        const updatedBooking = await modelBooking
            .findOne(query)
            .populate('fieldId', 'name address')
            .populate('userId', 'fullName email');

        await this.sendStatusUpdateNotification(updatedBooking, 'cancelled');

        return updatedBooking;
    }

    // Admin: Update booking status
    async updateBookingStatus(bookingId, status) {
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const booking = await this.findBookingForUpdate(bookingId);
        if (!booking) {
            throw new NotFoundError('Không tìm thấy đơn hàng');
        }

        const query = booking.bookingId ? { bookingId: booking.bookingId } : { _id: booking._id };

        const updateResult = await modelBooking.updateMany(query, { status });
        if (updateResult.matchedCount === 0) {
            throw new NotFoundError('Không tìm thấy đơn hàng');
        }

        const updatedBooking = await modelBooking
            .findOne(query)
            .populate('fieldId', 'name address')
            .populate('userId', 'fullName email');

        await this.sendStatusUpdateNotification(updatedBooking, status);

        return updatedBooking;
    }

    // Helper: Send booking notification
    async sendBookingNotification(userId, fieldId, slots, bookingDate, status, fieldName = null) {
        try {
            // Get field name if not provided
            if (!fieldName) {
                const field = await Field.findById(fieldId);
                fieldName = field?.name || 'Sân bóng';
            }

            const timeSlots = slots.map((s) => `${s.startTime} - ${s.endTime}`).join(', ');
            const dateStr = new Date(bookingDate).toLocaleDateString('vi-VN');

            let title, message, type;

            if (status === 'paid') {
                type = 'booking_confirmed';
                title = '🎉 Đặt sân thành công!';
                message = `Bạn đã đặt sân ${fieldName} thành công! Khung giờ: ${timeSlots} ngày ${dateStr}. Chúc bạn có trận đấu vui vẻ!`;
            } else {
                type = 'system';
                title = '📋 Đơn đặt sân mới';
                message = `Đơn đặt sân ${fieldName} của bạn đang chờ xử lý. Khung giờ: ${timeSlots} ngày ${dateStr}.`;
            }

            await NotificationService.createNotification({
                userId,
                type,
                title,
                message,
                data: { fieldId, bookingDate, slots },
            });
        } catch (error) {
            console.error('Error sending booking notification:', error);
            // Don't throw - notification failure shouldn't break booking
        }
    }

    // Helper: Send status update notification
    async sendStatusUpdateNotification(booking, status) {
        try {
            const fieldName = booking.fieldId?.name || 'Sân bóng';
            const dateStr = new Date(booking.bookingDate).toLocaleDateString('vi-VN');
            const timeSlot = `${booking.startTime} - ${booking.endTime}`;

            let title, message, type;

            switch (status) {
                case 'confirmed':
                    type = 'booking_confirmed';
                    title = '✅ Đơn đặt sân đã được xác nhận';
                    message = `Đơn đặt sân ${fieldName} lúc ${timeSlot} ngày ${dateStr} đã được xác nhận!`;
                    break;
                case 'cancelled':
                    type = 'booking_cancelled';
                    title = '❌ Đơn đặt sân đã bị hủy';
                    message = `Đơn đặt sân ${fieldName} lúc ${timeSlot} ngày ${dateStr} đã bị hủy.`;
                    break;
                case 'completed':
                    type = 'system';
                    title = '🏆 Hoàn thành trận đấu!';
                    message = `Cảm ơn bạn đã sử dụng dịch vụ tại ${fieldName}. Hãy để lại đánh giá nhé!`;
                    break;
                default:
                    return; // Don't send notification for other statuses
            }

            await NotificationService.createNotification({
                userId: booking.userId._id || booking.userId,
                type,
                title,
                message,
                data: { bookingId: booking._id, fieldId: booking.fieldId._id },
            });
        } catch (error) {
            console.error('Error sending status notification:', error);
        }
    }
}

module.exports = new BookingService();
