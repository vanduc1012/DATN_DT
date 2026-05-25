import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pitchAPI, bookingAPI, reviewAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ReviewForm from '../components/ReviewForm';

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
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Booking state — hỗ trợ chọn nhiều slot liên tiếp
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [booking, setBooking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const isPastSlot = (slotStart) => {
    if (selectedDate !== today) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const [sh] = slotStart.split(':').map(Number);
    return sh <= currentHour;
  };

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    if (!newStartTime) {
      setEndTime('');
      return;
    }
    const [h, m] = newStartTime.split(':').map(Number);
    const defaultEnd = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const futureBookings = bookedSlots.filter((b) => b.startTime >= newStartTime);
    let maxEndTime = pitch?.closeTime || '22:00';
    if (futureBookings.length > 0) {
      const sorted = [...futureBookings].sort((a, b) => a.startTime.localeCompare(b.startTime));
      maxEndTime = sorted[0].startTime;
    }
    if (defaultEnd <= maxEndTime) {
      setEndTime(defaultEnd);
    } else {
      setEndTime(maxEndTime);
    }
  };

  const handleSlotClick = (slot) => {
    if (startTime === slot.start && endTime === slot.end) {
      setStartTime('');
      setEndTime('');
    } else {
      handleStartTimeChange(slot.start);
    }
  };

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
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  // ── Fetch available slots ─────────────────────────────────
  useEffect(() => {
    if (!id || !selectedDate) return;
    setLoadingSlots(true);
    setStartTime('');
    setEndTime('');
    bookingAPI.getAvailableSlots(id, selectedDate)
      .then(({ data }) => {
        const bookedSlotsData = data?.data?.bookedSlots || [];
        setBookedSlots(bookedSlotsData);
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, selectedDate]);

  // ── Refresh reviews ──────────────────────────────────────
  const refreshReviews = async () => {
    setLoadingReviews(true);
    try {
      const rRes = await reviewAPI.getByPitch(id);
      setReviews(rRes.data?.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
    setShowReviewForm(false);
  };

  // ── Book handler ──────────────────────────────────────────
  const handleBook = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập để đặt sân'); return navigate('/login'); }
    if (!startTime || !endTime) { toast.error('Vui lòng chọn khung giờ'); return; }
    setBooking(true);
    try {
      await bookingAPI.create({
        pitch: id,
        date: selectedDate,
        startTime,
        endTime,
        note: note.trim() || undefined,
      });
      toast.success('🎉 Đặt sân thành công!');
      setStartTime('');
      setEndTime('');
      setNote('');
      // Refresh slots
      const { data } = await bookingAPI.getAvailableSlots(id, selectedDate);
      const bookedSlotsData = data?.data?.bookedSlots || [];
      setBookedSlots(bookedSlotsData);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt sân thất bại');
    } finally {
      setBooking(false);
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
  const pricePerHour = pitch.pricePerHour || 0;

  const startTimeOptions = allSlots.filter((slot) => {
    const isPast = isPastSlot(slot.start);
    const isAlreadyBooked = bookedSlots.some((b) => b.startTime <= slot.start && b.endTime >= slot.end);
    return !isPast && !isAlreadyBooked;
  }).map((slot) => slot.start);

  let maxEndTime = pitch.closeTime || '22:00';
  if (startTime) {
    const futureBookings = bookedSlots.filter((b) => b.startTime >= startTime);
    if (futureBookings.length > 0) {
      const sorted = [...futureBookings].sort((a, b) => a.startTime.localeCompare(b.startTime));
      maxEndTime = sorted[0].startTime;
    }
  }

  const endTimeOptions = startTime
    ? allSlots
        .filter((slot) => slot.start >= startTime && slot.end <= maxEndTime)
        .map((slot) => slot.end)
    : [];

  let numHours = 0;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    numHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  }
  const totalPrice = numHours * pricePerHour;

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
                { key: 'reviews', label: `⭐ Đánh giá ${loadingReviews ? '' : `(${reviews?.length || 0})`}` },
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
                      {pricePerHour.toLocaleString('vi-VN')}₫
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
                {loadingReviews ? (
                  <div className="loading-state">
                    <div className="spinner" />
                    <span>Đang tải đánh giá...</span>
                  </div>
                ) : (
                  <>
                    {/* Review Form Section */}
                    {!showReviewForm && user && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(true)}>
                          ✏️ Viết đánh giá
                        </button>
                      </div>
                    )}

                    {showReviewForm && (
                      <div style={{ marginBottom: 20 }}>
                        <ReviewForm
                          pitchId={id}
                          pitchName={pitch.name}
                          onSuccess={refreshReviews}
                        />
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => setShowReviewForm(false)}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>Chưa có đánh giá</h3>
                        <p>{user ? 'Hãy là người đầu tiên đánh giá sân này!' : 'Đăng nhập để xem và viết đánh giá'}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {reviews.map((r) => (
                          <div key={r._id} className="card">
                            <div className="card-body">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                  <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(22,163,74,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-light)',
                                    flexShrink: 0
                                  }}>
                                    {r.user?.name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.user?.name || 'Ẩn danh'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      {r.createdAt ? format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm') : ''}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                  {'⭐'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                                </div>
                              </div>
                              {r.comment && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                                  {r.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
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

                {user && (user.role === 'admin' || user.email?.toLowerCase() === 'admin@gmail.com') ? (
                  <div style={{ textAlign: 'center', padding: '30px 15px', color: 'var(--danger)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚫</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.5, color: '#f87171' }}>
                      Tài khoản Quản trị viên<br />không được phép đặt sân
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
                      Vui lòng sử dụng tài khoản Khách hàng để thực hiện chức năng đặt sân.
                    </p>
                  </div>
                ) : pitch.status !== 'active' ? (
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
                      <label className="form-label" style={{ marginBottom: 6 }}>
                        Trạng thái sân
                      </label>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                        💡 Ô màu đỏ là đã có người đặt. Bạn có thể bấm vào ô trống để chọn nhanh giờ bắt đầu.
                      </div>
                      {loadingSlots ? (
                        <div style={{ textAlign: 'center', padding: 16 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                      ) : (
                        <div className="slot-grid">
                          {allSlots.map((slot) => {
                            const isPast = isPastSlot(slot.start);
                            const isAlreadyBooked = bookedSlots.some((b) => b.startTime <= slot.start && b.endTime >= slot.end);
                            const isBooked = isPast || isAlreadyBooked;
                            const isSelected = startTime && endTime && slot.start >= startTime && slot.end <= endTime;
                            const isAnchor = startTime === slot.start;
                            return (
                              <button
                                key={slot.start}
                                className={`slot-btn${isBooked ? ' booked' : ''}${isSelected ? ' selected' : ''}`}
                                onClick={() => !isBooked && handleSlotClick(slot)}
                                disabled={isBooked}
                                title={isPast ? 'Khung giờ đã trôi qua' : isAlreadyBooked ? 'Đã được đặt' : slot.label}
                                style={isAnchor ? { boxShadow: '0 0 0 2px var(--primary-light)', zIndex: 1 } : {}}
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

                    {/* Time Dropdowns */}
                    {!loadingSlots && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="form-label">Giờ bắt đầu</label>
                          <select 
                            className="form-control" 
                            value={startTime} 
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                          >
                            <option value="">-- Chọn --</option>
                            {startTimeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Giờ kết thúc</label>
                          <select 
                            className="form-control" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={!startTime}
                          >
                            <option value="">-- Chọn --</option>
                            {endTimeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {numHours > 0 && (
                      <div className="form-group">
                        <label className="form-label">Ghi chú (tùy chọn)</label>
                        <textarea className="form-control" rows={2} placeholder="Thông tin thêm cho chủ sân..."
                          value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'vertical' }} />
                      </div>
                    )}

                    {/* Price summary */}
                    {numHours > 0 && (
                      <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Khung giờ</span>
                          <span style={{ fontWeight: 600 }}>{startTime} – {endTime}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Thời lượng</span>
                          <span style={{ fontWeight: 600 }}>{numHours} giờ × {pricePerHour.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(22,163,74,0.25)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Tổng cộng</span>
                          <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                            {totalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-primary btn-block btn-lg"
                      onClick={handleBook}
                      disabled={booking || numHours === 0}
                    >
                      {booking ? <span className="spinner" /> : `⚡ Đặt sân ngay${numHours > 0 ? ` (${numHours} giờ)` : ''}`}
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
    </div>
  );
}
