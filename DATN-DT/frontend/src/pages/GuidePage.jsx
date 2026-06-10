import { Link } from 'react-router-dom';
import { UserPlus, MapPin, Calendar, CreditCard, MessageCircle, ChevronRight, Phone, Mail, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const steps = [
    {
        id: 1,
        title: 'Đăng ký / Đăng nhập tài khoản',
        description: 'Tạo tài khoản mới hoặc đăng nhập nếu đã có tài khoản. Chỉ cần cung cấp thông tin cơ bản để bắt đầu.',
        icon: UserPlus,
    },
    {
        id: 2,
        title: 'Chọn sân bóng phù hợp',
        description: 'Duyệt qua danh sách các sân bóng, lọc theo loại sân (5 người, 7 người, 11 người), khu vực và mức giá phù hợp.',
        icon: MapPin,
    },
    {
        id: 3,
        title: 'Chọn khung giờ và xác nhận đặt sân',
        description: 'Chọn ngày và khung giờ bạn muốn đặt. Hệ thống sẽ hiển thị các khung giờ còn trống để bạn lựa chọn.',
        icon: Calendar,
    },
    {
        id: 4,
        title: 'Thanh toán và nhận xác nhận',
        description: 'Chọn phương thức thanh toán (MoMo, VNPay hoặc thanh toán khi đến sân). Nhận xác nhận qua email ngay lập tức.',
        icon: CreditCard,
    },
];

function GuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#16A34A] to-[#22C55E] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Hướng dẫn đặt sân bóng trực tuyến
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Chỉ với 4 bước đơn giản, bạn đã có thể đặt sân bóng yêu thích một cách dễ dàng
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                            Các bước đặt sân
                        </h2>
                        <p className="text-gray-500">Làm theo hướng dẫn chi tiết bên dưới để đặt sân thành công</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.id}
                                    className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                                >
                                    <div className="flex items-start gap-4 md:gap-5">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl md:text-3xl font-bold text-gray-200">
                                                    {String(step.id).padStart(2, '0')}
                                                </span>
                                                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Link to FAQ */}
                    <div className="text-center mt-12 md:mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                            Bạn có thắc mắc?
                        </h3>
                        <p className="text-gray-500 mb-4 text-sm md:text-base">
                            Tìm câu trả lời nhanh chóng trong mục câu hỏi thường gặp
                        </p>
                        <Link
                            to="/cau-hoi-thuong-gap"
                            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#16A34A] hover:bg-[#15803d] text-white text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Xem câu hỏi thường gặp
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#16A34A]/20 flex items-center justify-center mx-auto mb-5 md:mb-6">
                        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-[#16A34A]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                        Bạn cần hỗ trợ thêm?
                    </h2>
                    <p className="text-gray-400 mb-7 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
                        Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                        <a
                            href="tel:0355728627"
                            className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
                        >
                            <Phone className="w-4 h-4 md:w-5 md:h-5" />
                            0355728627
                        </a>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-[#16A34A] text-white font-semibold rounded-lg hover:bg-[#15803d] transition-colors text-sm md:text-base"
                        >
                            Liên hệ hỗ trợ
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default GuidePage;
