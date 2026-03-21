import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',           icon: '📊', label: 'Dashboard',       end: true },
  { to: '/admin/pitches',   icon: '🏟️', label: 'Quản lý sân' },
  { to: '/admin/bookings',  icon: '📅', label: 'Quản lý đặt sân' },
  { to: '/admin/users',     icon: '👤', label: 'Quản lý người dùng' },
  { to: '/admin/stats',     icon: '💰', label: 'Thống kê & Báo cáo' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.1rem',
              boxShadow: 'var(--shadow-green)',
            }}>⚽</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>Admin Panel</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)' }}>SânBóngPro</div>
            </div>
          </div>
          {/* Admin info */}
          <div style={{
            background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quản trị viên</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '6px 10px 10px' }}>
            Menu chính
          </div>
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9, marginBottom: 3,
                fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                  : 'transparent',
                boxShadow: isActive ? 'var(--shadow-green)' : 'none',
                textDecoration: 'none',
                transition: 'var(--transition)',
              })}
            >
              <span style={{ fontSize: '1.05rem' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <NavLink
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9, marginBottom: 6,
              fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)',
              textDecoration: 'none', transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            🌐 Xem trang web
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', borderRadius: 9,
              border: 'none', background: 'transparent',
              fontSize: '0.875rem', fontWeight: 500, color: 'var(--danger)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────── */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: 60, background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)',
            }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Backend kết nối</span>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
