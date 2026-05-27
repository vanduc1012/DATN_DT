/**
 * SlotHoldingService - Quản lý các slot đang được giữ tạm thời
 * Sử dụng in-memory storage (có thể nâng cấp lên Redis cho production)
 */

// Format: { "fieldId_date_startTime": { socketId, userId, heldAt, expiresAt } }
const heldSlots = new Map();

// Thời gian giữ slot mặc định (5 phút - 300000ms)
const HOLD_DURATION = 5 * 60 * 1000;

// Cleanup interval (1 phút)
const CLEANUP_INTERVAL = 60 * 1000;

class SlotHoldingService {
    constructor() {
        // Chạy cleanup định kỳ để giải phóng các slot hết hạn
        this.cleanupInterval = setInterval(() => this.cleanupExpiredSlots(), CLEANUP_INTERVAL);
    }

    /**
     * Tạo key unique cho mỗi slot
     */
    getSlotKey(fieldId, date, startTime) {
        return `${fieldId}_${date}_${startTime}`;
    }

    /**
     * Giữ một hoặc nhiều slot
     * @returns {Object} { success: boolean, held: [], failed: [] }
     */
    holdSlots({ socketId, userId, fieldId, date, slots }) {
        const held = [];
        const failed = [];

        for (const slot of slots) {
            const key = this.getSlotKey(fieldId, date, slot.startTime);
            const existing = heldSlots.get(key);

            // Kiểm tra slot đã được giữ bởi người khác chưa
            if (existing && existing.socketId !== socketId) {
                // Kiểm tra xem có hết hạn chưa
                if (Date.now() < existing.expiresAt) {
                    failed.push({ ...slot, heldBy: 'other' });
                    continue;
                }
            }

            // Giữ slot
            heldSlots.set(key, {
                socketId,
                userId,
                fieldId,
                date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                heldAt: Date.now(),
                expiresAt: Date.now() + HOLD_DURATION,
            });
            held.push(slot);
        }

        return { success: failed.length === 0, held, failed };
    }

    /**
     * Giải phóng slot (khi user bỏ chọn hoặc rời trang)
     */
    releaseSlots({ socketId, fieldId, date, slots }) {
        const released = [];

        for (const slot of slots) {
            const key = this.getSlotKey(fieldId, date, slot.startTime);
            const existing = heldSlots.get(key);

            // Chỉ giải phóng nếu đúng socketId đang giữ
            if (existing && existing.socketId === socketId) {
                heldSlots.delete(key);
                released.push(slot);
            }
        }

        return released;
    }

    /**
     * Giải phóng tất cả slot của một socket (khi disconnect)
     */
    releaseAllBySocket(socketId) {
        const released = [];

        for (const [key, value] of heldSlots.entries()) {
            if (value.socketId === socketId) {
                released.push({
                    fieldId: value.fieldId,
                    date: value.date,
                    startTime: value.startTime,
                    endTime: value.endTime,
                });
                heldSlots.delete(key);
            }
        }

        return released;
    }

    /**
     * Lấy tất cả slots đang được giữ cho một sân + ngày
     */
    getHeldSlots(fieldId, date) {
        const result = [];

        for (const [key, value] of heldSlots.entries()) {
            if (value.fieldId === fieldId && value.date === date) {
                // Kiểm tra chưa hết hạn
                if (Date.now() < value.expiresAt) {
                    result.push({
                        startTime: value.startTime,
                        endTime: value.endTime,
                        socketId: value.socketId,
                        expiresAt: value.expiresAt,
                    });
                }
            }
        }

        return result;
    }

    /**
     * Cleanup các slot đã hết hạn
     */
    cleanupExpiredSlots() {
        const now = Date.now();
        const expired = [];

        for (const [key, value] of heldSlots.entries()) {
            if (now >= value.expiresAt) {
                expired.push({
                    fieldId: value.fieldId,
                    date: value.date,
                    startTime: value.startTime,
                    endTime: value.endTime,
                });
                heldSlots.delete(key);
            }
        }

        return expired;
    }

    /**
     * Xác nhận booking đã thành công (xóa khỏi held)
     */
    confirmBooking({ fieldId, date, slots }) {
        for (const slot of slots) {
            const key = this.getSlotKey(fieldId, date, slot.startTime);
            heldSlots.delete(key);
        }
    }
}

module.exports = new SlotHoldingService();
