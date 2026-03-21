import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState('info');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Nếu backend có endpoint update profile
      // Tạm thời cập nhật local state
      setUser((u) => ({ ...u, name: form.name }));
      toast.success('Đã lưu hồ sơ!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }
    setChangingPw(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPw(false);
    }
  };

  const ROLE_LABELS = { user: '👤 Người dùng', owner: '🏟️ Chủ sân', admin: '⚙️ Quản trị viên' };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title">👤 Hồ sơ cá nhân</h1>
          <p className="section-subtitle">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Avatar card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, flexShrink: 0,
              border: '3px solid var(--primary)',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>{user?.email}</div>
              <span className="badge badge-primary">{ROLE_LABELS[user?.role] || user?.role}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            📋 Thông tin
          </button>
          <button className={`tab-btn ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            🔒 Đổi mật khẩu
          </button>
        </div>

        {tab === 'info' && (
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 5 }}>
                    Email không thể thay đổi
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <input
                    className="form-control"
                    value={ROLE_LABELS[user?.role] || user?.role}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : '💾 Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <div className="input-group">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-control"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <div className="input-group">
                    <span className="input-icon">🔑</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <div className="input-group">
                    <span className="input-icon">🔑</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Nhập lại mật khẩu mới"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={changingPw}>
                  {changingPw ? <span className="spinner" /> : '🔄 Đổi mật khẩu'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
