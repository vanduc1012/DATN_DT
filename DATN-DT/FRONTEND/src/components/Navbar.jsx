import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất!');
    navigate('/login');
    setMenuOpen(false);
  };

  const nav = [
    { to: '/', label: 'Trang chủ' },
    { to: '/pitches', label: 'Sân bóng' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">⚽</div>
          <span>SânBóng<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} className={isActive(to) && to !== '/' ? 'active' : location.pathname === '/' && to === '/' ? 'active' : ''}>
              {label}
            </Link>
          ))}
          {user && (
            <Link to="/my-bookings" className={isActive('/my-bookings') ? 'active' : ''}>
              Lịch đặt
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="nav-user-menu">
              <div
                className="nav-avatar"
                onClick={() => setMenuOpen(!menuOpen)}
                title={user.name}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className={`user-dropdown ${menuOpen ? 'open' : ''}`}>
                <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  👤 Hồ sơ cá nhân
                </Link>
                <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                  📅 Lịch đặt sân
                </Link>
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link to="/manage/pitches" onClick={() => setMenuOpen(false)}>
                    🏟️ Quản lý sân
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    ⚙️ Admin Panel
                  </Link>
                )}
                <div className="divider" />
                <button onClick={handleLogout}>🚪 Đăng xuất</button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}>{label}</Link>
          ))}
          {user && <Link to="/my-bookings" onClick={() => setMobileOpen(false)}>Lịch đặt</Link>}
          {!user && (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Đăng ký</Link>
            </>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}
