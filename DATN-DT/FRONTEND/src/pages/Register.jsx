import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── SVG Icons ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error('Mật khẩu xác nhận không khớp');
    if (form.phone && !/^[0-9]{10,11}$/.test(form.phone))
      return toast.error('Số điện thoại không hợp lệ (10-11 chữ số)');
    setLoading(true);
    try {
      const { name, email, phone, password } = form;
      await register({ name, email, phone: phone || undefined, password, role: 'user' });
      toast.success('Đăng ký thành công!');
      await login({ email, password });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* ── Left: Green Hero Panel ── */}
      <div className="auth-left-panel">
        <div className="auth-left-deco" />
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="logo-box">⚽</div>
            <span>SânBóngPro</span>
          </div>

          <h1 className="auth-left-tagline">
            Tham gia cùng<br />
            <span className="highlight">50,000+</span> người<br />
            chơi bóng đá
          </h1>

          <p className="auth-left-desc">
            Tạo tài khoản miễn phí và bắt đầu đặt sân ngay hôm nay. Quản lý lịch đặt, xem lịch sử và nhiều hơn nữa.
          </p>

          <div className="auth-left-features">
            {[
              'Đăng ký miễn phí, không mất phí',
              'Đặt sân trực tuyến 24/7',
              'Nhận thông báo xác nhận ngay lập tức',
            ].map((f) => (
              <div className="auth-left-feature" key={f}>
                <div className="feature-check">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-right-panel">
        <div className="auth-form-card">
          <h1 className="auth-form-title">Tạo tài khoản</h1>
          <p className="auth-form-subtitle">Bắt đầu đặt sân ngay hôm nay</p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <div className="input-group">
                <span className="input-icon"><IconUser /></span>
                <input
                  type="text"
                  name="name"
                  id="reg-name"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="input-group">
                <span className="input-icon"><IconEmail /></span>
                <input
                  type="email"
                  name="email"
                  id="reg-email"
                  className="form-control"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div className="input-group">
                <span className="input-icon"><IconPhone /></span>
                <input
                  type="tel"
                  name="phone"
                  id="reg-phone"
                  className="form-control"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={11}
                />
              </div>
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mật khẩu *</label>
                <div className="input-group">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    id="reg-password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password"
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Xác nhận *</label>
                <div className="input-group">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type={showCPw ? 'text' : 'password'}
                    name="confirmPassword"
                    id="reg-confirm"
                    className="form-control"
                    placeholder="Nhập lại"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowCPw(!showCPw)}
                    aria-label="Toggle confirm password"
                  >
                    {showCPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="reg-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? <span className="spinner" /> : <>Đăng ký &nbsp;→</>}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">Hoặc</div>

          {/* Google */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={() => toast('Tính năng đang phát triển', { icon: '🔧' })}
          >
            <IconGoogle />
            Đăng ký bằng Google
          </button>

          {/* Footer link */}
          <p className="auth-form-footer">
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập</Link>
          </p>

          {/* Terms */}
          <p className="auth-form-terms">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <a href="#">Điều khoản dịch vụ</a> và{' '}
            <a href="#">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
}
