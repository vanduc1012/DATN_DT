import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { pitchAPI, reviewAPI } from '../api/services';
import toast from 'react-hot-toast';

/* ── SVG Icons for Hero Search Card ── */
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const DEFAULT_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Nguyễn Văn Nam',
    role: 'Đội trưởng FC Star',
    comment: 'Giao diện website cực kỳ trực quan, đặt sân chỉ mất chưa đầy 1 phút. Thanh toán online tiện lợi và bảo mật. Dịch vụ tuyệt vời!',
    rating: 5,
    verified: true
  },
  {
    id: 't2',
    name: 'Trần Thanh Bình',
    role: 'Người chơi tự do',
    comment: 'SânBóngPro giúp tôi dễ dàng tìm kiếm các sân bóng quanh khu vực của mình. Lịch đặt luôn chính xác, không lo bị trùng lịch.',
    rating: 5,
    verified: true
  },
  {
    id: 't3',
    name: 'Phạm Minh Hoàng',
    role: 'Quản lý sân bóng',
    comment: 'Từ khi hợp tác và đưa sân bóng lên hệ thống, lượng khách đặt sân của chúng tôi tăng trưởng đáng kể. Quy trình quản lý rất khoa học.',
    rating: 5,
    verified: true
  },
  {
    id: 't4',
    name: 'Lê Thùy Linh',
    role: 'Khách đặt sân tự do',
    comment: 'Tìm kiếm sân 5 hay sân 7 rất tiện, hình ảnh sân rõ ràng và thông tin giá cả minh bạch. Rất khuyến khích mọi người sử dụng!',
    rating: 5,
    verified: true
  }
];

function PitchCard({ pitch }) {
  const typeLabel = {
    '5-a-side': 'Sân 5',
    '7-a-side': 'Sân 7',
    '11-a-side': 'Sân 11',
  };

  return (
    <Link to={`/pitches/${pitch._id}`} className="pitch-card">
      <div className="pitch-img">
        {pitch.images?.[0]
          ? <img src={pitch.images[0]} alt={pitch.name} />
          : <span style={{ fontSize: '3rem' }}>🏟️</span>
        }
        <span className="pitch-type-badge">{typeLabel[pitch.type] || pitch.type}</span>
      </div>
      <div className="pitch-card-body">
        <div className="pitch-card-title">{pitch.name}</div>
        <div className="pitch-card-location">
          📍 {pitch.district ? `${pitch.district}, ` : ''}{pitch.city || pitch.address}
        </div>
        <div className="pitch-card-footer">
          <div>
            <div className="pitch-price">
              {pitch.pricePerHour?.toLocaleString('vi-VN')}₫
              <small> /giờ</small>
            </div>
          </div>
          <div>
            <span className="stars">{'⭐'.repeat(Math.round(pitch.averageRating || 5))}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              ({pitch.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero search states
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');

  // Testimonials states
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Load pitches
    pitchAPI.getAll({ limit: 6 })
      .then(({ data }) => setPitches(data.data?.pitches || data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load recent reviews from backend
    reviewAPI.getRecent()
      .then(({ data }) => {
        const reviews = data?.data || [];
        setTestimonials(reviews);
      })
      .catch(() => {
        // Fallback to DEFAULT_TESTIMONIALS nếu backend không có
        setTestimonials(DEFAULT_TESTIMONIALS.slice(0, 3));
      });
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (city) queryParams.push(`city=${encodeURIComponent(city)}`);
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (date) queryParams.push(`date=${encodeURIComponent(date)}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/pitches${queryString}`);
  };

  return (
    <div>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              Đặt sân bóng<br />
              <span className="text-highlight">nhanh chóng</span> &amp; dễ dàng
            </h1>
            <p>
              Tìm sân, chọn giờ và thanh toán chỉ trong vài phút. Trải nghiệm đặt sân thông minh cùng SânBóngPro.
            </p>

            {/* Search Card */}
            <form onSubmit={handleHeroSearch} className="hero-search-card">
              <div className="hero-search-grid">
                {/* City */}
                <div className="hero-search-field">
                  <label className="hero-search-label">Tỉnh/Thành phố</label>
                  <div className="hero-search-input-wrapper">
                    <span className="hero-search-icon"><IconPin /></span>
                    <select 
                      className="hero-search-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Chọn tỉnh thành</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Hồ Chí Minh">TP. HCM</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                    </select>
                  </div>
                </div>

                {/* Pitch Type */}
                <div className="hero-search-field">
                  <label className="hero-search-label">Loại sân</label>
                  <div className="hero-search-input-wrapper">
                    <span className="hero-search-icon"><IconUsers /></span>
                    <select 
                      className="hero-search-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Tất cả loại sân</option>
                      <option value="5-a-side">Sân 5 người</option>
                      <option value="7-a-side">Sân 7 người</option>
                      <option value="11-a-side">Sân 11 người</option>
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="hero-search-field">
                  <label className="hero-search-label">Ngày đặt</label>
                  <div className="hero-search-input-wrapper">
                    <span className="hero-search-icon"><IconCalendar /></span>
                    <input 
                      type="date" 
                      className="hero-search-date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="hero-search-btn">
                🔍 Tìm sân ngay
              </button>
            </form>

            {/* Stats list under Card */}
            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Sân bóng</div>
              </div>
              <div className="hero-stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 40 }}>
                <div className="hero-stat-value">10K+</div>
                <div className="hero-stat-label">Lượt đặt</div>
              </div>
              <div className="hero-stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 40 }}>
                <div className="hero-stat-value">63</div>
                <div className="hero-stat-label">Tỉnh thành</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pitches Preview ────────────────────────── */}
      <section style={{ padding: '60px 0 80px', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 className="section-title">Sân nổi bật</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Những sân được đặt nhiều nhất tuần này</p>
            </div>
            <Link to="/pitches" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner-lg" />
              <span>Đang tải sân bóng...</span>
            </div>
          ) : pitches.length > 0 ? (
            <div className="grid-3">
              {pitches.slice(0, 6).map((p) => (
                <PitchCard key={p._id} pitch={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏟️</div>
              <h3>Chưa có sân nào</h3>
              <p>Sân bóng sẽ xuất hiện ở đây khi có dữ liệu từ backend</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Reviews / Testimonials Section ─────────── */}
      <section className="reviews-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>⭐ Đánh giá từ khách hàng</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: 40 }}>
            Những chia sẻ thực tế từ những người dùng đã hoàn thành đặt sân
          </p>

          {testimonials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Chưa có đánh giá</h3>
              <p>Hãy hoàn thành booking và trở thành người đầu tiên đánh giá SânBóngPro!</p>
            </div>
          ) : (
            <div className="grid-3">
              {testimonials.slice(0, 3).map((item) => (
                <div key={item._id || item.id} className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      {item.user?.name?.[0]?.toUpperCase() || item.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="testimonial-user">
                      <h4>{item.user?.name || item.name || 'Ẩn danh'}</h4>
                      <p>{item.pitch?.name || item.role || 'Sân bóng'}</p>
                    </div>
                  </div>
                  <p className="testimonial-text">
                    "{item.comment}"
                  </p>
                  <div className="testimonial-footer">
                    <span className="testimonial-stars">
                      {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-icon">⚽</div>
                <span>SânBóng</span>
              </div>
              <p>Nền tảng đặt sân bóng trực tuyến hàng đầu Việt Nam. Đơn giản, nhanh chóng và đáng tin cậy.</p>
            </div>
            <div className="footer-col">
              <h4>Dịch vụ</h4>
              <Link to="/pitches">Tìm sân</Link>
              <Link to="/my-bookings">Lịch đặt</Link>
              <Link to="/profile">Tài khoản</Link>
            </div>
            <div className="footer-col">
              <h4>Hỗ trợ</h4>
              <a href="#">Hướng dẫn</a>
              <a href="#">Liên hệ</a>
              <a href="#">Điều khoản</a>
            </div>
          </div>
          <div className="footer-copy">
            © 2026 SânBóng. Được phát triển bởi DATN-DT.
          </div>
        </div>
      </footer>
    </div>
  );
}
