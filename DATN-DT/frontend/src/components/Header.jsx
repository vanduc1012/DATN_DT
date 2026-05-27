import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut, Calendar, Bell, Check, Trash2 } from 'lucide-react';

import { useStore } from '../hooks/useStore';
import { useNotificationSocket } from '../hooks/useSocket';
import { getNotifications, markAsRead, markAllAsRead } from '../config/NotificationRequest';
import { requestLogout } from '../config/UserRequest';

function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const notificationRef = useRef(null);
    const location = useLocation();

    const { dataUser } = useStore();

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!dataUser?._id) return;
        try {
            setLoadingNotifications(true);
            const res = await getNotifications(1, 10);
            if (res?.metadata?.notifications) {
                setNotifications(res.metadata.notifications);
                setUnreadCount(res.metadata.unreadCount || 0);
            }
        } catch (error) {
            // Lỗi thường gặp sau F5 khi token vừa được refresh
            // Retry 1 lần sau 1 giây để đảm bảo token đã sẵn sàng
            setTimeout(async () => {
                try {
                    const res = await getNotifications(1, 10);
                    if (res?.metadata?.notifications) {
                        setNotifications(res.metadata.notifications);
                        setUnreadCount(res.metadata.unreadCount || 0);
                    }
                } catch (_) {
                    // Thực sự thất bại, giữ nguyên state
                }
            }, 1000);
        } finally {
            setLoadingNotifications(false);
        }
    }, [dataUser?._id]);

    // Handle new notification from Socket.IO
    const handleNewNotification = useCallback((notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 10));
        setUnreadCount((prev) => prev + 1);
    }, []);

    // Connect to socket for real-time notifications
    useNotificationSocket(handleNewNotification);

    // Fetch notifications on mount và khi dataUser thay đổi
    useEffect(() => {
        if (!dataUser?._id) return;
        // Delay nhỏ để đảm bảo token đã được set sau F5
        const timer = setTimeout(() => fetchNotifications(), 300);
        return () => clearTimeout(timer);
    }, [dataUser?._id, fetchNotifications]);

    // Polling 30 giây - đảm bảo luôn có dữ liệu mới sau F5
    useEffect(() => {
        if (!dataUser?._id) return;
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [dataUser?._id, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_confirmed':
                return '✅';
            case 'booking_cancelled':
                return '❌';
            case 'booking_reminder':
                return '⏰';
            case 'promotion':
                return '🎉';
            default:
                return '🔔';
        }
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    // Menu items
    const menuItems = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Danh sách sân', path: '/fields' },
        { name: 'Hướng dẫn', path: '/huong-dan' },
        { name: 'Liên hệ', path: '/lien-he' },
    ];

    // Check if current path is active
    const isActive = (path) => location.pathname === path;

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {}
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-[72px]">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        {/* AloBooking Logo */}
                        <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-lg">
                            <span className="font-bold text-white text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold text-[#16A34A] tracking-tight">
                            AloBooking
                        </span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchText.trim()) {
                                        navigate(`/fields?search=${encodeURIComponent(searchText.trim())}`);
                                        setSearchText('');
                                    }
                                }}
                                placeholder="Tìm kiếm sân bóng theo tên, địa điểm... (Enter để tìm)"
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
                                         placeholder:text-gray-400 
                                         focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] focus:bg-white
                                         transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search Icon */}

                        {/* Show different content based on login status */}
                        {dataUser?._id ? (
                            <>
                                {/* Notification - Only show when logged in */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className="relative p-2.5 text-gray-500 hover:text-[#16A34A] hover:bg-gray-50 rounded-lg transition-all duration-200"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {isNotificationOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
                                            {/* Header */}
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-[#16A34A] hover:underline"
                                                    >
                                                        Đánh dấu tất cả đã đọc
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notification List */}
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {loadingNotifications ? (
                                                    <div className="py-8 text-center text-gray-400">
                                                        <div className="animate-spin w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full mx-auto"></div>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-gray-400">
                                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p>Chưa có thông báo nào</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <div
                                                            key={notification._id}
                                                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                                !notification.isRead ? 'bg-green-50/50' : ''
                                                            }`}
                                                            onClick={() => {
                                                                if (!notification.isRead) {
                                                                    handleMarkAsRead(notification._id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex gap-3">
                                                                <span className="text-xl">
                                                                    {getNotificationIcon(notification.type)}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {formatTimeAgo(notification.createdAt)}
                                                                    </p>
                                                                </div>
                                                                {!notification.isRead && (
                                                                    <span className="w-2 h-2 bg-[#16A34A] rounded-full flex-shrink-0 mt-2"></span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                                                <Link
                                                    to="/notifications"
                                                    className="text-sm text-[#16A34A] font-medium hover:underline"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                >
                                                    Xem tất cả thông báo
                                                </Link>
                                                <Link
                                                    to="/profile?tab=history"
                                                    className="text-sm text-gray-400 hover:underline"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                >
                                                    Lịch sử đặt sân
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Dropdown - Only show when logged in */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2.5 p-1.5 pl-1.5 pr-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22c55e] flex items-center justify-center overflow-hidden">
                                            {dataUser?.avatar ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${dataUser.avatar}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* User Menu Dropdown */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {dataUser?.fullName || 'Người dùng'}
                                                </p>
                                                <p className="text-xs text-gray-500">{dataUser?.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1.5">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    Tài khoản của tôi
                                                </Link>
                                                <Link
                                                    to="/profile?tab=history"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Lịch đặt sân
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 py-1.5">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CTA Button - Only show when logged in */}
                                <Link
                                    to="/fields"
                                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white text-sm font-semibold rounded-lg
                                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                                             transition-all duration-200 ease-out active:scale-[0.98]"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Đặt sân ngay
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Login/Register Buttons - Show when NOT logged in */}
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#16A34A] transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white text-sm font-semibold rounded-lg
                                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                                             transition-all duration-200 ease-out active:scale-[0.98]"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay for closing dropdowns */}
            {(isSearchOpen || isUserMenuOpen) && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => {
                        setIsSearchOpen(false);
                        setIsUserMenuOpen(false);
                    }}
                />
            )}

            {/* Custom animation styles */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </header>
    );
}

export default Header;
