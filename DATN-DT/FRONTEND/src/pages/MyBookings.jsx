import { useEffect, useState } from 'react';
import { bookingAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMy();
      setBookings(data.data || []);
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

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title">📅 Lịch đặt sân của tôi</h1>
          <p className="section-subtitle">Quản lý toàn bộ lịch đặt sân của bạn</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            { key: 'all', label: `Tất cả (${bookings.length})` },
            { key: 'pending', label: 'Chờ xác nhận' },
            { key: 'confirmed', label: 'Đã xác nhận' },
            { key: 'completed', label: 'Hoàn thành' },
            { key: 'cancelled', label: 'Đã hủy' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`tab-btn ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-lg" />
            <span>Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không có lịch đặt</h3>
            <p>Bạn chưa có lịch đặt sân nào{tab !== 'all' ? ` ở trạng thái "${STATUS_LABELS[tab] || tab}"` : ''}.</p>
            <Link to="/pitches" className="btn btn-primary">🔍 Tìm sân ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <div key={b._id} className="booking-card">
                <div className="booking-card-icon">🏟️</div>
                <div className="booking-card-info">
                  <div className="booking-card-title">
                    {b.pitch?.name || 'Sân bóng'}
                  </div>
                  <div className="booking-card-meta">
                    <span>📅 {b.date ? format(new Date(b.date), 'dd/MM/yyyy') : '—'}</span>
                    <span>🕐 {b.startTime} – {b.endTime}</span>
                    <span>💰 {b.totalPrice?.toLocaleString('vi-VN')}₫</span>
                    {b.pitch?.address && <span>📍 {b.pitch.address}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <span className={`status-pill status-${b.status}`}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelId(b._id)}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Cancel Modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xác nhận hủy đặt sân</h3>
              <button className="modal-close" onClick={() => setCancelId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Bạn có chắc muốn hủy lịch đặt sân này không? Hành động này không thể hoàn tác.
              </p>
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
    </div>
  );
}
