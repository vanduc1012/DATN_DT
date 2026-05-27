import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState, useCallback } from 'react';
import { getFieldById } from '../config/FieldRequest';
import { getBookingsByField } from '../config/BookingRequest';
import { getReviewsByField } from '../config/ReviewRequest';
import { v4 as uuidv4 } from 'uuid';
import { useSlotSocket } from '../hooks/useSlotSocket';

import {
    MapPin,
    Star,
    Users,
    Car,
    Lightbulb,
    ShowerHead,
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    X,
} from 'lucide-react';
import Footer from '../components/Footer';

function DetailField() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [field, setField] = useState(null);
    const [fieldPrices, setFieldPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]); // [New] Booked slots state
    const [showAllImages, setShowAllImages] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });

    // Format date string for socket
    const dateStr = selectedDate.toISOString().split('T')[0];

    // Socket hook for realtime slot holding
    const { isConnected, heldByOthers, holdSlots, releaseSlots, isSlotHeldByOthers } = useSlotSocket({
        fieldId: id,
        date: dateStr,
        onSlotsBooked: (slots) => {
            // Refresh booked slots when someone books
            setBookedSlots((prev) => [...prev, ...slots]);
            // Remove from selected if any
            setSelectedTimeSlots((prev) => prev.filter((s) => !slots.some((b) => b.startTime === s.startTime)));
        },
    });

    // Slick settings
    const sliderSettings = {
        dots: true,
        infinite: field?.images?.length > 1,
        speed: 500,
        slidesToShow: field?.images?.length < 3 ? 1 : 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        centerMode: true,
        centerPadding: '100px',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '40px',
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '20px',
                },
            },
        ],
    };

    // Day of week labels
    const dayLabels = {
        0: 'Chủ nhật',
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
    };

    // Type labels
    const typeLabels = {
        5: '5 người',
        7: '7 người',
        11: '11 người',
    };

    // Fetch Field Info
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getFieldById(id);
                setField(res.metadata.field);
                setFieldPrices(res.metadata.fieldPrice || []);
            } catch (error) {
                console.error('Error fetching field:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Fetch Booked Slots when date changes
    useEffect(() => {
        if (!id || !selectedDate) return;
        const fetchBookings = async () => {
            try {
                const res = await getBookingsByField(id, selectedDate.toISOString());
                setBookedSlots(res.metadata || []);
                // Filter out selected slots if they are now booked (optional but good UX)
                setSelectedTimeSlots((prev) =>
                    prev.filter(
                        (s) => !res.metadata?.some((b) => b.startTime === s.startTime && b.endTime === s.endTime),
                    ),
                );
            } catch (err) {
                console.error('Failed to fetch bookings', err);
            }
        };
        fetchBookings();
    }, [id, selectedDate]);

    // Fetch Reviews
    useEffect(() => {
        if (!id) return;
        const fetchReviews = async () => {
            try {
                const res = await getReviewsByField(id, { limit: 10 });
                setReviews(res.metadata.reviews || []);
                setReviewStats(res.metadata.stats || { averageRating: 0, totalReviews: 0 });
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            }
        };
        fetchReviews();
    }, [id]);

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Get prices for selected day
    const getPricesForDay = (dayOfWeek) => {
        return fieldPrices.filter((p) => p.dayOfWeek === dayOfWeek);
    };

    // Categorize prices by time period
    const categorizePrices = (prices) => {
        const morning = prices.filter((p) => {
            const hour = parseInt(p.startTime.split(':')[0]);
            return hour >= 5 && hour < 12;
        });
        const afternoon = prices.filter((p) => {
            const hour = parseInt(p.startTime.split(':')[0]);
            return hour >= 12 && hour < 17;
        });
        const evening = prices.filter((p) => {
            const hour = parseInt(p.startTime.split(':')[0]);
            return hour >= 17 || hour < 5;
        });
        return { morning, afternoon, evening };
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];

        // Empty slots for days before first day of month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    // Check if date is selected
    const isDateSelected = (date) => {
        if (!date) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // Check if date is today
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Check if date is in the past
    const isPastDate = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Toggle time slot selection with socket events
    const toggleTimeSlot = useCallback(
        (slot) => {
            const slotId = `${slot.startTime}-${slot.endTime}`;
            const isCurrentlySelected = selectedTimeSlots.find((s) => `${s.startTime}-${s.endTime}` === slotId);

            if (isCurrentlySelected) {
                // Bỏ chọn -> Giải phóng slot
                setSelectedTimeSlots(selectedTimeSlots.filter((s) => `${s.startTime}-${s.endTime}` !== slotId));
                releaseSlots([{ startTime: slot.startTime, endTime: slot.endTime }]);
            } else {
                // Chọn slot -> Giữ slot
                setSelectedTimeSlots([...selectedTimeSlots, slot]);
                holdSlots([{ startTime: slot.startTime, endTime: slot.endTime }]);
            }
        },
        [selectedTimeSlots, holdSlots, releaseSlots],
    );

    // Calculate total price
    const calculateTotal = () => {
        return selectedTimeSlots.reduce((sum, slot) => sum + slot.price, 0);
    };

    // Navigate months
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!field) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-gray-500">Không tìm thấy sân bóng</p>
                </div>
            </div>
        );
    }

    const dayPrices = getPricesForDay(selectedDate.getDay());
    const categorizedPrices = categorizePrices(dayPrices);

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            {/* Main Content */}
            <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                {/* Gallery Section - React Slick */}
                <section className="mb-12 gallery-slider">
                    {field.images && field.images.length > 0 ? (
                        <Slider {...sliderSettings} className="gap-4">
                            {field.images.map((img, index) => (
                                <div key={index} className="px-2 outline-none">
                                    <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-lg group">
                                        <img
                                            src={img}
                                            alt={`${field.name} ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                            onClick={() => setShowAllImages(true)}
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                            <div className="text-center text-gray-400">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <span className="font-medium">Chưa có hình ảnh</span>
                            </div>
                        </div>
                    )}

                    {/* View All Button */}
                </section>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    {/* Left Column - Field Info */}
                    <div className="space-y-8">
                        {/* Field Header */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{field.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="font-semibold">4.8</span>
                                            <span className="text-gray-400">(128 đánh giá)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{field.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-[#DCFCE7] text-[#16A34A] font-semibold rounded-full">
                                    Sân {typeLabels[field.type] || field.type}
                                </span>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                                    <ShowerHead className="w-5 h-5 text-[#16A34A]" />
                                    <span className="text-sm text-gray-700">Phòng thay đồ</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                                    <Car className="w-5 h-5 text-[#16A34A]" />
                                    <span className="text-sm text-gray-700">Bãi đỗ xe</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                                    <Lightbulb className="w-5 h-5 text-[#16A34A]" />
                                    <span className="text-sm text-gray-700">Đèn chiếu sáng</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                                    <Users className="w-5 h-5 text-[#16A34A]" />
                                    <span className="text-sm text-gray-700">Sân {field.type} người</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sân</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {field.description || 'Chưa có mô tả chi tiết cho sân bóng này.'}
                            </p>
                        </div>

                        {/* Price Table */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Bảng giá - {dayLabels[selectedDate.getDay()]}
                            </h2>

                            {dayPrices.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Chưa có bảng giá cho ngày này</p>
                            ) : (
                                <div className="space-y-6">
                                    {/* Morning */}
                                    {categorizedPrices.morning.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                Buổi sáng
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {categorizedPrices.morning.map((price) => (
                                                    <div
                                                        key={price._id}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-700">
                                                                {price.startTime} - {price.endTime}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-[#16A34A]">
                                                            {formatPrice(price.price)}đ
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Afternoon */}
                                    {categorizedPrices.afternoon.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                Buổi chiều
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {categorizedPrices.afternoon.map((price) => (
                                                    <div
                                                        key={price._id}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-700">
                                                                {price.startTime} - {price.endTime}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-[#16A34A]">
                                                            {formatPrice(price.price)}đ
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Evening */}
                                    {categorizedPrices.evening.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                                Buổi tối
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {categorizedPrices.evening.map((price) => (
                                                    <div
                                                        key={price._id}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-gray-700">
                                                                {price.startTime} - {price.endTime}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-[#16A34A]">
                                                            {formatPrice(price.price)}đ
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Calendar Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn lịch đặt sân</h2>

                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={prevMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <span className="font-semibold text-gray-800">
                                    Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                                </span>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {generateCalendarDays().map((date, index) => (
                                    <button
                                        key={index}
                                        disabled={!date || isPastDate(date)}
                                        onClick={() => date && setSelectedDate(date)}
                                        className={`
                                            aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                            ${!date ? 'invisible' : ''}
                                            ${isPastDate(date) ? 'text-gray-300 cursor-not-allowed' : ''}
                                            ${isDateSelected(date) ? 'bg-[#16A34A] text-white' : ''}
                                            ${isToday(date) && !isDateSelected(date) ? 'border-2 border-[#16A34A] text-[#16A34A]' : ''}
                                            ${!isPastDate(date) && !isDateSelected(date) && !isToday(date) ? 'hover:bg-gray-100 text-gray-700' : ''}
                                        `}
                                    >
                                        {date?.getDate()}
                                    </button>
                                ))}
                            </div>

                            {/* Time Slots */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Khung giờ khả dụng - {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                                </h3>
                                {dayPrices.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Không có khung giờ cho ngày này</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {dayPrices.map((slot) => {
                                            // Helper check booked
                                            const isBooked = bookedSlots.some(
                                                (b) => b.startTime === slot.startTime && b.endTime === slot.endTime,
                                            );
                                            const isHeldByOther = isSlotHeldByOthers(slot.startTime);
                                            const isSelected = selectedTimeSlots.find(
                                                (s) =>
                                                    `${s.startTime}-${s.endTime}` ===
                                                    `${slot.startTime}-${slot.endTime}`,
                                            );
                                            const isDisabled = isBooked || isHeldByOther;

                                            return (
                                                <button
                                                    key={slot._id}
                                                    disabled={isDisabled}
                                                    onClick={() => toggleTimeSlot(slot)}
                                                    className={`
                                                        px-4 py-2 rounded-lg text-sm font-medium transition-all relative
                                                        ${
                                                            isBooked
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : isHeldByOther
                                                                  ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed border-2 border-yellow-300'
                                                                  : isSelected
                                                                    ? 'bg-[#16A34A] text-white'
                                                                    : 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#16A34A] hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    {slot.startTime} - {slot.endTime}
                                                    {isBooked && (
                                                        <span className="block text-[10px] font-normal">Đã đặt</span>
                                                    )}
                                                    {isHeldByOther && !isBooked && (
                                                        <span className="block text-[10px] font-normal animate-pulse">
                                                            Đang chọn...
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Đánh giá</h2>
                                <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                    <span className="text-2xl font-bold text-gray-900">
                                        {reviewStats.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-gray-500">({reviewStats.totalReviews} đánh giá)</span>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">Chưa có đánh giá nào</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div
                                            key={review._id}
                                            className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] font-bold text-lg">
                                                {review.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {review.userId?.fullName || 'Người dùng'}
                                                        </h4>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.rating
                                                                            ? 'text-yellow-400 fill-current'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                                                {/* Owner reply */}
                                                {review.reply?.content && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                                            Phản hồi từ chủ sân:
                                                        </p>
                                                        <p className="text-sm text-gray-600">{review.reply.content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sticky Booking Card */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                            {/* Price Header */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[#16A34A]">
                                        {fieldPrices.length > 0
                                            ? formatPrice(Math.min(...fieldPrices.map((p) => p.price)))
                                            : '---'}
                                    </span>
                                    <span className="text-gray-500">đ/giờ</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">Giá từ</p>
                            </div>

                            {/* Selected Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Ngày đã chọn
                                </label>
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                                    {dayLabels[selectedDate.getDay()]}, {selectedDate.getDate()}/
                                    {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
                                </div>
                            </div>

                            {/* Selected Time Slots */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Khung giờ đã chọn
                                </label>
                                {selectedTimeSlots.length === 0 ? (
                                    <p className="text-gray-400 text-sm px-4 py-3 bg-gray-50 rounded-xl">
                                        Chưa chọn khung giờ nào
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedTimeSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between px-4 py-3 bg-[#DCFCE7] rounded-xl"
                                            >
                                                <span className="font-medium text-[#16A34A]">
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                                <span className="text-[#16A34A] font-semibold">
                                                    {formatPrice(slot.price)}đ
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="mb-6 pb-6 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(calculateTotal())}đ
                                    </span>
                                </div>
                            </div>

                            {/* Book Button */}
                            <button
                                disabled={selectedTimeSlots.length === 0}
                                onClick={() => {
                                    navigate('/checkout', {
                                        state: {
                                            bookingId: uuidv4(),
                                            field,
                                            selectedDate: selectedDate.toISOString(),
                                            selectedSlots: selectedTimeSlots,
                                        },
                                    });
                                }}
                                className="w-full py-4 bg-[#16A34A] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed
                                         text-white font-semibold text-lg rounded-xl transition-all duration-200
                                         shadow-[0_4px_14px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)]
                                         active:scale-[0.98]"
                            >
                                Đặt sân ngay
                            </button>

                            <p className="text-center text-sm text-gray-400 mt-4">Bạn chưa bị trừ tiền ở bước này</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Modal */}
            {showAllImages && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
                    <button
                        onClick={() => setShowAllImages(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl max-h-[80vh] overflow-y-auto">
                        {field.images?.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${field.name} ${index + 1}`}
                                className="w-full h-64 object-cover rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default DetailField;
