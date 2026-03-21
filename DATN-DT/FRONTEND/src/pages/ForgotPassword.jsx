import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('Mã OTP đã được gửi tới email của bạn!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Đặt lại mật khẩu thành công!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⚽</div>
          <span>SânBóng<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
        </div>

        {step === 1 && (
          <>
            <h1 className="auth-title">Quên mật khẩu?</h1>
            <p className="auth-subtitle">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '📤 Gửi mã OTP'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="auth-title">Đặt lại mật khẩu</h1>
            <p className="auth-subtitle">Nhập mã OTP đã gửi tới <strong>{email}</strong></p>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">Mã OTP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                  style={{ fontSize: '1.2rem', letterSpacing: '0.2em', textAlign: 'center' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '🔐 Đặt lại mật khẩu'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                style={{ marginTop: 10 }}
                onClick={() => setStep(1)}
              >
                ← Nhập lại email
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 10 }}>Đặt lại thành công!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Mật khẩu của bạn đã được cập nhật.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">
              🚀 Đăng nhập ngay
            </Link>
          </div>
        )}

        {step !== 3 && (
          <p className="auth-footer">
            Nhớ mật khẩu rồi? <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        )}
      </div>
    </div>
  );
}
