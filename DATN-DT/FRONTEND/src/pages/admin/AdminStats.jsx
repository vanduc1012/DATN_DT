import { useEffect, useState } from 'react';
import { bookingAPI, pitchAPI, userAPI } from '../../api/services';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function BarChart({ data, maxVal }) {
  if (!maxVal) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {d.value > 0 ? (d.value >= 1000000 ? `${(d.value / 1000000).toFixed(1)}M` : `${(d.value / 1000).toFixed(0)}K`) : ''}
            </div>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: `linear-gradient(180deg, var(--primary-light), var(--primary))`,
              height: `${Math.max(pct, 2)}%`,
              minHeight: d.value > 0 ? 4 : 0,
              transition: 'height 0.5s ease',
              boxShadow: d.value > 0 ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
            }} />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'year'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bookingRes, pitchRes, userRes] = await Promise.all([
          bookingAPI.getAll(),
          pitchAPI.getAll({ limit: 1000 }),
          userAPI.getAll(),
        ]);

        const bookings = bookingRes.data.data?.bookings || bookingRes.data.data || [];
        const pitches = pitchRes.data.data?.pitches || pitchRes.data.data || [];
        const users = userRes.data.data?.users || userRes.data.data || [];

        // Revenue by status
        const totalRevenue = bookings.filter((b) => b.status !== 'cancelled')
          .reduce((s, b) => s + (b.totalPrice || 0), 0);
        const pendingRevenue = bookings.filter((b) => b.status === 'pending')
          .reduce((s, b) => s + (b.totalPrice || 0), 0);
        const completedRevenue = bookings.filter((b) => b.status === 'completed')
          .reduce((s, b) => s + (b.totalPrice || 0), 0);

        // Monthly data (last 6 months)
        const now = new Date();
        const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const monthBookings = bookings.filter((b) => {
            if (!b.date || b.status === 'cancelled') return false;
            const bd = new Date(b.date);
            return bd.getMonth() === m && bd.getFullYear() === y;
          });
          return {
            label: MONTH_NAMES[m],
            value: monthBookings.reduce((s, b) => s + (b.totalPrice || 0), 0),
            count: monthBookings.length,
          };
        });

        // Monthly bookings count
        const monthlyBookings = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          return {
            label: MONTH_NAMES[m],
            value: bookings.filter((b) => {
              if (!b.date) return false;
              const bd = new Date(b.date);
              return bd.getMonth() === m && bd.getFullYear() === y;
            }).length,
          };
        });

        // Top pitches by booking count
        const pitchBookingCount = {};
        bookings.forEach((b) => {
          if (b.pitch?._id) {
            pitchBookingCount[b.pitch._id] = (pitchBookingCount[b.pitch._id] || 0) + 1;
          }
        });
        const topPitches = pitches
          .map((p) => ({ ...p, bookingCount: pitchBookingCount[p._id] || 0 }))
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);

        // Status breakdown
        const statusCount = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
        bookings.forEach((b) => { if (b.status in statusCount) statusCount[b.status]++; });

        setData({
          totalRevenue, pendingRevenue, completedRevenue,
          totalBookings: bookings.length,
          totalPitches: pitches.length,
          totalUsers: users.length,
          cancelledCount: statusCount.cancelled,
          monthlyRevenue, monthlyBookings, topPitches, statusCount,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner-lg" /><span>Đang tải thống kê...</span></div>;
  if (!data) return null;

  const maxMonthlyRev = Math.max(...data.monthlyRevenue.map((d) => d.value), 1);
  const maxMonthlyBook = Math.max(...data.monthlyBookings.map((d) => d.value), 1);

  const STATUS_LABELS = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
  const STATUS_COLORS = { pending: 'var(--warning)', confirmed: 'var(--success)', completed: 'var(--info)', cancelled: 'var(--danger)' };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>📊 Thống kê & Báo cáo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tổng quan kinh doanh hệ thống SânBóngPro</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '💰', label: 'Tổng doanh thu', value: `${(data.totalRevenue / 1000000).toFixed(2)}M₫`, color: 'var(--success)', sub: 'Tất cả booking thành công' },
          { icon: '📅', label: 'Tổng đặt sân', value: data.totalBookings, color: 'var(--info)', sub: `Hủy: ${data.cancelledCount}` },
          { icon: '✅', label: 'Đã hoàn thành', value: `${(data.completedRevenue / 1000000).toFixed(2)}M₫`, color: 'var(--primary-light)', sub: 'Booking completed' },
          { icon: '⏳', label: 'Đang chờ thu', value: `${(data.pendingRevenue / 1000000).toFixed(2)}M₫`, color: 'var(--warning)', sub: 'Booking pending' },
        ].map(({ icon, label, value, color, sub }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Revenue chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>💰 Doanh thu 6 tháng gần đây</h3>
          <BarChart data={data.monthlyRevenue} maxVal={maxMonthlyRev} />
        </div>

        {/* Booking count chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>📅 Số đặt sân 6 tháng gần đây</h3>
          <BarChart data={data.monthlyBookings} maxVal={maxMonthlyBook} />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 0 }}>
        {/* Booking Status Breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>📋 Phân loại trạng thái đặt sân</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(data.statusCount).map(([status, count]) => {
              const pct = data.totalBookings > 0 ? (count / data.totalBookings) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{STATUS_LABELS[status]}</span>
                    <span style={{ color: STATUS_COLORS[status], fontWeight: 700 }}>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: STATUS_COLORS[status], transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Pitches */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>🏆 Sân được đặt nhiều nhất</h3>
          {data.topPitches.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon" style={{ fontSize: '2rem' }}>🏟️</div>
              <p style={{ fontSize: '0.875rem' }}>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.topPitches.map((p, i) => {
                const maxCount = data.topPitches[0]?.bookingCount || 1;
                const pct = (p.bookingCount / maxCount) * 100;
                return (
                  <div key={p._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 900, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', minWidth: 20 }}>#{i + 1}</span>
                        {p.name}
                      </span>
                      <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{p.bookingCount} đặt</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, var(--primary), var(--primary-light))`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
