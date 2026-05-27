import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                            {/* Football Field Icon */}
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                                    <rect
                                        x="2"
                                        y="6"
                                        width="36"
                                        height="28"
                                        rx="3"
                                        stroke="#16A34A"
                                        strokeWidth="2.5"
                                        fill="none"
                                    />
                                    <line x1="20" y1="6" x2="20" y2="34" stroke="#16A34A" strokeWidth="2" />
                                    <circle cx="20" cy="20" r="5" stroke="#16A34A" strokeWidth="2" fill="none" />
                                    <rect
                                        x="2"
                                        y="13"
                                        width="6"
                                        height="14"
                                        stroke="#16A34A"
                                        strokeWidth="1.5"
                                        fill="none"
                                    />
                                    <rect
                                        x="32"
                                        y="13"
                                        width="6"
                                        height="14"
                                        stroke="#16A34A"
                                        strokeWidth="1.5"
                                        fill="none"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-[#16A34A] tracking-tight">
                                SânBóng<span className="text-gray-800">Pro</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Nền tảng đặt sân bóng đá trực tuyến hàng đầu Việt Nam. Kết nối đam mê, thỏa sức tranh tài.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#16A34A] hover:text-white transition-all duration-300"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#16A34A] hover:text-white transition-all duration-300"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#16A34A] hover:text-white transition-all duration-300"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-6 text-lg">Liên kết nhanh</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-500 hover:text-[#16A34A] transition-colors inline-flex items-center gap-2 group"
                                >
                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/fields"
                                    className="text-gray-500 hover:text-[#16A34A] transition-colors inline-flex items-center gap-2 group"
                                >
                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                    Danh sách sân
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/huong-dan"
                                    className="text-gray-500 hover:text-[#16A34A] transition-colors inline-flex items-center gap-2 group"
                                >
                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                    Hướng dẫn đặt sân
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blogs"
                                    className="text-gray-500 hover:text-[#16A34A] transition-colors inline-flex items-center gap-2 group"
                                >
                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                    Tin tức & Sự kiện
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-6 text-lg">Hỗ trợ khách hàng</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/contact" className="text-gray-500 hover:text-[#16A34A] transition-colors">
                                    Trung tâm trợ giúp
                                </Link>
                            </li>
                            <li>
                                <Link to="/policy" className="text-gray-500 hover:text-[#16A34A] transition-colors">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-500 hover:text-[#16A34A] transition-colors">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-500 hover:text-[#16A34A] transition-colors">
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-6 text-lg">Thông tin liên hệ</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-500">
                                <MapPin className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                                <span>123 Đường Nguyễn Văn Linh, Quận Thanh Khê, TP. Đà Nẵng</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Phone className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                                <a href="tel:19001234" className="hover:text-[#16A34A] transition-colors">
                                    1900 1234
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Mail className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                                <a
                                    href="mailto:contact@sanbongpro.com"
                                    className="hover:text-[#16A34A] transition-colors"
                                >
                                    contact@sanbongpro.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} SânBóngPro. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link to="/privacy" className="hover:text-[#16A34A] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-[#16A34A] transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
