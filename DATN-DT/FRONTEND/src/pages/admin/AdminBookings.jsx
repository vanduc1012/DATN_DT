import { useEffect, useState } from 'react';
import { bookingAPI, pitchAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_LABELS = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy', completed: 'Hoàn thành' };
const STATUS_COLORS = { pending: 'var(--warning)', confirmed: 'var(--success)', cancelled: 'var(--danger)', completed: 'var(--info)' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPitch, setFilterPitch] = useState('');
  const [pitches, setPitches] = useState([]);
  const [statusModal, setStatusModal] = useState(null); // { booking, newStatus }
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPitch) params.pitchId = filterPitch;
      const { data } = await bookingAPI.getAll(params);
      // Backend trả về data.data.bookings hoặc data.data (array)
      const result = data?.data;
      setBookings(Array.isArray(result) ? result : result?.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    pitchAPI.getAll({ limit: 100 })
      .then(({ data }) => {
        const result = data?.data;
        setPitches(Array.isArray(result) ? result : result?.pitches || []);
      })
      .catch(() => {});
    fetchBookings();
  }, []);

  useEffect(() => { fetchBookings(); }, [filterStatus, filterPitch]);

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUpdating(true);
    try {
      await bookingAPI.updateStatus(statusModal.booking._id, statusModal.newStatus);
      toast.success('Đã cập nhật trạng thái đặt sân!');
      setBookings((prev) =>
        prev.map((b) => b._id === statusModal.booking._id ? { ...b, status: statusModal.newStatus } : b)
      );
      setStatusModal(null);
      setCancelReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPayment = async (booking) => {
    if (!window.confirm(`Xác nhận khách hàng đã thanh toán ${booking.totalPrice.toLocaleString('vi-VN')}₫ cho đặt sân này?`)) return;
    try {
      await bookingAPI.pay(booking._id, 'cash');
      toast.success('🎉 Xác nhận thanh toán thành công!');
      setBookings((prev) =>
        prev.map((b) => b._id === booking._id ? { ...b, paymentStatus: 'paid', paymentMethod: 'cash' } : b)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xác nhận thanh toán thất bại');
    }
  };

  const counts = Object.keys(STATUS_LABELS).reduce((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>📅 Quản lý đặt sân</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bookings.length} đặt sân trong hệ thống</p>
      </div>

      {/* Status Overview */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '16px 18px',
            borderLeft: `3px solid ${STATUS_COLORS[key]}`,
            cursor: 'pointer',
            outline: filterStatus === key ? `2px solid ${STATUS_COLORS[key]}` : 'none',
          }} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: STATUS_COLORS[key] }}>{counts[key] || 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Trạng thái</label>
          <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Sân bóng</label>
          <select className="form-control" value={filterPitch} onChange={(e) => setFilterPitch(e.target.value)}>
            <option value="">Tất cả sân</option>
            {pitches.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        {(filterStatus || filterPitch) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(''); setFilterPitch(''); }} style={{ alignSelf: 'flex-end', marginBottom: 1 }}>
            ✕ Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><h3>Không có đặt sân</h3></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Người đặt', 'Sân', 'Ngày & Giờ', 'Giá', 'Ghi chú', 'Thanh toán', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b._id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      {b.user?.phone && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📞 {b.user.phone}</div>}
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '0.875rem', maxWidth: 150 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.pitch?.name || '—'}</div>
                      {b.pitch?.type && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{{ '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' }[b.pitch.type]}</div>}
                    </td>
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.date ? format(new Date(b.date), 'dd/MM/yyyy') : '—'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>🕐 {b.startTime} – {b.endTime}</div>
                    </td>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: 'var(--primary-light)', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {b.totalPrice?.toLocaleString('vi-VN')}₫
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 120 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.note || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                        background: b.paymentStatus === 'paid' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
                        color: b.paymentStatus === 'paid' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${b.paymentStatus === 'paid' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {b.paymentStatus === 'paid' ? '💰 Đã thanh toán' : '❌ Chưa thanh toán'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                        background: `${STATUS_COLORS[b.status]}22`, color: STATUS_COLORS[b.status],
                        border: `1px solid ${STATUS_COLORS[b.status]}44`,
                      }}>{STATUS_LABELS[b.status] || b.status}</span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                        {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,.25)', fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => handleConfirmPayment(b)}>
                            💵 Thu tiền
                          </button>
                        )}
                        {b.status === 'pending' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,.25)', fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => setStatusModal({ booking: b, newStatus: 'confirmed' })}>
                            ✓ Duyệt
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(59,130,246,.12)', color: 'var(--info)', border: '1px solid rgba(59,130,246,.25)', fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => setStatusModal({ booking: b, newStatus: 'completed' })}>
                            ✓ Hoàn thành
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(b.status) && (
                          <button className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => setStatusModal({ booking: b, newStatus: 'cancelled' })}>
                            ✕ Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => { setStatusModal(null); setCancelReason(''); }}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {statusModal.newStatus === 'confirmed' ? '✅ Duyệt đặt sân' :
                  statusModal.newStatus === 'completed' ? '🏁 Hoàn thành' : '❌ Hủy đặt sân'}
              </h3>
              <button className="modal-close" onClick={() => { setStatusModal(null); setCancelReason(''); }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: '0.875rem' }}>
                <div><strong>{statusModal.booking.user?.name}</strong> — {statusModal.booking.pitch?.name}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.8rem' }}>
                  {statusModal.booking.date ? format(new Date(statusModal.booking.date), 'dd/MM/yyyy') : ''} | {statusModal.booking.startTime} – {statusModal.booking.endTime}
                </div>
              </div>
              {statusModal.newStatus === 'cancelled' && (
                <div className="form-group">
                  <label className="form-label">Lý do hủy (tùy chọn)</label>
                  <textarea className="form-control" rows={2} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Nhập lý do..." />
                </div>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Xác nhận {statusModal.newStatus === 'confirmed' ? 'duyệt' : statusModal.newStatus === 'completed' ? 'hoàn thành' : 'hủy'} đặt sân này?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setStatusModal(null); setCancelReason(''); }}>Hủy</button>
              <button className={`btn ${statusModal.newStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleUpdateStatus} disabled={updating}>
                {updating ? <span className="spinner" /> : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
