import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, UserX, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const sections = [
    {
        id: 'thu-thap',
        icon: Eye,
        title: '1. Thu thập thông tin',
        content: `Chúng tôi thu thập các thông tin cá nhân mà bạn cung cấp khi sử dụng dịch vụ, bao gồm:
        • Họ và tên
        • Địa chỉ email
        • Số điện thoại
        • Địa chỉ nhà riêng
        • Thông tin thanh toán (số thẻ, thông tin tài khoản MoMo, VNPay)
        • Lịch sử đặt sân và sử dụng dịch vụ
        • Địa chỉ IP và dữ liệu trình duyệt khi truy cập website`,
    },
    {
        id: 'su-dung',
        icon: FileText,
        title: '2. Sử dụng thông tin',
        content: `Thông tin cá nhân của bạn được sử dụng cho các mục đích sau:
        • Xử lý và quản lý việc đặt sân bóng
        • Gửi thông báo xác nhận đặt sân qua email và SMS
        • Hỗ trợ khách hàng và giải đáp thắc mắc
        • Cải thiện và phát triển dịch vụ của chúng tôi
        • Gửi các thông tin khuyến mãi, ưu đãi (nếu bạn đồng ý)
        • Đảm bảo an toàn giao dịch và ngăn chặn gian lận
        • Tuân thủ các yêu cầu pháp lý`,
    },
    {
        id: 'bao-mat',
        icon: Lock,
        title: '3. Bảo vệ dữ liệu',
        content: `Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp sau:
        • Mã hóa dữ liệu quan trọng khi truyền tải và lưu trữ (SSL/TLS)
        • Lưu trữ dữ liệu trên máy chủ bảo mật với tường lửa và hệ thống giám sát 24/7
        • Giới hạn quyền truy cập thông tin cá nhân chỉ cho nhân viên được ủy quyền
        • Thực hiện sao lưu dữ liệu định kỳ để đảm bảo khả năng phục hồi
        • Đánh giá và cập nhật các biện pháp bảo mật thường xuyên`,
    },
    {
        id: 'quyen-nguoi-dung',
        icon: UserX,
        title: '4. Quyền của người dùng',
        content: `Bạn có các quyền sau đối với thông tin cá nhân của mình:
        • Quyền truy cập: Xem và tải về thông tin cá nhân của bạn
        • Quyền sửa đổi: Cập nhật hoặc chỉnh sửa thông tin không chính xác
        • Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân
        • Quyền từ chối: Từ chối nhận email marketing hoặc quảng cáo
        • Quyền di chuyển: Yêu cầu chuyển giao dữ liệu cho bạn hoặc bên thứ ba
        Để thực hiện các quyền này, vui lòng liên hệ qua email hoặc số điện thoại được cung cấp bên dưới.`,
    },
    {
        id: 'cookie',
        icon: Shield,
        title: '5. Sử dụng Cookie',
        content: `Website của chúng tôi sử dụng cookie và các công nghệ tương tự để:
        • Ghi nhớ tài khoản và sở thích của bạn
        • Phân tích lưu lượng truy cập và cải thiện trải nghiệm người dùng
        • Hiển thị nội dung phù hợp với sở thích của bạn
        • Đảm bảo tính bảo mật của phiên đăng nhập
        Bạn có thể từ chối cookie trong cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số chức năng của website.`,
    },
    {
        id: 'chinh-sach-cong-khai',
        icon: CheckCircle,
        title: '6. Chia sẻ thông tin với bên thứ ba',
        content: `Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ trong các trường hợp:
        • Với nhà cung cấp dịch vụ thanh toán (MoMo, VNPay) để xử lý giao dịch
        • Với các đối tác vận hành sân bóng để xác nhận đặt sân
        • Khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền
        • Để bảo vệ quyền và lợi ích hợp pháp của AloBooking
        Tất cả các bên thứ ba được chia sẻ thông tin đều cam kết bảo vệ dữ liệu của bạn.`,
    },
    {
        id: 'luu-tru',
        icon: Lock,
        title: '7. Thời gian lưu trữ',
        content: `Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để:
        • Duy trì tài khoản và cung cấp dịch vụ cho đến khi bạn yêu cầu xóa
        • Tuân thủ các yêu cầu pháp lý và nghĩa vụ thuế
        • Giải quyết các tranh chấp và xác minh giao dịch
        Thông tin tài khoản không hoạt động trong 2 năm sẽ tự động được xóa hoặc ẩn danh hóa, trừ khi pháp luật yêu cầu lưu giữ lâu hơn.`,
    },
    {
        id: 'thay-doi',
        icon: FileText,
        title: '8. Thay đổi chính sách',
        content: `Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Các thay đổi quan trọng sẽ được thông báo qua:
        • Email đến địa chỉ đã đăng ký
        • Thông báo trên website trước khi thay đổi có hiệu lực
        • Cập nhật ngày "Cập nhật lần cuối" ở đầu trang này
        Bằng việc tiếp tục sử dụng dịch vụ sau khi có thay đổi, bạn đồng ý với các điều khoản đã được cập nhật.`,
    },
    {
        id: 'lien-he',
        icon: Mail,
        title: '9. Liên hệ',
        content: `Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến Chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
        • Email: contact@sanbongpro.com
        • Điện thoại: 1900 1234 (8:00 - 22:00, thứ 2 đến CN)
        • Địa chỉ: 123 Đường Nguyễn Văn Linh, Quận Thanh Khê, TP. Đà Nẵng
        Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.`,
    },
];

function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#16A34A] to-[#22C55E] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Chính sách bảo mật
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Cam kết bảo vệ thông tin cá nhân của bạn một cách an toàn và minh bạch
                    </p>
                    <p className="text-sm text-white/70 mt-4">
                        Cập nhật lần cuối: 29 tháng 5, 2026
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-6 lg:px-12">
                    {/* Introduction */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md mb-8 border border-gray-100">
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            AloBooking ("chúng tôi", "AloBooking" hoặc "SânBóngPro") cam kết bảo vệ quyền riêng tư
                            của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ
                            và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ đặt sân bóng trực tuyến của chúng tôi.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-6">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] flex items-center justify-center shadow-md flex-shrink-0">
                                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <h2 className="text-lg md:text-xl font-bold text-gray-800 pt-1.5">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line pl-0 md:pl-16">
                                        {section.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200 text-center">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                            Bạn có thắc mắc về chính sách bảo mật?
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm md:text-base">
                            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                            <a
                                href="tel:19001234"
                                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base border border-gray-200"
                            >
                                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                1900 1234
                            </a>
                            <a
                                href="mailto:contact@sanbongpro.com"
                                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-[#16A34A] text-white font-semibold rounded-lg hover:bg-[#15803d] transition-colors text-sm md:text-base"
                            >
                                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                                Liên hệ qua email
                            </a>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-[#16A34A] hover:text-[#15803d] font-medium transition-colors text-sm md:text-base"
                        >
                            ← Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default PrivacyPage;
