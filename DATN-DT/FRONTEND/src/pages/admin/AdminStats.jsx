import { useEffect, useState } from 'react';
import { statsAPI } from '../../api/services';

const MONTH_NAMES = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const TYPE_LABELS = { '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' };

// ── Bar chart component ────────────────────────────────────────
function BarChart({ bars, maxVal, height = 140 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 2px' }}>
      {bars.map((b, i) => {
        const pct = maxVal > 0 ? Math.max((b.value / maxVal) * 100, b.value > 0 ? 3 : 0) : 0;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            title={`${b.label}: ${b.value?.toLocaleString('vi-VN') || 0}`}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {b.value > 0 ? (b.value >= 1000000 ? `${(b.value / 1000000).toFixed(1)}M` : b.value >= 1000 ? `${(b.value / 1000).toFixed(0)}K` : b.value) : ''}
            </div>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: `linear-gradient(180deg, var(--primary-light), var(--primary))`,
              height: `${pct}%`, minHeight: b.value > 0 ? 4 : 0,
              transition: 'height 0.5s ease',
              boxShadow: b.value > 0 ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
            }} />
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Mini stat ────────────────────────────────────────────────
function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function AdminStats() {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topPitches, setTopPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  // Fetch overview + top pitches once
  useEffect(() => {
    Promise.allSettled([statsAPI.getOverview(), statsAPI.getTopPitches()])
      .then(([ovRes, topRes]) => {
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data?.data);
        if (topRes.status === 'fulfilled') setTopPitches(topRes.value.data?.data || []);
      })
      .catch(console.error);
  }, []);

  // Fetch revenue when period/year/month changes
  useEffect(() => {
    setLoading(true);
    statsAPI.getRevenue({ period, year, month })
      .then(({ data }) => {
        const raw = data?.data?.data || [];
        setRevenueData(raw);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, year, month]);

  // Build bar chart data
  const buildBars = () => {
    if (period === 'year') {
      return MONTH_NAMES.map((label, i) => {
        const found = revenueData.find((d) => d._id === i + 1);
        return { label, value: found?.revenue || 0, count: found?.count || 0 };
      });
    } else if (period === 'month') {
      const daysInMonth = new Date(year, month, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const found = revenueData.find((d) => d._id === day);
        return { label: `${day}`, value: found?.revenue || 0, count: found?.count || 0 };
      });
    } else {
      // week - 7 entries with _id as 'YYYY-MM-DD'
      return revenueData.map((d) => ({
        label: d._id?.slice(5) || d._id,
        value: d.revenue || 0,
        count: d.count || 0,
      }));
    }
  };

  const bars = buildBars();
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const totalRevenue = bars.reduce((s, b) => s + b.value, 0);
  const totalCount = bars.reduce((s, b) => s + b.count, 0);

  const fmtMoney = (v) => {
    if (!v) return '0₫';
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M₫`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K₫`;
    return `${v}₫`;
  };

  const ov = overview;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>📊 Thống kê & Báo cáo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Phân tích doanh thu và hoạt động hệ thống</p>
      </div>

      {/* Overview KPIs */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '💰', label: 'Tổng doanh thu', value: fmtMoney(ov?.revenue?.total), color: 'var(--success)' },
          { icon: '✅', label: 'Đã thanh toán', value: fmtMoney(ov?.revenue?.paid), color: 'var(--primary-light)' },
          { icon: '📅', label: 'Tổng đặt sân', value: ov?.bookings?.total ?? '—', color: 'var(--info)' },
          { icon: '🏁', label: 'Hoàn thành', value: ov?.bookings?.completed ?? '—', color: 'var(--warning)' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        {/* Bar chart card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontWeight: 700 }}>📈 Doanh thu</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Period selector */}
              <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, padding: 2 }}>
                {[{ k: 'week', l: '7 ngày' }, { k: 'month', l: 'Tháng' }, { k: 'year', l: 'Năm' }].map(({ k, l }) => (
                  <button key={k} onClick={() => setPeriod(k)} style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    background: period === k ? 'var(--primary)' : 'transparent',
                    color: period === k ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)',
                  }}>{l}</button>
                ))}
              </div>
              {/* Year selector */}
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {/* Month selector (only for month period) */}
              {period === 'month' && (
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                  style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Summary row */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
            <MiniStat label="Doanh thu kỳ này" value={fmtMoney(totalRevenue)} color="var(--primary-light)" />
            <MiniStat label="Số đơn" value={totalCount} color="var(--info)" />
            <MiniStat label="TB/đơn" value={totalCount > 0 ? fmtMoney(Math.round(totalRevenue / totalCount)) : '—'} color="var(--warning)" />
          </div>

          {loading ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner-lg" />
            </div>
          ) : (
            <BarChart bars={bars} maxVal={maxVal} height={140} />
          )}
        </div>

        {/* Status breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🗂 Trạng thái đặt sân</h3>
          {ov ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'pending', label: 'Chờ xác nhận', color: 'var(--warning)', icon: '⏳' },
                { key: 'confirmed', label: 'Đã xác nhận', color: 'var(--success)', icon: '✅' },
                { key: 'completed', label: 'Hoàn thành', color: 'var(--info)', icon: '🏁' },
                { key: 'cancelled', label: 'Đã hủy', color: 'var(--danger)', icon: '❌' },
              ].map(({ key, label, color, icon }) => {
                const count = ov.bookings?.[key] || 0;
                const total = ov.bookings?.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{icon} {label}</span>
                      <span style={{ fontWeight: 700, color }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 100 }}>
                      <div style={{ height: '100%', background: color, borderRadius: 100, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}><div className="spinner-lg" /></div>
          )}

          {/* Payment breakdown */}
          {ov && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>💳 Thanh toán</h4>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--success)' }}>{fmtMoney(ov.revenue?.paid)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>Đã thanh toán</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--warning)' }}>{fmtMoney((ov.revenue?.total || 0) - (ov.revenue?.paid || 0))}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>Chưa thanh toán</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Pitches */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 700 }}>🏆 Sân được đặt nhiều nhất</h3>
        </div>
        {topPitches.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏟️</div><h3>Chưa có dữ liệu</h3></div>
        ) : (
          <div>
            {topPitches.map((item, i) => {
              const maxCount = topPitches[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item._id} style={{ padding: '16px 22px', borderBottom: i < topPitches.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Rank */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b08d57' : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.85rem',
                    color: i < 3 ? '#fff' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  {/* Name + info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                      {item.pitch?.name || '—'}
                      <span style={{ marginLeft: 8, fontSize: '0.72rem', background: 'rgba(22,163,74,0.12)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: 6 }}>
                        {TYPE_LABELS[item.pitch?.type] || item.pitch?.type}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 100, marginBottom: 4 }}>
                      <div style={{ height: '100%', background: `linear-gradient(90deg, var(--primary), var(--primary-light))`, borderRadius: 100, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {item.pitch?.address || '—'}</div>
                  </div>
                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, color: 'var(--primary-light)', fontSize: '1rem' }}>{item.count} lượt</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>{fmtMoney(item.revenue)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
