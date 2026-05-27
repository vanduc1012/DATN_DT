import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useStore } from './useStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const { dataUser } = useStore();

    useEffect(() => {
        // Only connect if user is logged in
        if (!dataUser?._id) {
            return;
        }

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            // Join user's personal notification room
            socket.emit('join-user', dataUser._id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Cleanup on unmount or user change
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [dataUser?._id]);

    return {
        socket: socketRef.current,
        isConnected,
    };
}

// Hook specifically for notification events
export function useNotificationSocket(onNewNotification) {
    const { socket, isConnected } = useSocket();
    // Dùng ref để tránh dependency thay đổi mỗi render → miss event
    const callbackRef = useRef(onNewNotification);
    useEffect(() => {
        callbackRef.current = onNewNotification;
    });

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewNotification = (notification) => {
            if (callbackRef.current) {
                callbackRef.current(notification);
            }
        };

        socket.on('new-notification', handleNewNotification);

        return () => {
            socket.off('new-notification', handleNewNotification);
        };
    // Chỉ re-subscribe khi socket hoặc isConnected thay đổi, không phải callback
    }, [socket, isConnected]);

    return { socket, isConnected };
}
