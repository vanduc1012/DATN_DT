import { useParams, Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { CheckCircle, MapPin, Calendar, Clock, CreditCard, Mail, ArrowRight } from 'lucide-react';
import { getBookingById, verifyMomoPayment, verifyVnpayPayment } from '../config/BookingRequest';
import { message } from 'antd';
import Footer from '../components/Footer';

function BookingSuccess() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Payment method labels
    const paymentLabels = {
        cash: 'Thanh toán tại sân',
        momo: 'Thanh toán MoMo',
        vnpay: 'Thanh toán VNPay',
    };

    // Status labels
    const statusLabels = {
        pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
        paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
        cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };

    const fetchBooking = async () => {
        try {
            const res = await getBookingById(id);
            let bookingData = res.metadata;
            if (res.metadata.isGroup && res.metadata.bookings) {
                bookingData = res.metadata.bookings;
            } else if (!Array.isArray(bookingData)) {
                bookingData = [bookingData];
            }
            setBooking(bookingData);
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Không tìm thấy đơn đặt sân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBooking();
        } else {
            setLoading(false);
            setError('Không có mã đơn hàng');
        }
    }, [id]);

    // Effect verify payment based on URL params (MoMo / VNPay)
    useEffect(() => {
        const verify = async () => {
            // Check MoMo
            const partnerCode = searchParams.get('partnerCode');
            const resultCode = searchParams.get('resultCode');

            // Check VNPay
            const vnpResponseCode = searchParams.get('vnp_ResponseCode');

            if (partnerCode === 'MOMO' && resultCode === '0') {
                try {
                    await verifyMomoPayment(id);
                    message.success('Thanh toán MoMo thành công!');
                    await fetchBooking();
                } catch (e) {
                    console.error('Payment verification failed', e);
                    message.error('Xác thực thanh toán thất bại');
                }
            } else if (vnpResponseCode === '00') {
                // VNPay success code is '00'
                try {
                    await verifyVnpayPayment(id);
                    message.success('Thanh toán VNPay thành công!');
                    await fetchBooking();
                } catch (e) {
                    console.error('VNPay verification failed', e);
                    message.error('Xác thực thanh toán VNPay thất bại');
                }
            }
        };
        if (id && (searchParams.get('partnerCode') || searchParams.get('vnp_ResponseCode'))) {
            verify();
        }
    }, [id, searchParams]);

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (error || !booking || booking.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <p className="text-gray-500">{error || 'Không tìm thấy đơn đặt sân'}</p>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-[#16A34A] text-white font-medium rounded-xl hover:bg-[#15803d] transition-colors"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    // Data for display
    const firstRes = booking[0];
    const bookingDate = new Date(firstRes.bookingDate);
    const field = firstRes.fieldId;
    const status = statusLabels[firstRes.status] || statusLabels.pending;
    const originalTotal = booking.reduce((sum, b) => sum + b.price, 0);

    // Get discount info from first booking (where it's stored)
    const discountCode = firstRes.discountCode;
    const discountAmount = firstRes.discountAmount || 0;
    const totalPrice = originalTotal - discountAmount;

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                <div className="max-w-xl mx-auto">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-14 h-14 text-[#16A34A]" strokeWidth={2.5} />
                            </div>
                            <div className="absolute inset-0 bg-[#16A34A]/20 rounded-full blur-xl -z-10 scale-110"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#16A34A] mb-2">Đặt sân thành công!</h1>
                        <p className="text-gray-600">Đơn đặt sân của bạn đã được xác nhận.</p>
                    </div>

                    {/* Booking Summary Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
                        {/* Order ID */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Mã đơn hàng</span>
                            <span className="font-mono font-bold text-gray-900">
                                {firstRes.bookingId
                                    ? firstRes.bookingId.slice(-8).toUpperCase()
                                    : firstRes._id.slice(-8).toUpperCase()}
                            </span>
                        </div>

                        {/* Field Info */}
                        <div className="flex gap-4 pb-4 mb-4 border-b border-gray-100">
                            <img
                                src={field?.images?.[0] || 'https://via.placeholder.com/100x100?text=Field'}
                                alt={field?.name}
                                className="w-20 h-20 object-cover rounded-xl"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{field?.name || 'Sân bóng'}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{field?.address || 'Chưa có địa chỉ'}</span>
                                </div>
                                {field?.type && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                        Sân {field.type} người
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3 pb-4 mb-4 border-b border-gray-100">
                            {/* Date */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Ngày đặt</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {dayLabels[bookingDate.getDay()]}, {bookingDate.getDate()}/
                                    {bookingDate.getMonth() + 1}/{bookingDate.getFullYear()}
                                </span>
                            </div>

                            {/* Slots List */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>Khung giờ ({booking.length}):</span>
                                </div>
                                <div className="pl-6 space-y-1">
                                    {booking.map((slot, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded">
                                                {slot.startTime} - {slot.endTime}
                                            </span>
                                            <span className="text-gray-500">{formatPrice(slot.price)}đ</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Thanh toán</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {paymentLabels[firstRes.typePayment] || firstRes.typePayment}
                                </span>
                            </div>
                        </div>

                        {/* Discount Info (if applied) */}
                        {discountAmount > 0 && (
                            <div className="py-3 border-t border-dashed border-gray-200">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="text-gray-600">{formatPrice(originalTotal)}đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 flex items-center gap-1">
                                        🎫 Giảm giá {discountCode && `(${discountCode})`}
                                    </span>
                                    <span className="text-green-600 font-medium">-{formatPrice(discountAmount)}đ</span>
                                </div>
                            </div>
                        )}

                        {/* Total & Status */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-gray-600">Tổng tiền</span>
                                <p className="text-2xl font-bold text-[#16A34A]">{formatPrice(totalPrice)}đ</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <span className={`px-3 py-1.5 font-semibold rounded-full text-xs ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Link
                            to="/"
                            className="flex-1 py-4 text-center border-2 border-gray-200 text-gray-700 font-semibold rounded-xl
                                     hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                            Quay về trang chủ
                        </Link>
                    </div>

                    {/* Suggestion */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Muốn đặt thêm sân khác?{' '}
                            <Link to="/" className="text-[#16A34A] font-medium hover:underline">
                                Xem danh sách sân
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default BookingSuccess;
