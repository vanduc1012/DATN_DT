import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Calendar,
    User,
    Phone,
    MessageSquare,
    Banknote,
    Wallet,
    CreditCard,
    CheckCircle,
    ArrowLeft,
    Tag,
    X,
} from 'lucide-react';
import { message } from 'antd';
import { createBooking } from '../config/BookingRequest';
import { validateDiscount, getAvailableDiscounts } from '../config/DiscountRequest';
import Footer from '../components/Footer';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingData = location.state;

    console.log(bookingData);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        note: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    // Discount states
    const [discountCode, setDiscountCode] = useState('');
    const [discountLoading, setDiscountLoading] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [availableDiscounts, setAvailableDiscounts] = useState([]);
    const [showDiscountList, setShowDiscountList] = useState(false);

    // Day labels
    const dayLabels = {
        0: 'Chủ nhật',
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
    };

    useEffect(() => {
        if (!bookingData) {
            navigate('/');
        }
    }, [bookingData, navigate]);

    // Fetch mã giảm giá phù hợp khi trang tải xong
    useEffect(() => {
        if (!bookingData?.field?._id) return;
        const total = bookingData.selectedSlots?.reduce((s, sl) => s + sl.price, 0) || 0;
        getAvailableDiscounts(total, bookingData.field._id)
            .then((res) => setAvailableDiscounts(res?.metadata || []))
            .catch(() => {});
    }, [bookingData]);

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Calculate total hours
    const calculateHours = () => {
        if (!bookingData?.selectedSlots) return 0;
        return bookingData.selectedSlots.length;
    };

    // Calculate total price
    const calculateTotal = () => {
        if (!bookingData?.selectedSlots) return 0;
        return bookingData.selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    };

    // Get final price (after discount)
    const getFinalPrice = () => {
        if (appliedDiscount) {
            return appliedDiscount.finalPrice;
        }
        return calculateTotal();
    };

    // Handle apply discount
    const handleApplyDiscount = async (codeToApply = null) => {
        const code = codeToApply || discountCode;
        if (!code.trim()) {
            message.warning('Vui lòng nhập mã giảm giá');
            return;
        }

        setDiscountLoading(true);
        try {
            const response = await validateDiscount(code, calculateTotal(), bookingData.field._id);
            setAppliedDiscount(response.metadata);
            setDiscountCode(response.metadata.code);
            setShowDiscountList(false);
            message.success(`Áp dụng mã ${response.metadata.code} thành công!`);
        } catch (error) {
            message.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            setAppliedDiscount(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    // Handle remove discount
    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!formData.fullName.trim()) {
            message.error('Vui lòng nhập họ tên');
            return;
        }
        if (!formData.phone.trim()) {
            message.error('Vui lòng nhập số điện thoại');
            return;
        }

        setLoading(true);
        try {
            const response = await createBooking({
                bookingId: bookingData.bookingId,
                typePayment: paymentMethod,
                fieldId: bookingData.field._id,
                bookingDate: bookingData.selectedDate,
                slots: bookingData.selectedSlots,
                note: formData.note,
                // Discount info
                discountCode: appliedDiscount?.code || null,
                discountAmount: appliedDiscount?.discountAmount || 0,
                finalPrice: getFinalPrice(),
            });

            if (paymentMethod === 'momo') {
                if (response.metadata && response.metadata.payUrl) {
                    window.location.href = response.metadata.payUrl;
                } else {
                    message.error('Không thể tạo link thanh toán MoMo');
                }
            } else if (paymentMethod === 'vnpay') {
                // VNPay returns URL string directly
                if (response.metadata) {
                    window.location.href = response.metadata;
                } else {
                    message.error('Không thể tạo link thanh toán VNPay');
                }
            } else {
                // Cash payment - navigate to success
                message.success('Đặt sân thành công!');
                navigate(`/booking-success/${bookingData.bookingId}`);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Vui lòng đăng nhập để đặt sân');
                navigate('/login');
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) {
        return null;
    }

    const paymentMethods = [
        {
            id: 'cash',
            name: 'Thanh toán tại sân',
            description: 'Thanh toán trực tiếp khi đến sân',
            icon: Banknote,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            id: 'momo',
            name: 'Thanh toán MoMo',
            description: 'Thanh toán qua ví điện tử MoMo',
            icon: Wallet,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
        },
        {
            id: 'vnpay',
            name: 'Thanh toán VNPay',
            description: 'Thanh toán qua cổng VNPay',
            icon: CreditCard,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#16A34A] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Quay lại</span>
                </button>

                {/* Page Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán đặt sân</h1>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Booking Info Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin đặt sân</h2>

                            <div className="flex gap-6">
                                {/* Field Image */}
                                <img
                                    src={
                                        bookingData.field.images?.[0] ||
                                        'https://via.placeholder.com/200x150?text=Field'
                                    }
                                    alt={bookingData.field.name}
                                    className="w-40 h-28 object-cover rounded-xl"
                                />

                                {/* Field Details */}
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-xl font-bold text-gray-900">{bookingData.field.name}</h3>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">
                                            {bookingData.field.address || 'Chưa có địa chỉ'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {dayLabels[new Date(bookingData.selectedDate).getDay()]},{' '}
                                                {new Date(bookingData.selectedDate).getDate()}/
                                                {new Date(bookingData.selectedDate).getMonth() + 1}/
                                                {new Date(bookingData.selectedDate).getFullYear()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Time Slots */}
                                    <div className="flex flex-wrap gap-2">
                                        {bookingData.selectedSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg text-sm font-medium"
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin người đặt</h2>

                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg
                                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                 transition-all duration-200"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số điện thoại"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg
                                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                 transition-all duration-200"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MessageSquare className="w-4 h-4 inline mr-1" />
                                        Ghi chú
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        placeholder="Ghi chú thêm (không bắt buộc)"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none
                                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = paymentMethod === method.id;

                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`
                                                relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
                                                transition-all duration-200
                                                ${
                                                    isSelected
                                                        ? 'border-[#16A34A] bg-[#DCFCE7]/50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {/* Radio */}
                                            <div
                                                className={`
                                                w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${isSelected ? 'border-[#16A34A]' : 'border-gray-300'}
                                            `}
                                            >
                                                {isSelected && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></div>
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div
                                                className={`w-12 h-12 rounded-xl ${method.iconBg} flex items-center justify-center`}
                                            >
                                                <Icon className={`w-6 h-6 ${method.iconColor}`} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{method.name}</span>
                                                    {method.badge && (
                                                        <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-medium rounded-full">
                                                            {method.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{method.description}</p>
                                            </div>

                                            {/* Check Icon */}
                                            {isSelected && (
                                                <CheckCircle className="w-6 h-6 text-[#16A34A] absolute right-4" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                            {/* Field Name */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                <img
                                    src={
                                        bookingData.field.images?.[0] || 'https://via.placeholder.com/60x60?text=Field'
                                    }
                                    alt={bookingData.field.name}
                                    className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{bookingData.field.name}</h3>
                                    <p className="text-sm text-gray-500">Sân {bookingData.field.type} người</p>
                                </div>
                            </div>

                            {/* Price Details */}
                            <div className="py-4 space-y-3 border-b border-gray-100">
                                {bookingData.selectedSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            {slot.startTime} - {slot.endTime}
                                        </span>
                                        <span className="font-medium text-gray-900">{formatPrice(slot.price)}đ</span>
                                    </div>
                                ))}
                            </div>

                            {/* Discount Code Input */}
                            <div className="py-4 border-b border-gray-100">
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Tag className="w-4 h-4" />
                                    Mã giảm giá
                                    {availableDiscounts.length > 0 && !appliedDiscount && (
                                        <button
                                            onClick={() => setShowDiscountList((p) => !p)}
                                            className="ml-auto text-xs text-[#16A34A] font-medium hover:underline"
                                        >
                                            {showDiscountList ? 'Thu gọn' : `Xem ${availableDiscounts.length} mã có thể dùng ▾`}
                                        </button>
                                    )}
                                </label>

                                {/* Danh sách mã phù hợp */}
                                {showDiscountList && !appliedDiscount && (
                                    <div className="mb-3 space-y-2">
                                        {availableDiscounts.map((d) => (
                                            <button
                                                key={d._id}
                                                onClick={() => handleApplyDiscount(d.code)}
                                                className="w-full text-left flex items-center justify-between p-3
                                                           border-2 border-dashed border-[#16A34A]/40 rounded-xl
                                                           hover:border-[#16A34A] hover:bg-[#f0fdf4] transition-all group"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-[#16A34A] text-sm">
                                                            {d.code}
                                                        </span>
                                                        <span className="text-xs px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded font-medium">
                                                            {d.type === 'percentage'
                                                                ? `Giảm ${d.value}%`
                                                                : `Giảm ${d.value.toLocaleString('vi-VN')}đ`}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{d.name}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-3">
                                                    <p className="text-sm font-semibold text-green-600">
                                                        -{d.discountAmount.toLocaleString('vi-VN')}đ
                                                    </p>
                                                    <p className="text-xs text-gray-400 group-hover:text-[#16A34A] transition-colors">
                                                        Nhấn để áp dụng
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {appliedDiscount ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <span className="font-mono font-bold text-green-700">
                                                {appliedDiscount.code}
                                            </span>
                                            <p className="text-xs text-green-600">{appliedDiscount.name}</p>
                                        </div>
                                        <button
                                            onClick={handleRemoveDiscount}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                            placeholder="Nhập mã giảm giá"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                                        />
                                        <button
                                            onClick={() => handleApplyDiscount()}
                                            disabled={discountLoading}
                                            className="px-4 py-2 bg-[#16A34A] text-white text-sm font-medium rounded-lg
                                                     hover:bg-[#15803d] disabled:bg-gray-300 transition-colors"
                                        >
                                            {discountLoading ? '...' : 'Áp dụng'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="py-4 space-y-3 border-b border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium text-gray-900">{formatPrice(calculateTotal())}đ</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600">Giảm giá ({appliedDiscount.code})</span>
                                        <span className="font-medium text-green-600">
                                            -{formatPrice(appliedDiscount.discountAmount)}đ
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Phí dịch vụ</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="py-4 flex items-center justify-between">
                                <span className="text-gray-900 font-semibold">Tổng cộng</span>
                                <span className="text-2xl font-bold text-[#16A34A]">
                                    {formatPrice(getFinalPrice())}đ
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-[#16A34A] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed
                                         text-white font-semibold text-lg rounded-xl transition-all duration-200
                                         shadow-[0_4px_14px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)]
                                         active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    'Xác nhận thanh toán'
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-400 mt-4">
                                Bằng việc đặt sân, bạn đồng ý với{' '}
                                <a href="#" className="text-[#16A34A] hover:underline">
                                    điều khoản dịch vụ
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Checkout;
