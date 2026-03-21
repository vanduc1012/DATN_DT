import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pitchAPI, bookingAPI, reviewAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TYPE_LABELS = { '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' };

// Tạo danh sách khung giờ từ openTime → closeTime (mỗi slot 1 tiếng)
function generateSlots(openTime, closeTime) {
  const slots = [];
  const [oh, om] = (openTime || '06:00').split(':').map(Number);
  const [ch] = (closeTime || '22:00').split(':').map(Number);
  let h = oh, m = om;
  while (h < ch) {
    const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const nh = h + 1;
    const end = `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push({ label: `${start} – ${end}`, start, end });
    h = nh;
  }
  return slots;
}

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pitch, setPitch] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  // Booking state
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookedSlots, setBookedSlots] = useState([]); // startTimes đã bị đặt
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [booking, setBooking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Review modal
  const [showModal, setShowModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // ── Fetch pitch + reviews ─────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await pitchAPI.getById(id);
        if (!mounted) return;
        setPitch(res.data?.data || null);
      } catch {
        toast.error('Không tìm thấy sân');
        navigate('/pitches');
      } finally {
        if (mounted) setLoading(false);
      }
      // Load reviews separately — don't block pitch load
      try {
        const rRes = await reviewAPI.getByPitch(id);
        if (mounted) setReviews(rRes.data?.data || []);
      } catch {
        // reviews không load được thì bỏ qua
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  // ── Fetch available slots ─────────────────────────────────
  useEffect(() => {
    if (!id || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    bookingAPI.getAvailableSlots(id, selectedDate)
      .then(({ data }) => {
        const slots = data?.data || [];
        // Backend trả về [{startTime, endTime, status}]
        const booked = slots
          .filter((s) => s.status === 'booked')
          .map((s) => s.startTime);
        setBookedSlots(booked);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, selectedDate]);

  // ── Book handler ──────────────────────────────────────────
  const handleBook = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập để đặt sân'); return navigate('/login'); }
    if (!selectedSlot) { toast.error('Vui lòng chọn khung giờ'); return; }
    setBooking(true);
    try {
      await bookingAPI.create({
        pitch: id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        note: note.trim() || undefined,
      });
      toast.success('🎉 Đặt sân thành công!');
      setSelectedSlot(null);
      setNote('');
      // Refresh slots
      const { data } = await bookingAPI.getAvailableSlots(id, selectedDate);
      const slots = data?.data || [];
      setBookedSlots(slots.filter((s) => s.status === 'booked').map((s) => s.startTime));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt sân thất bại');
    } finally {
      setBooking(false);
    }
  };

  // ── Review handler ────────────────────────────────────────
  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.create(id, reviewForm);
      toast.success('Đã gửi đánh giá!');
      const { data } = await reviewAPI.getByPitch(id);
      setReviews(data?.data || []);
      setShowModal(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Render: Loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state">
          <div className="spinner-lg" />
          <span>Đang tải thông tin sân...</span>
        </div>
      </div>
    );
  }

  if (!pitch) return null;

  const allSlots = generateSlots(pitch.openTime, pitch.closeTime);
  const totalPrice = pitch.pricePerHour || 0;

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/pitches" style={{ color: 'var(--primary-light)' }}>← Danh sách sân</Link>
          <span>/</span>
          <span>{pitch.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* ── LEFT: Info ───────────────────────────────── */}
          <div>
            {/* Image */}
            <div style={{
              height: 300, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3a2f, #0f2417)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '5rem', marginBottom: 24, position: 'relative',
            }}>
              {pitch.images?.[0]
                ? <img src={pitch.images[0]} alt={pitch.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🏟️'}
              {pitch.status === 'maintenance' && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(245,158,11,0.9)', color: '#fff', padding: '4px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem' }}>
                  🔧 Đang bảo trì
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              {[
                { key: 'info', label: '📋 Thông tin' },
                { key: 'reviews', label: `⭐ Đánh giá (${reviews.length})` },
              ].map(({ key, label }) => (
                <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Info Tab */}
            {tab === 'info' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>{pitch.name}</h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{TYPE_LABELS[pitch.type] || pitch.type}</span>
                      <span className={`badge ${pitch.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {pitch.status === 'active' ? 'Đang hoạt động' : pitch.status === 'maintenance' ? 'Bảo trì' : pitch.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-light)' }}>
                      {totalPrice.toLocaleString('vi-VN')}₫
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mỗi giờ</div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {[
                        { icon: '📍', label: 'Địa chỉ', value: pitch.address || '—' },
                        { icon: '🏙️', label: 'Khu vực', value: [pitch.district, pitch.city].filter(Boolean).join(', ') || '—' },
                        { icon: '🕐', label: 'Giờ mở', value: pitch.openTime || '06:00' },
                        { icon: '🕙', label: 'Giờ đóng', value: pitch.closeTime || '22:00' },
                        { icon: '⭐', label: 'Đánh giá', value: `${(pitch.averageRating || 0).toFixed(1)} / 5 (${pitch.totalReviews || 0} đánh giá)` },
                      ].map(({ icon, label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>{icon} {label}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {pitch.description && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-body">
                      <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Mô tả</h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9rem' }}>{pitch.description}</p>
                    </div>
                  </div>
                )}

                {pitch.amenities?.length > 0 && (
                  <div className="card">
                    <div className="card-body">
                      <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Tiện ích</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {pitch.amenities.map((a) => (
                          <span key={a} className="badge badge-info">✓ {a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {tab === 'reviews' && (
              <div>
                {user && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>✏️ Viết đánh giá</button>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>Chưa có đánh giá</h3>
                    <p>Hãy là người đầu tiên đánh giá sân này!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.map((r) => (
                      <div key={r._id} className="card">
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.user?.name || 'Ẩn danh'}</div>
                            <span style={{ fontSize: '1rem' }}>{'⭐'.repeat(r.rating || 0)}</span>
                          </div>
                          {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.comment}</p>}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            {r.createdAt ? format(new Date(r.createdAt), 'dd/MM/yyyy') : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking Panel ──────────────────────── */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700 }}>📅 Đặt sân ngay</h3>
              </div>
              <div className="card-body">

                {pitch.status !== 'active' ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--warning)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔧</div>
                    <div style={{ fontWeight: 700 }}>Sân đang bảo trì</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Vui lòng thử lại sau</div>
                  </div>
                ) : (
                  <>
                    {/* Date Picker */}
                    <div className="form-group">
                      <label className="form-label">Chọn ngày</label>
                      <input
                        type="date" className="form-control"
                        value={selectedDate} min={today}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>

                    {/* Slots */}
                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: 10 }}>
                        Khung giờ
                        {selectedSlot && <span style={{ color: 'var(--primary-light)', marginLeft: 6 }}>— {selectedSlot.label}</span>}
                      </label>
                      {loadingSlots ? (
                        <div style={{ textAlign: 'center', padding: 16 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                      ) : (
                        <div className="slot-grid">
                          {allSlots.map((slot) => {
                            const isBooked = bookedSlots.includes(slot.start);
                            const isSelected = selectedSlot?.start === slot.start;
                            return (
                              <button
                                key={slot.start}
                                className={`slot-btn${isBooked ? ' booked' : ''}${isSelected ? ' selected' : ''}`}
                                onClick={() => !isBooked && setSelectedSlot(isSelected ? null : slot)}
                                disabled={isBooked}
                                title={isBooked ? 'Đã được đặt' : slot.label}
                              >
                                {slot.start}
                              </button>
                            );
                          })}
                          {allSlots.length === 0 && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: '1/-1' }}>Không có khung giờ</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Note */}
                    {selectedSlot && (
                      <div className="form-group">
                        <label className="form-label">Ghi chú (tùy chọn)</label>
                        <textarea className="form-control" rows={2} placeholder="Thông tin thêm cho chủ sân..."
                          value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'vertical' }} />
                      </div>
                    )}

                    {/* Price summary */}
                    {selectedSlot && (
                      <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Khung giờ</span>
                          <span style={{ fontWeight: 600 }}>{selectedSlot.label}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tổng cộng</span>
                          <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                            {totalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-primary btn-block btn-lg"
                      onClick={handleBook}
                      disabled={booking || !selectedSlot}
                    >
                      {booking ? <span className="spinner" /> : '⚡ Đặt sân ngay'}
                    </button>

                    {!user && (
                      <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 12 }}>
                        <Link to="/login" style={{ color: 'var(--primary-light)' }}>Đăng nhập</Link> để đặt sân
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⭐ Viết đánh giá</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Điểm đánh giá</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button"
                        style={{ fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3, transition: 'opacity 0.15s' }}
                        onClick={() => setReviewForm((p) => ({ ...p, rating: s }))}>
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nhận xét</label>
                  <textarea className="form-control" rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? <span className="spinner" /> : '📤 Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
