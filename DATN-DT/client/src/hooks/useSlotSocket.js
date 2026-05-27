import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSlotSocket({ fieldId, date, onSlotsHeldByOthers, onSlotsReleased, onSlotsBooked }) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [heldByOthers, setHeldByOthers] = useState([]); // Slots đang bị người khác giữ

    useEffect(() => {
        if (!fieldId || !date) return;

        // Khởi tạo socket
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);

            // Join vào room của field + date
            socket.emit('join-field', { fieldId, date });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Nhận danh sách slots đang được giữ khi vừa join
        socket.on('held-slots', (data) => {
            const othersSlots = data.slots.filter((s) => !s.isHeldByMe);
            setHeldByOthers(othersSlots);
        });

        // Slots mới bị người khác giữ
        socket.on('slots-held-by-others', (data) => {
            setHeldByOthers((prev) => {
                const newSlots = data.slots.filter((s) => !prev.some((p) => p.startTime === s.startTime));
                return [...prev, ...newSlots];
            });
            onSlotsHeldByOthers?.(data.slots);
        });

        // Slots được giải phóng
        socket.on('slots-released', (data) => {
            setHeldByOthers((prev) => prev.filter((p) => !data.slots.some((s) => s.startTime === p.startTime)));
            onSlotsReleased?.(data.slots);
        });

        // Slots đã được đặt (booking confirmed)
        socket.on('slots-booked', (data) => {
            setHeldByOthers((prev) => prev.filter((p) => !data.slots.some((s) => s.startTime === p.startTime)));
            onSlotsBooked?.(data.slots);
        });

        // Kết quả hold
        socket.on('hold-result', (result) => {});

        return () => {
            socket.emit('leave-field');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [fieldId, date]);

    // Giữ slots
    const holdSlots = useCallback(
        (slots) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit('hold-slots', { fieldId, date, slots });
            }
        },
        [fieldId, date, isConnected],
    );

    // Giải phóng slots
    const releaseSlots = useCallback(
        (slots) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit('release-slots', { fieldId, date, slots });
            }
        },
        [fieldId, date, isConnected],
    );

    // Xác nhận booking
    const confirmBooking = useCallback(
        (slots) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit('booking-confirmed', { fieldId, date, slots });
            }
        },
        [fieldId, date, isConnected],
    );

    // Kiểm tra slot có bị người khác giữ không
    const isSlotHeldByOthers = useCallback(
        (startTime) => {
            return heldByOthers.some((s) => s.startTime === startTime);
        },
        [heldByOthers],
    );

    return {
        isConnected,
        heldByOthers,
        holdSlots,
        releaseSlots,
        confirmBooking,
        isSlotHeldByOthers,
    };
}
