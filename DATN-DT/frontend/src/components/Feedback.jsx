import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Star, User } from 'lucide-react';
import { getAllReviews } from '../config/ReviewRequest';

// Import slick-carousel CSS
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Feedback() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await getAllReviews({ limit: 12 });
                setReviews(response.metadata.reviews || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Slider settings for react-slick
    const sliderSettings = {
        dots: true,
        infinite: reviews.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Render star rating
    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <section className="py-16 lg:py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
                        <p className="mt-4 text-gray-500">Đang tải đánh giá...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <section className="py-16 lg:py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Đánh giá từ khách hàng</h2>
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Đánh giá từ khách hàng</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Những trải nghiệm thực tế từ khách hàng đã sử dụng dịch vụ của chúng tôi
                    </p>
                </div>

                {/* Reviews Carousel */}
                <div className="feedback-carousel">
                    <Slider {...sliderSettings}>
                        {reviews.map((review) => (
                            <div key={review._id} className="px-3">
                                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-100">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22c55e] flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {review.userId?.avatar ? (
                                                <img
                                                    src={review.userId.avatar}
                                                    alt={review.userId.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {review.userId?.fullName || 'Người dùng'}
                                            </h3>
                                            <div className="flex items-center gap-2">{renderStars(review.rating)}</div>
                                        </div>
                                    </div>

                                    {/* Review Comment */}
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                                        {review.comment || 'Không có nhận xét'}
                                    </p>

                                    {/* Field Info */}
                                    {review.fieldId && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1">Sân bóng:</p>
                                            <p className="text-sm font-medium text-[#16A34A] truncate">
                                                {review.fieldId.name}
                                            </p>
                                        </div>
                                    )}

                                    {/* Review Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {review.images.slice(0, 3).map((image, idx) => (
                                                <img
                                                    key={idx}
                                                    src={image}
                                                    alt={`Review ${idx + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>

            {/* Custom Carousel Styles */}
            <style>{`
                .feedback-carousel .slick-dots {
                    bottom: -40px;
                }
                
                .feedback-carousel .slick-dots li button:before {
                    font-size: 10px;
                    color: #16A34A;
                    opacity: 0.3;
                }
                
                .feedback-carousel .slick-dots li.slick-active button:before {
                    opacity: 1;
                    color: #16A34A;
                }
                
                .feedback-carousel .slick-prev,
                .feedback-carousel .slick-next {
                    width: 40px;
                    height: 40px;
                    z-index: 10;
                }
                
                .feedback-carousel .slick-prev {
                    left: -50px;
                }
                
                .feedback-carousel .slick-next {
                    right: -50px;
                }
                
                .feedback-carousel .slick-prev:before,
                .feedback-carousel .slick-next:before {
                    font-size: 40px;
                    color: #16A34A;
                    opacity: 0.7;
                }
                
                .feedback-carousel .slick-prev:hover:before,
                .feedback-carousel .slick-next:hover:before {
                    opacity: 1;
                }

                @media (max-width: 1280px) {
                    .feedback-carousel .slick-prev {
                        left: -30px;
                    }
                    
                    .feedback-carousel .slick-next {
                        right: -30px;
                    }
                }

                @media (max-width: 768px) {
                    .feedback-carousel .slick-prev,
                    .feedback-carousel .slick-next {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    );
}

export default Feedback;
