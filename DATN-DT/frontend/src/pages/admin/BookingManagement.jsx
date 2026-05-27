import { useState, useEffect } from 'react';
import { Search, Eye, Filter, RefreshCw, CheckCircle, XCircle, Clock, Banknote } from 'lucide-react';
import { message, Modal, Select, DatePicker, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { getAllBookings, updateBookingStatus } from '../../config/BookingRequest';

const { RangePicker } = DatePicker;

function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Detail modal
    const [detailModal, setDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Status config
    const statusConfig = {
        pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
        in_progress: { label: 'Đang bắt đầu', color: 'bg-purple-100 text-purple-700', icon: Clock },
        completed: { label: 'Đã xong', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    };

    // Payment method labels
    const paymentLabels = {
        cash: { label: 'Tiền mặt', icon: Banknote },
        momo: { label: 'MoMo', icon: null },
        vnpay: { label: 'VNPay', icon: null },
    };

    // Fetch bookings
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await getAllBookings(params);
            setBookings(response.metadata.bookings || []);
            if (response.metadata.pagination) {
                setPagination(response.metadata.pagination);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [pagination.page, statusFilter]);

    // Handle search
    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchBookings();
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Format datetime
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return `${formatDate(dateStr)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Handle status change
    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await updateBookingStatus(bookingId, newStatus);
            message.success('Cập nhật trạng thái thành công!');
            fetchBookings();
            if (selectedBooking && selectedBooking._id === bookingId) {
                setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // View detail
    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setDetailModal(true);
    };

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'pending').length,
        confirmed: bookings.filter((b) => b.status === 'confirmed').length,
        in_progress: bookings.filter((b) => b.status === 'in_progress').length,
        completed: bookings.filter((b) => b.status === 'completed').length,
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-gray-500 mt-1">Quản lý và theo dõi các đơn đặt sân</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Chờ xác nhận</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã xác nhận</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã xong</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn, tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="min-w-[150px]"
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'pending', label: 'Chờ xác nhận' },
                            { value: 'confirmed', label: 'Đã xác nhận' },
                            { value: 'in_progress', label: 'Đang bắt đầu' },
                            { value: 'completed', label: 'Đã xong' },
                        ]}
                    />

                    {/* Date Range */}
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        className="min-w-[250px]"
                    />

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2.5 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Lọc
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Mã đơn</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Khách hàng</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Sân</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Ngày đặt</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Khung giờ</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Thanh toán</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Tổng tiền</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full mx-auto"></div>
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12 text-gray-500">
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr
                                        key={booking._id}
                                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="font-mono font-semibold text-gray-900">
                                                #{booking._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {booking.userId?.fullName || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">{booking.userId?.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-gray-900">
                                                {booking.fieldId?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-gray-600">{formatDate(booking.bookingDate)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-gray-600">
                                                {booking.startTime} - {booking.endTime}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-600">
                                                {paymentLabels[booking.typePayment]?.label || booking.typePayment}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-[#16A34A]">
                                                {formatPrice(booking.price)}đ
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Select
                                                value={booking.status}
                                                onChange={(value) => handleStatusChange(booking._id, value)}
                                                size="small"
                                                className="min-w-[130px]"
                                                options={[
                                                    { value: 'pending', label: 'Chờ xác nhận' },
                                                    { value: 'confirmed', label: 'Đã xác nhận' },
                                                    { value: 'in_progress', label: 'Đang diễn ra' },
                                                    { value: 'completed', label: 'Đã xong' },
                                                ]}
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <Tooltip title="Xem chi tiết">
                                                <button
                                                    onClick={() => handleViewDetail(booking)}
                                                    className="p-2 text-gray-500 hover:text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} đơn
                            hàng
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 text-sm">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <span>Chi tiết đơn hàng</span>
                        {selectedBooking && (
                            <span className="font-mono text-[#16A34A]">
                                #{selectedBooking._id.slice(-8).toUpperCase()}
                            </span>
                        )}
                    </div>
                }
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={600}
            >
                {selectedBooking && (
                    <div className="space-y-6 py-4">
                        {/* Customer Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Họ tên:</span>
                                    <span className="font-medium">{selectedBooking.userId?.fullName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email:</span>
                                    <span className="font-medium">{selectedBooking.userId?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số điện thoại:</span>
                                    <span className="font-medium">{selectedBooking.userId?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Thông tin đặt sân</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sân:</span>
                                    <span className="font-medium">{selectedBooking.fieldId?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Địa chỉ:</span>
                                    <span className="font-medium">{selectedBooking.fieldId?.address}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngày đặt:</span>
                                    <span className="font-medium">{formatDate(selectedBooking.bookingDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Khung giờ:</span>
                                    <span className="font-medium text-[#16A34A]">
                                        {selectedBooking.startTime} - {selectedBooking.endTime}
                                    </span>
                                </div>
                                {selectedBooking.note && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ghi chú:</span>
                                        <span className="font-medium">{selectedBooking.note}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Thanh toán</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phương thức:</span>
                                    <span className="font-medium">
                                        {paymentLabels[selectedBooking.typePayment]?.label ||
                                            selectedBooking.typePayment}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tổng tiền:</span>
                                    <span className="font-bold text-xl text-[#16A34A]">
                                        {formatPrice(selectedBooking.price)}đ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Trạng thái đơn hàng</h4>
                            <Select
                                value={selectedBooking.status}
                                onChange={(value) => handleStatusChange(selectedBooking._id, value)}
                                className="w-full"
                                size="large"
                                options={[
                                    { value: 'pending', label: '⏳ Chờ xác nhận' },
                                    { value: 'confirmed', label: '✅ Đã xác nhận' },
                                    { value: 'in_progress', label: '🏃 Đang bắt đầu' },
                                    { value: 'completed', label: '✅ Đã xong' },
                                ]}
                            />
                        </div>

                        {/* Timestamps */}
                        <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <p>Ngày tạo: {formatDateTime(selectedBooking.createdAt)}</p>
                            {selectedBooking.updatedAt && (
                                <p>Cập nhật lần cuối: {formatDateTime(selectedBooking.updatedAt)}</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default BookingManagement;
