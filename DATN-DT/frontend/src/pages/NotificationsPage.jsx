import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Context from '../store/Context';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../config/NotificationRequest';

const TYPE_LABELS = {
    booking_confirmed: { label: 'Xác nhận đặt sân', color: 'bg-green-100 text-green-700', icon: '✅' },
    booking_cancelled: { label: 'Huỷ đặt sân', color: 'bg-red-100 text-red-700', icon: '❌' },
    booking_reminder: { label: 'Nhắc nhở', color: 'bg-yellow-100 text-yellow-700', icon: '⏰' },
    promotion: { label: 'Khuyến mãi', color: 'bg-purple-100 text-purple-700', icon: '🎉' },
    system: { label: 'Hệ thống', color: 'bg-blue-100 text-blue-700', icon: '📢' },
};

function NotificationsPage() {
    const navigate = useNavigate();
    const { dataUser } = useContext(Context);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState('all');

    const fetchData = useCallback(async (page = 1) => {
        if (!dataUser?._id) return;
        setLoading(true);
        try {
            const res = await getNotifications(page, 15);
            if (res?.metadata) {
                setNotifications(res.metadata.notifications || []);
                setUnreadCount(res.metadata.unreadCount || 0);
                if (res.metadata.pagination) {
                    setPagination(res.metadata.pagination);
                }
            }
        } catch (error) {
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    }, [dataUser?._id]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            message.error('Không thể đánh dấu đã đọc');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            message.success('Đã đánh dấu tất cả đã đọc');
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            message.success('Đã xóa thông báo');
        } catch {
            message.error('Không thể xóa thông báo');
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const filtered = filterType === 'all'
        ? notifications
        : filterType === 'unread'
            ? notifications.filter((n) => !n.isRead)
            : notifications.filter((n) => n.type === filterType);

    if (!dataUser?._id) {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <p className="text-gray-500">Vui lòng đăng nhập để xem thông báo</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-[#16A34A] text-white font-medium rounded-xl hover:bg-[#15803d] transition-colors"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#DCFCE7] rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-[#16A34A]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-500">{unreadCount} chưa đọc</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchData(pagination.page)}
                            className="p-2 text-gray-500 hover:text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Làm mới"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#16A34A] bg-[#DCFCE7] hover:bg-[#bbf7d0] rounded-lg transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Đọc tất cả
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'unread', label: 'Chưa đọc' },
                        { key: 'promotion', label: '🎉 Khuyến mãi' },
                        { key: 'system', label: '📢 Hệ thống' },
                        { key: 'booking_confirmed', label: '✅ Xác nhận' },
                        { key: 'booking_reminder', label: '⏰ Nhắc nhở' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilterType(f.key)}
                            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                                filterType === f.key
                                    ? 'bg-[#16A34A] text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#16A34A] hover:text-[#16A34A]'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">Không có thông báo nào</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {filtered.map((n) => {
                                const typeInfo = TYPE_LABELS[n.type] || TYPE_LABELS.system;
                                return (
                                    <li
                                        key={n._id}
                                        className={`flex gap-4 px-5 py-4 transition-colors ${
                                            !n.isRead ? 'bg-[#f0fdf4]' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5 text-2xl leading-none">
                                            {typeInfo.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                </div>
                                                {!n.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-[#16A34A] rounded-full mt-1.5" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex-shrink-0 flex items-center gap-1">
                                            {!n.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(n._id)}
                                                    title="Đánh dấu đã đọc"
                                                    className="p-1.5 text-gray-400 hover:text-[#16A34A] hover:bg-[#DCFCE7] rounded-lg transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(n._id)}
                                                title="Xóa thông báo"
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-500">
                            {(pagination.page - 1) * pagination.limit + 1}–
                            {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} thông báo
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchData(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Trước
                            </button>
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchData(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
                            >
                                Sau <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default NotificationsPage;
