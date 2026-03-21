import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
    if (form.phone && !/^[0-9]{10,11}$/.test(form.phone)) return toast.error('Số điện thoại không hợp lệ (10-11 chữ số)');
    setLoading(true);
    try {
      const { name, email, phone, password } = form;
      await register({ name, email, phone: phone || undefined, password, role: 'user' });
      toast.success('Đăng ký thành công! Đang đăng nhập...');
      await login({ email, password });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="logo-icon">⚽</div>
          <span>SânBóng<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
        </div>

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Bắt đầu đặt sân ngay hôm nay</p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input type="text" name="name" className="form-control" placeholder="Nguyễn Văn A"
                value={form.name} onChange={handleChange} required autoFocus />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email *</label>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input type="email" name="email" className="form-control" placeholder="your@email.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <div className="input-group">
              <span className="input-icon">📞</span>
              <input type="tel" name="phone" className="form-control" placeholder="0912345678"
                value={form.phone} onChange={handleChange} maxLength={11} />
            </div>
          </div>

          {/* Password */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type={showPw ? 'text' : 'password'} name="password" className="form-control"
                  placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={handleChange} required minLength={6} />
                <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận *</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type={showPw ? 'text' : 'password'} name="confirmPassword" className="form-control"
                  placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <span className="spinner" /> : '✨ Đăng ký'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
