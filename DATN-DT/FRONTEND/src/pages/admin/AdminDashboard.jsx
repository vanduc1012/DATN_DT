import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pitchAPI, bookingAPI, userAPI } from '../../api/services';

function StatCard({ icon, label, value, sub, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '22px 24px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color }}>
        {value ?? <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>…</span>}
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  pending: 'var(--warning)', confirmed: 'var(--success)',
  cancelled: 'var(--danger)', completed: 'var(--info)',
};
const STATUS_LABELS = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy', completed: 'Hoàn thành' };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pitches: null, bookings: null, users: null, revenue: null });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pitchRes, bookingRes, userRes] = await Promise.all([
          pitchAPI.getAll({ limit: 1000 }),
          bookingAPI.getAll(),
          userAPI.getAll(),
        ]);

        const bookingsRaw = bookingRes.data?.data;
        const pitchesRaw = pitchRes.data?.data;
        const usersRaw = userRes.data?.data;

        const allBookings = Array.isArray(bookingsRaw) ? bookingsRaw : bookingsRaw?.bookings || [];
        const allPitches = Array.isArray(pitchesRaw) ? pitchesRaw : pitchesRaw?.pitches || [];
        const allUsers = Array.isArray(usersRaw) ? usersRaw : usersRaw?.users || [];

        const revenue = allBookings
          .filter((b) => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        setStats({
          pitches: allPitches.length,
          bookings: allBookings.length,
          users: allUsers.length,
          revenue,
        });

        setRecentBookings(allBookings.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>📊 Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Tổng quan hệ thống SânBóngPro
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="🏟️" label="Sân bóng" value={stats.pitches} sub="Đang hoạt động" color="var(--primary)" />
        <StatCard icon="📅" label="Tổng đặt sân" value={stats.bookings} sub="Tất cả thời gian" color="var(--info)" />
        <StatCard icon="👤" label="Người dùng" value={stats.users} sub="Đã đăng ký" color="var(--warning)" />
        <StatCard
          icon="💰" label="Doanh thu" color="var(--success)"
          value={stats.revenue != null ? `${(stats.revenue / 1000000).toFixed(1)}M` : null}
          sub="Từ các booking thành công"
        />
      </div>

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
              transition: 'var(--transition)',
              cursor: 'pointer',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(22,163,74,0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(22,163,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0,
              }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
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
                  {['Người đặt', 'Sân', 'Ngày', 'Giờ', 'Giá', 'Trạng thái'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={b._id} style={{
                    borderBottom: i < recentBookings.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px', fontSize: '0.875rem', fontWeight: 600 }}>
                      {b.user?.name || '—'}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '0.875rem' }}>{b.pitch?.name || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {b.date ? new Date(b.date).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {b.startTime} – {b.endTime}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-light)', whiteSpace: 'nowrap' }}>
                      {b.totalPrice?.toLocaleString('vi-VN')}₫
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 100,
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                        background: `${STATUS_COLORS[b.status]}22`,
                        color: STATUS_COLORS[b.status],
                        border: `1px solid ${STATUS_COLORS[b.status]}44`,
                      }}>
                        {STATUS_LABELS[b.status] || b.status}
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
