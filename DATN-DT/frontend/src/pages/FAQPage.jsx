import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const faqs = [
    // Đặt sân
    {
        question: 'Làm sao để hủy đặt sân?',
        answer: 'Bạn có thể hủy đặt sân trong mục "Lịch sử đặt sân" trước giờ bắt đầu ít nhất 2 tiếng. Phí hủy sẽ được áp dụng theo chính sách của sân.',
    },
    {
        question: 'Tôi có thể đặt sân trước bao lâu?',
        answer: 'Bạn có thể đặt sân trước tối đa 30 ngày. Đối với các sân có lịch kín, nên đặt sớm để đảm bảo có chỗ.',
    },
    {
        question: 'Tôi có thể đặt sân cho người khác không?',
        answer: 'Có, bạn có thể đặt sân cho bạn bè hoặc đồng đội. Trong quá trình đặt, hãy cung cấp thông tin chính xác và thông báo cho người đến sân đúng giờ.',
    },
    {
        question: 'Làm sao biết đặt sân thành công?',
        answer: 'Sau khi đặt thành công, bạn sẽ nhận được email và thông báo trong ứng dụng xác nhận đặt sân. Mã đặt sân sẽ được gửi kèm để bạn kiểm tra.',
    },
    {
        question: 'Tôi có thể thay đổi thông tin đặt sân không?',
        answer: 'Bạn có thể thay đổi khung giờ hoặc ngày đặt trong mục "Lịch sử đặt sân" trước khi sân bắt đầu. Nếu cần thay đổi thông tin khác, vui lòng liên hệ hỗ trợ.',
    },
    // Thanh toán
    {
        question: 'Các phương thức thanh toán được chấp nhận?',
        answer: 'Chúng tôi hỗ trợ thanh toán qua MoMo, VNPay và thanh toán trực tiếp tại sân khi đến.',
    },
    {
        question: 'Thanh toán online có an toàn không?',
        answer: 'Tất cả giao dịch thanh toán online đều được mã hóa và xử lý qua cổng thanh toán được chứng nhận an toàn. Thông tin thẻ của bạn không được lưu trữ trên hệ thống.',
    },
    {
        question: 'Khi nào tôi cần thanh toán?',
        answer: 'Nếu chọn thanh toán online (MoMo, VNPay), bạn cần thanh toán ngay để xác nhận đặt sân. Nếu chọn thanh toán tại sân, bạn có thể thanh toán khi đến.',
    },
    {
        question: 'Tôi có được hoàn tiền nếu hủy đặt sân không?',
        answer: 'Chính sách hoàn tiền phụ thuộc vào thời điểm hủy: hủy trước 24 giờ được hoàn 100%, hủy trước 12 giờ được hoàn 50%, hủy trong vòng 12 giờ không được hoàn tiền.',
    },
    // Mã giảm giá
    {
        question: 'Mã giảm giá có thể sử dụng nhiều lần không?',
        answer: 'Tùy thuộc vào loại mã giảm giá. Một số mã chỉ sử dụng được một lần, một số khác có thể sử dụng nhiều lần trong thời hạn hiệu lực.',
    },
    {
        question: 'Làm sao nhận được mã giảm giá?',
        answer: 'Bạn có thể nhận mã giảm giá từ email khuyến mãi, thông báo trong ứng dụng, hoặc theo dõi các chương trình khuyến mãi trên trang chủ và mạng xã hội của chúng tôi.',
    },
    {
        question: 'Mã giảm giá có thể kết hợp với ưu đãi khác không?',
        answer: 'Thông thường, mỗi đơn đặt sân chỉ áp dụng một mã giảm giá. Bạn nên chọn mã có giá trị cao nhất để tiết kiệm chi phí.',
    },
    // Sân bóng
    {
        question: 'Tôi có thể xem thông tin chi tiết của sân bóng không?',
        answer: 'Có, tại trang chi tiết mỗi sân bóng, bạn có thể xem hình ảnh, tiện ích, bảng giá theo khung giờ, đánh giá từ người dùng và thông tin liên hệ của sân.',
    },
    {
        question: 'Sân bóng có cho thuê dụng cụ không?',
        answer: 'Tùy từng sân. Một số sân có cho thuê bóng, áo đấu và dụng cụ khác. Thông tin này được ghi chú trong trang chi tiết từng sân.',
    },
    {
        question: 'Sân bóng có chỗ để xe không?',
        answer: 'Hầu hết các sân bóng đều có bãi để xe máy và ô tô. Thông tin chi tiết về chỗ để xe được hiển thị trong trang thông tin của từng sân.',
    },
    {
        question: 'Tôi có thể đặt sân liên tục nhiều khung giờ không?',
        answer: 'Có, bạn có thể đặt nhiều khung giờ liên tục nếu các khung giờ đó còn trống. Điều này thuận tiện khi bạn muốn chơi trong thời gian dài.',
    },
    // Tài khoản
    {
        question: 'Tôi quên mật khẩu thì phải làm sao?',
        answer: 'Tại trang đăng nhập, nhấn "Quên mật khẩu" và nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu vào email của bạn.',
    },
    {
        question: 'Làm sao thay đổi thông tin cá nhân?',
        answer: 'Đăng nhập và vào mục "Tài khoản của tôi" trong hồ sơ người dùng để cập nhật thông tin cá nhân như họ tên, số điện thoại, email và avatar.',
    },
    {
        question: 'Tài khoản của tôi có bị giới hạn gì không?',
        answer: 'Tài khoản thường không có giới hạn về số lần đặt sân. Tuy nhiên, với các ưu đãi và mã giảm giá, có thể có giới hạn sử dụng tùy theo từng chương trình.',
    },
    // Liên hệ & Hỗ trợ
    {
        question: 'Tôi gặp sự cố khi đặt sân, phải làm sao?',
        answer: 'Bạn có thể liên hệ hotline 1900 1234 (24/7) hoặc gửi email về support@alosanbong.com. Đội ngũ hỗ trợ sẽ giúp bạn giải quyết trong thời gian sớm nhất.',
    },
    {
        question: 'Làm sao để trở thành đối tác cho thuê sân?',
        answer: 'Nếu bạn sở hữu hoặc quản lý sân bóng và muốn đăng ký làm đối tác, vui lòng liên hệ qua email partnership@alosanbong.com hoặc hotline để được tư vấn chi tiết.',
    },
];

function FAQPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#16A34A] to-[#22C55E] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Câu hỏi thường gặp
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        Giải đáp những thắc mắc thường gặp khi sử dụng dịch vụ đặt sân bóng
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-20 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-12">
                    <div className="space-y-4">
                        {faqs.map((item, index) => (
                            <details
                                key={index}
                                className="group bg-gray-50 rounded-xl overflow-hidden"
                            >
                                <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-100 transition-colors">
                                    <span className="font-semibold text-gray-800 pr-4 text-sm md:text-base">
                                        {item.question}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
                                </summary>
                                <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100 pt-4">
                                    {item.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                        Bạn cần hỗ trợ thêm?
                    </h2>
                    <p className="text-gray-400 mb-7 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
                        Liên hệ với chúng tôi qua email: support@alosanbong.com
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default FAQPage;
