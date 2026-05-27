import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Shield,
    KeyRound,
    CheckCircle,
    RefreshCw,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestForgotPassword, requestResetPassword } from '../config/UserRequest';
import { message } from 'antd';

// Bước 1: Nhập email
function StepEmail({ onNext, loading, setLoading }) {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestForgotPassword({ email });
            message.success('Mã OTP đã được gửi đến email của bạn!');
            onNext(email);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#16A34A]/20 to-[#22c55e]/10 rounded-2xl flex items-center justify-center border border-[#16A34A]/20">
                    <Mail className="w-8 h-8 text-[#16A34A]" />
                </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                                     text-gray-700 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                     transition-all duration-200"
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#16A34A] hover:bg-[#15803d]
                             text-white font-semibold rounded-xl
                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                             transition-all duration-200 active:scale-[0.98]
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            Gửi mã OTP
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
                Nhớ mật khẩu rồi?{' '}
                <Link to="/login" className="text-[#16A34A] hover:text-[#15803d] font-semibold transition-colors">
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
}

// Bước 2: Nhập OTP + mật khẩu mới
function StepReset({ email, onBack, onSuccess, loading, setLoading }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCount, setResendCount] = useState(0);

    const otpString = otp.join('');

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return;
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = Array(6).fill('');
        pasted.split('').forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pasted.length, 5);
        const nextInput = document.getElementById(`otp-input-${nextIndex}`);
        if (nextInput) nextInput.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otpString.length < 6) {
            message.warning('Vui lòng nhập đủ 6 chữ số OTP!');
            return;
        }
        if (newPassword !== confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (newPassword.length < 8) {
            message.warning('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }
        setLoading(true);
        try {
            await requestResetPassword({ otp: otpString, newPassword });
            message.success('Đặt lại mật khẩu thành công!');
            onSuccess();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCount >= 3) {
            message.warning('Bạn đã gửi lại OTP quá nhiều lần. Vui lòng thử lại sau!');
            return;
        }
        setResendLoading(true);
        try {
            await requestForgotPassword({ email });
            setResendCount((c) => c + 1);
            setOtp(['', '', '', '', '', '']);
            message.success('Mã OTP mới đã được gửi!');
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#16A34A]/20 to-[#22c55e]/10 rounded-2xl flex items-center justify-center border border-[#16A34A]/20">
                    <Shield className="w-8 h-8 text-[#16A34A]" />
                </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Xác nhận OTP</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Nhập mã OTP đã được gửi đến{' '}
                    <span className="font-semibold text-[#16A34A]">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* OTP Inputs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Mã OTP (6 chữ số)
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 
                                          bg-gray-50 text-gray-800 transition-all duration-200
                                          focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20
                                          ${digit
                                        ? 'border-[#16A34A] bg-[#16A34A]/5'
                                        : 'border-gray-200 focus:border-[#16A34A]'
                                    }`}
                                style={{ width: '44px', height: '52px' }}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                    <p className="text-center mt-3">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="text-sm text-[#16A34A] hover:text-[#15803d] font-medium transition-colors disabled:opacity-50 flex items-center gap-1 mx-auto"
                        >
                            {resendLoading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            Gửi lại mã OTP
                        </button>
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">Mật khẩu mới</span>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                                     text-gray-700 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                     transition-all duration-200"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl
                                     text-gray-700 placeholder-gray-400
                                     focus:outline-none focus:ring-2 transition-all duration-200
                                     ${confirmPassword && newPassword !== confirmPassword
                                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                                : 'border-gray-200 focus:ring-[#16A34A]/20 focus:border-[#16A34A]'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <span>✕</span> Mật khẩu không khớp
                        </p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                        <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                            <span>✓</span> Mật khẩu khớp
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || otpString.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#16A34A] hover:bg-[#15803d]
                             text-white font-semibold rounded-xl
                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                             transition-all duration-200 active:scale-[0.98]
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <KeyRound className="w-5 h-5" />
                            Đặt lại mật khẩu
                        </>
                    )}
                </button>
            </form>

            {/* Back */}
            <button
                type="button"
                onClick={onBack}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700
                         rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50
                         text-sm font-medium transition-all duration-200"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
            </button>
        </div>
    );
}

// Bước 3: Thành công
function StepSuccess() {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#16A34A]/20 to-[#22c55e]/10 rounded-full flex items-center justify-center border-2 border-[#16A34A]/30 animate-scale-in">
                    <CheckCircle className="w-10 h-10 text-[#16A34A]" />
                </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Thành công!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.
            </p>

            <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#16A34A] hover:bg-[#15803d]
                         text-white font-semibold rounded-xl
                         shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                         transition-all duration-200 active:scale-[0.98]"
            >
                Đăng nhập ngay
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: email, 2: otp + password, 3: success
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailNext = (emailValue) => {
        setEmail(emailValue);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSuccess = () => {
        setStep(3);
    };

    // Progress indicator
    const steps = [
        { num: 1, label: 'Xác minh email' },
        { num: 2, label: 'Nhập OTP' },
        { num: 3, label: 'Hoàn thành' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.35s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>

            <Header />

            <main className="min-h-[calc(100vh-72px)] flex">
                {/* Left Side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070')]
                                   bg-cover bg-center"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e14]/90 via-[#16A34A]/80 to-[#22c55e]/70" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-24">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 mb-12">
                            <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
                                <rect x="2" y="6" width="36" height="28" rx="3" stroke="white" strokeWidth="2.5" fill="none" />
                                <line x1="20" y1="6" x2="20" y2="34" stroke="white" strokeWidth="2" />
                                <circle cx="20" cy="20" r="5" stroke="white" strokeWidth="2" fill="none" />
                                <rect x="2" y="13" width="6" height="14" stroke="white" strokeWidth="1.5" fill="none" />
                                <rect x="32" y="13" width="6" height="14" stroke="white" strokeWidth="1.5" fill="none" />
                            </svg>
                            <span className="text-2xl font-bold text-white">
                                SânBóng<span className="text-white/80">Pro</span>
                            </span>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                            Bảo mật
                            <br />
                            <span className="text-[#86efac]">tài khoản</span>
                            <br />
                            của bạn
                        </h1>

                        <p className="text-lg text-white/70 max-w-md leading-relaxed mb-10">
                            Chúng tôi gửi mã OTP đến email của bạn để xác minh danh tính. Mã OTP có hiệu lực trong
                            10 phút.
                        </p>

                        {/* Security Tips */}
                        <div className="space-y-4">
                            {[
                                'Không chia sẻ mã OTP cho bất kỳ ai',
                                'Mã OTP chỉ có hiệu lực 10 phút',
                                'Liên hệ hỗ trợ nếu gặp sự cố',
                            ].map((tip, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white/90 text-sm">{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mb-40" />
                    <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full" />
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                    <div className="w-full max-w-[440px]">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-0 mb-8">
                            {steps.map((s, index) => (
                                <div key={s.num} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                                ${step > s.num
                                                    ? 'bg-[#16A34A] text-white'
                                                    : step === s.num
                                                        ? 'bg-[#16A34A] text-white ring-4 ring-[#16A34A]/20'
                                                        : 'bg-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {step > s.num ? '✓' : s.num}
                                        </div>
                                        <span
                                            className={`text-xs mt-1.5 font-medium whitespace-nowrap transition-colors duration-300
                                                ${step >= s.num ? 'text-[#16A34A]' : 'text-gray-400'}`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`w-16 h-0.5 mx-2 mb-5 transition-all duration-500
                                                ${step > s.num ? 'bg-[#16A34A]' : 'bg-gray-200'}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 lg:p-10">
                            {step === 1 && (
                                <StepEmail onNext={handleEmailNext} loading={loading} setLoading={setLoading} />
                            )}
                            {step === 2 && (
                                <StepReset
                                    email={email}
                                    onBack={handleBack}
                                    onSuccess={handleSuccess}
                                    loading={loading}
                                    setLoading={setLoading}
                                />
                            )}
                            {step === 3 && <StepSuccess />}
                        </div>

                        {/* Footer note */}
                        {step !== 3 && (
                            <p className="text-center mt-6 text-sm text-gray-400">
                                Cần hỗ trợ?{' '}
                                <a href="mailto:support@sanbongpro.vn" className="text-gray-500 hover:text-[#16A34A] transition-colors">
                                    Liên hệ chúng tôi
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ForgotPassword;
