const { Server } = require('socket.io');
const slotHoldingService = require('../services/slotHolding.service');

let io = null;

function initSocket(server) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', process.env.URL_CLIENT].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        // User joins their personal notification room
        socket.on('join-user', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                socket.userId = userId;
            }
        });

        // Client tham gia vào room của một field + date cụ thể
        socket.on('join-field', ({ fieldId, date }) => {
            const room = `field_${fieldId}_${date}`;
            socket.join(room);
            socket.fieldRoom = room;
            socket.fieldId = fieldId;
            socket.fieldDate = date;

            // Gửi danh sách slots đang được giữ cho client mới
            const heldSlots = slotHoldingService.getHeldSlots(fieldId, date);
            socket.emit('held-slots', {
                fieldId,
                date,
                slots: heldSlots.map((s) => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isHeldByMe: s.socketId === socket.id,
                })),
            });
        });

        // Client rời khỏi room
        socket.on('leave-field', () => {
            if (socket.fieldRoom) {
                socket.leave(socket.fieldRoom);
            }
        });

        // Client giữ slots
        socket.on('hold-slots', ({ fieldId, date, slots }) => {
            const result = slotHoldingService.holdSlots({
                socketId: socket.id,
                userId: socket.userId,
                fieldId,
                date,
                slots,
            });

            // Thông báo cho client xem có giữ được không
            socket.emit('hold-result', {
                success: result.success,
                held: result.held,
                failed: result.failed,
            });

            // Broadcast cho tất cả clients khác trong room biết có slot mới được giữ
            if (result.held.length > 0) {
                const room = `field_${fieldId}_${date}`;
                socket.to(room).emit('slots-held-by-others', {
                    fieldId,
                    date,
                    slots: result.held,
                });
            }
        });

        // Client bỏ giữ slots (unselect)
        socket.on('release-slots', ({ fieldId, date, slots }) => {
            const released = slotHoldingService.releaseSlots({
                socketId: socket.id,
                fieldId,
                date,
                slots,
            });

            // Broadcast cho các clients khác biết slot đã được giải phóng
            if (released.length > 0) {
                const room = `field_${fieldId}_${date}`;
                socket.to(room).emit('slots-released', {
                    fieldId,
                    date,
                    slots: released,
                });
            }
        });

        // Booking thành công - giải phóng slots khỏi holding và đánh dấu đã đặt
        socket.on('booking-confirmed', ({ fieldId, date, slots }) => {
            slotHoldingService.confirmBooking({ fieldId, date, slots });

            // Broadcast cho tất cả clients trong room
            const room = `field_${fieldId}_${date}`;
            io.to(room).emit('slots-booked', {
                fieldId,
                date,
                slots,
            });
        });

        // Client disconnect
        socket.on('disconnect', () => {
            // Giải phóng tất cả slots mà client này đang giữ
            const released = slotHoldingService.releaseAllBySocket(socket.id);

            // Group released slots by fieldId + date và broadcast
            const grouped = {};
            for (const slot of released) {
                const key = `${slot.fieldId}_${slot.date}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        fieldId: slot.fieldId,
                        date: slot.date,
                        slots: [],
                    };
                }
                grouped[key].slots.push({
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                });
            }

            // Broadcast to each room
            for (const data of Object.values(grouped)) {
                const room = `field_${data.fieldId}_${data.date}`;
                io.to(room).emit('slots-released', data);
            }
        });
    });

    // Cleanup expired slots và broadcast định kỳ
    setInterval(() => {
        const expired = slotHoldingService.cleanupExpiredSlots();

        if (expired.length > 0) {
            // Group và broadcast
            const grouped = {};
            for (const slot of expired) {
                const key = `${slot.fieldId}_${slot.date}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        fieldId: slot.fieldId,
                        date: slot.date,
                        slots: [],
                    };
                }
                grouped[key].slots.push(slot);
            }

            for (const data of Object.values(grouped)) {
                const room = `field_${data.fieldId}_${data.date}`;
                io.to(room).emit('slots-released', data);
            }
        }
    }, 60000); // 1 minute

    return io;
}

function getIO() {
    return io;
}

module.exports = { initSocket, getIO };
