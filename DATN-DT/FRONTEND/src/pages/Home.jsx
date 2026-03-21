import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { pitchAPI } from '../api/services';

function PitchCard({ pitch }) {
  const typeLabel = {
    '5-player': 'Sân 5',
    '7-player': 'Sân 7',
    '11-player': 'Sân 11',
  };

  return (
    <Link to={`/pitches/${pitch._id}`} className="pitch-card">
      <div className="pitch-img">
        {pitch.images?.[0]
          ? <img src={pitch.images[0]} alt={pitch.name} />
          : '🏟️'
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
            <span className="stars">{'⭐'.repeat(Math.round(pitch.averageRating || 0))}</span>
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
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pitchAPI.getAll({ limit: 6 })
      .then(({ data }) => setPitches(data.data?.pitches || data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">⚡ Đặt sân nhanh &bull; Tiện lợi &bull; Uy tín</div>
            <h1>
              Đặt sân bóng<br />
              <span className="text-gradient">đơn giản hơn bao giờ hết</span>
            </h1>
            <p>
              Khám phá hàng trăm sân bóng chất lượng, đặt lịch online chỉ trong vài giây.
              Không cần gọi điện, không chờ đợi.
            </p>
            <div className="hero-cta">
              <Link to="/pitches" className="btn btn-primary btn-lg">
                🔍 Tìm sân ngay
              </Link>
              {!user && (
                <Link to="/register" className="btn btn-outline btn-lg">
                  ✨ Đăng ký miễn phí
                </Link>
              )}
            </div>

            <div className="hero-stats">
              {[
                { value: '500+', label: 'Sân bóng' },
                { value: '10K+', label: 'Người dùng' },
                { value: '50K+', label: 'Lượt đặt' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Tại sao chọn chúng tôi?</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Trải nghiệm đặt sân dễ dàng và hiện đại nhất</p>

          <div className="grid-3" style={{ marginTop: 40 }}>
            {[
              { icon: '⚡', title: 'Đặt sân tức thì', desc: 'Xác nhận đặt sân ngay lập tức, không cần chờ phê duyệt.' },
              { icon: '🗓️', title: 'Quản lý lịch dễ dàng', desc: 'Theo dõi toàn bộ lịch đặt, hủy hoặc chỉnh sửa bất kỳ lúc nào.' },
              { icon: '🌟', title: 'Đánh giá minh bạch', desc: 'Xem đánh giá thực tế từ người chơi để chọn sân tốt nhất.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{icon}</div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 10 }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pitches Preview ────────────────────────── */}
      <section style={{ padding: '40px 0 80px', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 className="section-title">Sân nổi bật</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Những sân được đánh giá cao nhất</p>
            </div>
            <Link to="/pitches" className="btn btn-outline btn-sm">
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

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-icon">⚽</div>
                <span>SânBóng<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
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
            © 2024 SânBóngPro. Được phát triển bởi DATN-DT.
          </div>
        </div>
      </footer>
    </div>
  );
}
