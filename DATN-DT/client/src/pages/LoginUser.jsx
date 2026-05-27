import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import Header from '../components/Header';
import { requestLogin, requestLoginGoogle } from '../config/UserRequest';
import { useStore } from '../hooks/useStore';
import { message } from 'antd';
import Footer from '../components/Footer';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginUser() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();
    const { fetchAuth } = useStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestLogin({ ...formData, rememberMe });
            message.success('Đăng nhập thành công!');
            fetchAuth();
            navigate('/');
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const data = {
                credential,
            };
            const res = await requestLoginGoogle(data);
            message.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login');
        // Handle Google OAuth
    };

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            <main className="min-h-[calc(100vh-72px)] flex">
                {/* Left Side - Image */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070')] 
                                   bg-cover bg-center"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e14]/90 via-[#16A34A]/80 to-[#22c55e]/70" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-24">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 mb-12">
                            <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
                                <rect
                                    x="2"
                                    y="6"
                                    width="36"
                                    height="28"
                                    rx="3"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    fill="none"
                                />
                                <line x1="20" y1="6" x2="20" y2="34" stroke="white" strokeWidth="2" />
                                <circle cx="20" cy="20" r="5" stroke="white" strokeWidth="2" fill="none" />
                                <rect x="2" y="13" width="6" height="14" stroke="white" strokeWidth="1.5" fill="none" />
                                <rect
                                    x="32"
                                    y="13"
                                    width="6"
                                    height="14"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    fill="none"
                                />
                            </svg>
                            <span className="text-2xl font-bold text-white">
                                SânBóng<span className="text-white/80">Pro</span>
                            </span>
                        </Link>

                        {/* Slogan */}
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                            Đặt sân bóng
                            <br />
                            <span className="text-[#86efac]">nhanh chóng</span>
                            <br />& tiện lợi
                        </h1>

                        <p className="text-lg text-white/70 max-w-md leading-relaxed mb-10">
                            Tham gia cùng hơn 50,000+ người chơi bóng đá. Tìm sân, đặt lịch và thanh toán chỉ trong vài
                            giây.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                'Đặt sân 24/7, mọi lúc mọi nơi',
                                'Thanh toán an toàn, bảo mật',
                                'Hỗ trợ khách hàng tận tình',
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white/90">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mb-40" />
                    <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full" />
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                    <div className="w-full max-w-[440px]">
                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 lg:p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
                                <p className="text-gray-500">Chào mừng bạn trở lại! Vui lòng đăng nhập.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email của bạn"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg
                                                     text-gray-700 placeholder-gray-400
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                     transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu"
                                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-lg
                                                     text-gray-700 placeholder-gray-400
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                     transition-all duration-200"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div
                                            onClick={() => setRememberMe(!rememberMe)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                                                      ${
                                                          rememberMe
                                                              ? 'bg-[#16A34A] border-[#16A34A]'
                                                              : 'border-gray-300 group-hover:border-[#16A34A]'
                                                      }`}
                                        >
                                            {rememberMe && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-[#16A34A] hover:text-[#15803d] font-medium transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#16A34A] hover:bg-[#15803d] 
                                             text-white font-semibold rounded-lg
                                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                                             transition-all duration-200 active:scale-[0.98]"
                                >
                                    Đăng nhập
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-sm text-gray-400">Hoặc</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Google Login */}
                            <div style={{ marginTop: '20px' }}>
                                <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                                    <GoogleLogin
                                        onSuccess={handleSuccess}
                                        onError={() => console.log('Login Failed')}
                                    />
                                </GoogleOAuthProvider>
                            </div>
                            {/* Register Link */}
                            <p className="text-center mt-6 text-gray-600">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    className="text-[#16A34A] hover:text-[#15803d] font-semibold transition-colors"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <p className="text-center mt-6 text-sm text-gray-400">
                            Bằng việc đăng nhập, bạn đồng ý với{' '}
                            <Link to="/terms" className="text-gray-500 hover:text-[#16A34A] underline">
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link to="/privacy" className="text-gray-500 hover:text-[#16A34A] underline">
                                Chính sách bảo mật
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default LoginUser;
