import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ReviewModal from '../components/ReviewModal';
import Context from '../store/Context';
import {
    User,
    Calendar,
    Clock,
    Lock,
    LogOut,
    Camera,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Eye,
    ChevronRight,
    Star,
} from 'lucide-react';
import { message } from 'antd';
import { getUserBookings } from '../config/BookingRequest';
import { requestUpdateUser, requestLogout, requestChangePassword, requestUploadAvatar } from '../config/UserRequest.jsx';
import cookies from 'js-cookie';
import Footer from '../components/Footer.jsx';

function Profile() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { dataUser, fetchAuth } = useContext(Context);
    // Đọc tab từ URL ?tab=history để hỗ trợ link từ ngoài
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthday: '',
        address: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [reviewModal, setReviewModal] = useState({
        open: false,
        bookingId: null,
        fieldId: null,
        fieldName: '',
    });
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useState(null);

    // Sync form data với dataUser khi available
    useEffect(() => {
        if (dataUser && dataUser._id) {
            setFormData({
                fullName: dataUser.fullName || '',
                email: dataUser.email || '',
                phone: dataUser.phone || '',
                birthday: dataUser.birthDay ? new Date(dataUser.birthDay).toISOString().split('T')[0] : '',
                address: dataUser.address || '',
            });
        }
    }, [dataUser]);

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const res = await getUserBookings();
                if (res.metadata) {
                    setBookings(res.metadata);
                }
            } catch (error) {
                console.error('Lỗi khi tải lịch sử đặt sân:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dataUser && dataUser._id) {
            fetchBookings();
        }
    }, [dataUser]);

    const menuItems = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: User },
        { id: 'history', label: 'Lịch sử đặt sân', icon: Calendar },
        { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
        { id: 'logout', label: 'Đăng xuất', icon: LogOut },
    ];

    const statusConfig = {
        pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
        confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
        in_progress: { label: 'Đang bắt đầu', color: 'bg-purple-100 text-purple-700' },
        completed: { label: 'Đã xong', color: 'bg-green-100 text-green-700' },
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await requestUpdateUser({
                fullName: formData.fullName,
                phone: formData.phone,
                birthday: formData.birthday,
                address: formData.address,
            });
            message.success('Cập nhật thông tin thành công!');
            fetchAuth(); // Refresh user data
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Kiểm tra định dạng file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Chỉ cho phép upload file ảnh (JPEG, PNG, WebP)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('Ảnh không được vượt quá 5MB');
            return;
        }
        try {
            setAvatarUploading(true);
            const formDataUpload = new FormData();
            formDataUpload.append('avatar', file);
            await requestUploadAvatar(formDataUpload);
            message.success('Cập nhật ảnh đại diện thành công!');
            fetchAuth(); // Refresh để hiển thị avatar mới
        } catch (error) {
            message.error(error.response?.data?.message || 'Upload ảnh thất bại');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            message.error('Mật khẩu mới phải ít nhất 6 ký tự');
            return;
        }
        try {
            await requestChangePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            message.success('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            message.error(error.response?.data?.message || 'Mật khẩu hiện tại không đúng');
        }
    };

    const handleMenuClick = async (id) => {
        if (id === 'logout') {
            try {
                await requestLogout();
                cookies.remove('logged');
                message.success('Đăng xuất thành công');
                navigate('/');
                window.location.reload();
            } catch (error) {
                console.error('Logout error:', error);
                cookies.remove('logged');
                navigate('/');
            }
            return;
        }
        setActiveTab(id);
    };

    const pendingBookings = bookings.filter((b) => b.status === 'pending');

    // Redirect nếu chưa đăng nhập
    if (!dataUser || !dataUser._id) {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <p className="text-gray-500">Vui lòng đăng nhập để xem trang cá nhân</p>
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

            <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-[260px] flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            {/* User Avatar & Info */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22C55E] flex items-center justify-center text-white text-3xl font-bold mx-auto overflow-hidden">
                                        {dataUser.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || ''}${dataUser.avatar}`}
                                                alt={dataUser.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            dataUser.fullName?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    {/* Hidden input upload avatar */}
                                    <input
                                        type="file"
                                        id="avatar-upload-input"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        type="button"
                                        disabled={avatarUploading}
                                        onClick={() => document.getElementById('avatar-upload-input').click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-60"
                                        title="Đổi ảnh đại diện"
                                    >
                                        {avatarUploading ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <h3 className="mt-4 font-bold text-gray-900 text-lg">{dataUser.fullName}</h3>
                                <p className="text-sm text-gray-500">{dataUser.email}</p>
                            </div>

                            {/* Menu */}
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    const isLogout = item.id === 'logout';

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleMenuClick(item.id)}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                                                ${isActive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'text-gray-600 hover:bg-gray-50'}
                                                ${isLogout ? 'text-red-500 hover:bg-red-50' : ''}
                                            `}
                                        >
                                            <Icon
                                                className={`w-5 h-5 ${isActive ? 'text-[#16A34A]' : ''} ${isLogout ? 'text-red-500' : ''}`}
                                            />
                                            <span className={`font-medium ${isActive ? 'text-[#16A34A]' : ''}`}>
                                                {item.label}
                                            </span>
                                            {item.id === 'pending' && pendingBookings.length > 0 && (
                                                <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {pendingBookings.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-2" />
                                                Họ và tên
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail className="w-4 h-4 inline mr-2" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all bg-gray-50"
                                                disabled
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-2" />
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                            />
                                        </div>

                                        {/* Birthday */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarDays className="w-4 h-4 inline mr-2" />
                                                Ngày sinh
                                            </label>
                                            <input
                                                type="date"
                                                name="birthday"
                                                value={formData.birthday}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <MapPin className="w-4 h-4 inline mr-2" />
                                                Địa chỉ
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-8 px-8 py-3 bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)]"
                                    >
                                        Cập nhật thông tin
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Booking History Tab */}
                        {activeTab === 'history' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đặt sân</h2>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Mã đơn
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Tên sân
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Ngày
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Khung giờ
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Tổng tiền
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                                                        Trạng thái
                                                    </th>
                                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.map((booking) => (
                                                    <tr
                                                        key={booking._id}
                                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="py-4 px-4">
                                                            <span className="font-mono font-semibold text-gray-900">
                                                                {booking.bookingId?.slice(-8).toUpperCase() ||
                                                                    booking._id.slice(-8).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="font-medium text-gray-900">
                                                                {booking.fieldId?.name || 'Sân bóng'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="text-gray-600">
                                                                {formatDate(booking.bookingDate)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="text-gray-600">
                                                                {booking.startTime} - {booking.endTime}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="font-semibold text-[#16A34A]">
                                                                {formatPrice(booking.price)}đ
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[booking.status]?.color || 'bg-gray-100 text-gray-600'}`}
                                                            >
                                                                {statusConfig[booking.status]?.label || booking.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/booking-success/${booking.bookingId || booking._id}`,
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-1 text-[#16A34A] hover:underline text-sm font-medium"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    Xem
                                                                </button>
                                                                {booking.status === 'completed' && (
                                                                    <button
                                                                        onClick={() =>
                                                                            setReviewModal({
                                                                                open: true,
                                                                                bookingId:
                                                                                    booking.bookingId || booking._id,
                                                                                fieldId:
                                                                                    booking.fieldId?._id ||
                                                                                    booking.fieldId,
                                                                                fieldName:
                                                                                    booking.fieldId?.name || 'Sân bóng',
                                                                            })
                                                                        }
                                                                        className="flex items-center gap-1 text-yellow-600 hover:underline text-sm font-medium"
                                                                    >
                                                                        <Star className="w-4 h-4" />
                                                                        Đánh giá
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Bạn chưa có đơn đặt sân nào</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Payments Tab */}
                        {activeTab === 'pending' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đơn chờ thanh toán</h2>

                                {pendingBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingBookings.map((booking) => (
                                            <div
                                                key={booking._id}
                                                className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                                        <Clock className="w-6 h-6 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {booking.fieldId?.name || 'Sân bóng'}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(booking.bookingDate)} • {booking.startTime} -{' '}
                                                            {booking.endTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-[#16A34A]">
                                                        {formatPrice(booking.price)}đ
                                                    </span>
                                                    <button className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors flex items-center gap-2">
                                                        Thanh toán
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Không có đơn chờ thanh toán</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Change Password Tab */}
                        {activeTab === 'password' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>

                                <form onSubmit={handleChangePassword} className="max-w-md">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-6 px-8 py-3 bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)]"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </main>

            {/* Review Modal */}
            <ReviewModal
                open={reviewModal.open}
                onClose={() => setReviewModal({ open: false, bookingId: null, fieldId: null, fieldName: '' })}
                bookingId={reviewModal.bookingId}
                fieldId={reviewModal.fieldId}
                fieldName={reviewModal.fieldName}
                onSuccess={() => {
                    setReviewModal({ open: false, bookingId: null, fieldId: null, fieldName: '' });
                }}
            />
        </div>
    );
}

export default Profile;
