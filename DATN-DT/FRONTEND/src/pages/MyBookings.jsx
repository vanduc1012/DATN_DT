import { useEffect, useState } from 'react';
import { bookingAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

const STATUS_CONFIG = {
  pending:   { label: 'Chờ xác nhận', color: 'var(--warning)', icon: '⏳' },
  confirmed: { label: 'Đã xác nhận',  color: 'var(--success)', icon: '✅' },
  cancelled: { label: 'Đã hủy',       color: 'var(--danger)',  icon: '❌' },
  completed: { label: 'Hoàn thành',   color: 'var(--info)',    icon: '🏁' },
};

const PAY_STATUS = {
  unpaid:   { label: 'Chưa thanh toán', color: 'var(--warning)' },
  paid:     { label: 'Đã thanh toán',   color: 'var(--success)' },
  refunded: { label: 'Đã hoàn tiền',    color: 'var(--info)'    },
};

const TYPE_LABELS = { '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [payModal, setPayModal] = useState(null); // booking object
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('online');
  const [tab, setTab] = useState('all');
  const [reviewingBookingId, setReviewingBookingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMy();
      const raw = data?.data;
      setBookings(Array.isArray(raw) ? raw : raw?.bookings || []);
    } catch {
      toast.error('Không thể tải lịch đặt sân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await bookingAPI.updateStatus(cancelId, 'cancelled');
      toast.success('Đã hủy đặt sân');
      setBookings((b) => b.map((x) => x._id === cancelId ? { ...x, status: 'cancelled' } : x));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy thất bại');
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await bookingAPI.pay(payModal._id, payMethod);
      toast.success(payMethod === 'online' ? '💳 Thanh toán online thành công!' : '💵 Đã xác nhận thanh toán tại sân!');
      setBookings((b) => b.map((x) => x._id === payModal._id ? { ...x, paymentStatus: 'paid', paymentMethod: payMethod } : x));
      setPayModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setPaying(false);
    }
  };

  const TABS = [
    { key: 'all', label: `Tất cả (${bookings.length})` },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'payment', label: '💳 Thanh toán' },
  ];

  const filtered = tab === 'all' ? bookings
    : tab === 'payment' ? bookings.filter((b) => b.status !== 'cancelled')
    : bookings.filter((b) => b.status === tab);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title">📅 Lịch đặt sân của tôi</h1>
          <p className="section-subtitle">Quản lý toàn bộ lịch đặt và thanh toán</p>
        </div>

        {/* Stats row */}
        {!loading && bookings.length > 0 && (
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Tổng đặt', value: bookings.length, color: 'var(--info)', icon: '📅' },
              { label: 'Đã xác nhận', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'var(--success)', icon: '✅' },
              { label: 'Hoàn thành', value: bookings.filter((b) => b.status === 'completed').length, color: 'var(--primary-light)', icon: '🏁' },
              {
                label: 'Tổng tiền',
                value: bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0).toLocaleString('vi-VN') + '₫',
                color: 'var(--warning)', icon: '💰',
              },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                  <span>{icon}</span>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {TABS.map(({ key, label }) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /><span>Đang tải...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không có lịch đặt</h3>
            <p>Bạn chưa có lịch đặt sân nào{tab !== 'all' ? ' trong mục này' : ''}.</p>
            <Link to="/pitches" className="btn btn-primary">🔍 Tìm sân ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((b) => {
              const st = STATUS_CONFIG[b.status] || { label: b.status, color: 'var(--text-muted)', icon: '❓' };
              const pay = PAY_STATUS[b.paymentStatus] || PAY_STATUS.unpaid;
              const canPay = b.status !== 'cancelled' && b.paymentStatus !== 'paid';
              const canCancel = b.status === 'pending' || b.status === 'confirmed';

              return (
                <div key={b._id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px 22px',
                  borderLeft: `3px solid ${st.color}`,
                  transition: 'var(--transition)',
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Left: pitch icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(22,163,74,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                    }}>🏟️</div>

                    {/* Middle: info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
                        {b.pitch?.name || 'Sân bóng'}
                        {b.pitch?.type && (
                          <span style={{ marginLeft: 8, fontSize: '0.72rem', background: 'rgba(22,163,74,0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                            {TYPE_LABELS[b.pitch.type] || b.pitch.type}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span>📅 {b.date ? format(new Date(b.date), 'dd/MM/yyyy') : '—'}</span>
                        <span>🕐 {b.startTime} – {b.endTime}</span>
                        {b.pitch?.address && <span>📍 {b.pitch.address}</span>}
                        {b.note && <span>📝 {b.note}</span>}
                      </div>
                      {/* Payment info row */}
                      {tab === 'payment' && (
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px',
                            borderRadius: 100, background: `${pay.color}22`, color: pay.color,
                            border: `1px solid ${pay.color}44`,
                          }}>{pay.label}</span>
                          {b.paymentMethod && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Phương thức: {b.paymentMethod === 'online' ? '💳 Online' : '💵 Tại sân'}
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Ngày đặt: {b.createdAt ? format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm') : '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: price + status + actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-light)' }}>
                        {b.totalPrice?.toLocaleString('vi-VN')}₫
                      </div>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px',
                        borderRadius: 100, background: `${st.color}22`, color: st.color,
                        border: `1px solid ${st.color}44`, whiteSpace: 'nowrap',
                      }}>
                        {st.icon} {st.label}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canPay && (
                          <button className="btn btn-sm" style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'rgba(22,163,74,.12)', color: 'var(--primary-light)', border: '1px solid rgba(22,163,74,.25)' }}
                            onClick={() => { setPayModal(b); setPayMethod('online'); }}>
                            💳 Thanh toán
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <button className="btn btn-sm" style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'rgba(251,146,60,.12)', color: 'var(--accent)', border: '1px solid rgba(251,146,60,.25)' }}
                            onClick={() => setReviewingBookingId(b._id)}>
                            ⭐ Đánh giá
                          </button>
                        )}
                        {b.paymentStatus === 'paid' && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>✅ Đã TT</span>
                        )}
                        {canCancel && (
                          <button className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => setCancelId(b._id)}>
                            ✕ Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xác nhận hủy đặt sân</h3>
              <button className="modal-close" onClick={() => setCancelId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Bạn có chắc muốn hủy lịch đặt sân này? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCancelId(null)}>Giữ lại</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner" /> : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💳 Thanh toán đặt sân</h3>
              <button className="modal-close" onClick={() => setPayModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Booking summary */}
              <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{payModal.pitch?.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                  <span>📅 {payModal.date ? format(new Date(payModal.date), 'dd/MM/yyyy') : '—'}</span>
                  <span>🕐 {payModal.startTime} – {payModal.endTime}</span>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-light)', marginTop: 10 }}>
                  Tổng: {payModal.totalPrice?.toLocaleString('vi-VN')}₫
                </div>
              </div>

              {/* Payment method */}
              <div className="form-group">
                <label className="form-label">Chọn phương thức thanh toán</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { value: 'online', icon: '💳', title: 'Thanh toán online', desc: 'Thanh toán qua thẻ / ví điện tử (mô phỏng)' },
                    { value: 'cash', icon: '💵', title: 'Thanh toán tại sân', desc: 'Trả tiền mặt trực tiếp khi đến sân' },
                  ].map((m) => (
                    <label key={m.value} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${payMethod === m.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: payMethod === m.value ? 'rgba(22,163,74,0.08)' : 'transparent',
                      transition: 'var(--transition)',
                    }}>
                      <input type="radio" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                      </div>
                      {payMethod === m.value && <span style={{ marginLeft: 'auto', color: 'var(--primary-light)', fontWeight: 700 }}>✓</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? <span className="spinner" /> : `💳 Xác nhận thanh toán ${payModal.totalPrice?.toLocaleString('vi-VN')}₫`}
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Review Modal */}
    {reviewingBookingId && (
      <div className="modal-overlay" onClick={() => setReviewingBookingId(null)}>
        <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">⭐ Đánh giá sân bóng</h3>
            <button className="modal-close" onClick={() => setReviewingBookingId(null)}>✕</button>
          </div>
          <div className="modal-body">
            {bookings.find((b) => b._id === reviewingBookingId) && (
              <ReviewForm
                pitchId={bookings.find((b) => b._id === reviewingBookingId)?.pitch?._id}
                pitchName={bookings.find((b) => b._id === reviewingBookingId)?.pitch?.name}
                onSuccess={() => setReviewingBookingId(null)}
              />
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
