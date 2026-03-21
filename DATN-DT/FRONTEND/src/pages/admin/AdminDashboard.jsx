import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../api/services';

function StatCard({ icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '22px 24px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color }}>
        {value ?? <span className="spinner" style={{ width: 20, height: 20, borderTopColor: color }} />}
      </div>
      {sub && <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  pending: 'var(--warning)', confirmed: 'var(--success)',
  cancelled: 'var(--danger)', completed: 'var(--info)',
};
const STATUS_LABELS = {
  pending: '⏳ Chờ xác nhận', confirmed: '✅ Đã xác nhận',
  cancelled: '❌ Đã hủy', completed: '🏁 Hoàn thành',
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, bookRes] = await Promise.allSettled([
          statsAPI.getOverview(),
          import('../../api/services').then(m => m.bookingAPI.getAll({ limit: 8, sort: '-createdAt' })),
        ]);
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data?.data);
        if (bookRes.status === 'fulfilled') {
          const raw = bookRes.value.data?.data;
          setRecentBookings(Array.isArray(raw) ? raw.slice(0, 8) : raw?.bookings?.slice(0, 8) || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmtRevenue = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M₫` : v >= 1000 ? `${(v / 1000).toFixed(0)}K₫` : `${v}₫`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>📊 Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tổng quan hệ thống SânBóngPro</p>
        </div>
        <Link to="/admin/stats" className="btn btn-primary btn-sm">📈 Xem báo cáo</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="🏟️" label="Sân bóng" color="var(--primary)"
          value={overview ? `${overview.pitches?.active || 0}/${overview.pitches?.total || 0}` : null}
          sub="Đang hoạt động / Tổng số" />
        <StatCard icon="📅" label="Tổng đặt sân" color="var(--info)"
          value={overview?.bookings?.total ?? null}
          sub={overview ? `${overview.bookings?.pending || 0} chờ xác nhận` : 'Tất cả thời gian'} />
        <StatCard icon="👤" label="Người dùng" color="var(--warning)"
          value={overview?.users?.total ?? null}
          sub="Đã đăng ký" />
        <StatCard icon="💰" label="Doanh thu" color="var(--success)"
          value={overview ? fmtRevenue(overview.revenue?.total || 0) : null}
          sub={overview ? `Đã thanh toán: ${fmtRevenue(overview.revenue?.paid || 0)}` : 'Từ booking thành công'} />
      </div>

      {/* Booking status breakdown */}
      {overview && (
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { key: 'pending', label: 'Chờ xác nhận', icon: '⏳' },
            { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
            { key: 'completed', label: 'Hoàn thành', icon: '🏁' },
            { key: 'cancelled', label: 'Đã hủy', icon: '❌' },
          ].map(({ key, label, icon }) => (
            <div key={key} style={{
              background: 'var(--bg-card)', border: `1px solid ${STATUS_COLORS[key]}44`,
              borderRadius: 'var(--radius-md)', padding: '14px 18px',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: STATUS_COLORS[key] }}>
                {overview.bookings?.[key] || 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { to: '/admin/pitches', icon: '🏟️', label: 'Quản lý sân', desc: 'Thêm, sửa, xóa sân' },
          { to: '/admin/bookings', icon: '📅', label: 'Đặt sân', desc: 'Duyệt & hủy đơn' },
          { to: '/admin/users', icon: '👤', label: 'Người dùng', desc: 'Quản lý tài khoản' },
          { to: '/admin/stats', icon: '📈', label: 'Thống kê', desc: 'Báo cáo doanh thu' },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '18px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'var(--transition)', cursor: 'pointer',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(22,163,74,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700 }}>📋 Đặt sân gần đây</h3>
          <Link to="/admin/bookings" style={{ fontSize: '0.82rem', color: 'var(--primary-light)' }}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /><span>Đang tải...</span></div>
        ) : recentBookings.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><h3>Chưa có đặt sân</h3></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Người đặt', 'Sân', 'Ngày', 'Giờ', 'Giá', 'TT Đặt', 'TT Thanh toán'].map((h) => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={b._id}
                    style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontSize: '0.875rem', fontWeight: 600 }}>
                      {b.user?.name || '—'}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.875rem' }}>{b.pitch?.name || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {b.date ? new Date(b.date).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {b.startTime} – {b.endTime}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-light)', whiteSpace: 'nowrap' }}>
                      {(b.totalPrice || 0).toLocaleString('vi-VN')}₫
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, background: `${STATUS_COLORS[b.status]}22`, color: STATUS_COLORS[b.status], border: `1px solid ${STATUS_COLORS[b.status]}44` }}>
                        {STATUS_LABELS[b.status]?.replace(/^\S+\s/, '') || b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, background: b.paymentStatus === 'paid' ? 'rgba(22,163,74,0.15)' : 'rgba(245,158,11,0.15)', color: b.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)', border: `1px solid ${b.paymentStatus === 'paid' ? 'rgba(22,163,74,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        {b.paymentStatus === 'paid' ? '✅ Đã TT' : '⏳ Chưa TT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
