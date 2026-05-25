import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ── SVG Icons ── */
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất!');
    navigate('/login');
    setMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/pitches?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/pitches');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">⚽</div>
          <span>SânBóng</span>
        </Link>

        {/* Search Bar in Navbar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <div className="nav-search-container">
            <span className="nav-search-icon"><IconSearch /></span>
            <input
              type="text"
              placeholder="Tìm kiếm sân bóng theo tên, địa điểm..."
              className="nav-search-input"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
        </form>

        {/* Actions / Auth state */}
        <div className="nav-actions">
          {user ? (
            <>
              {/* Notification Bell */}
              <button
                className="nav-bell-btn"
                onClick={() => toast('Không có thông báo mới', { icon: '🔔' })}
                title="Thông báo"
              >
                <IconBell />
              </button>

              {/* User Dropdown */}
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

              {/* "Đặt sân ngay" green button for logged-in user */}
              <Link to="/pitches" className="btn btn-primary btn-sm" style={{ borderRadius: '8px', padding: '8px 16px' }}>
                <IconCalendar />
                Đặt sân ngay
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginRight: 4 }}>
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ borderRadius: '8px', padding: '8px 18px' }}>
                Đăng ký
              </Link>
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
          <Link to="/" onClick={() => setMobileOpen(false)}>Trang chủ</Link>
          <Link to="/pitches" onClick={() => setMobileOpen(false)}>Sân bóng</Link>
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
