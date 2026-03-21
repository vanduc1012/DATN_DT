import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pitchAPI } from '../api/services';

const TYPES = [
  { value: '', label: 'Tất cả' },
  { value: '5-player', label: 'Sân 5' },
  { value: '7-player', label: 'Sân 7' },
  { value: '11-player', label: 'Sân 11' },
];

const TYPE_LABELS = { '5-player': 'Sân 5', '7-player': 'Sân 7', '11-player': 'Sân 11' };

function PitchCard({ pitch }) {
  return (
    <Link to={`/pitches/${pitch._id}`} className="pitch-card">
      <div className="pitch-img">
        {pitch.images?.[0]
          ? <img src={pitch.images[0]} alt={pitch.name} />
          : '🏟️'}
        <span className="pitch-type-badge">{TYPE_LABELS[pitch.type] || pitch.type}</span>
      </div>
      <div className="pitch-card-body">
        <div className="pitch-card-title">{pitch.name}</div>
        <div className="pitch-card-location">
          📍 {pitch.district ? `${pitch.district}, ` : ''}{pitch.city || pitch.address}
        </div>
        <div className="pitch-card-footer">
          <div className="pitch-price">
            {pitch.pricePerHour?.toLocaleString('vi-VN')}₫<small> /giờ</small>
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

export default function Pitches() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', city: '' });
  const [applied, setApplied] = useState({});

  const fetchPitches = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await pitchAPI.getAll(params);
      setPitches(data.data?.pitches || data.data || []);
    } catch {
      setPitches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPitches(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.city) params.city = filters.city;
    setApplied(params);
    fetchPitches(params);
  };

  const handleReset = () => {
    setFilters({ search: '', type: '', city: '' });
    setApplied({});
    fetchPitches();
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">🏟️ Danh sách sân bóng</h1>
          <p className="section-subtitle">Tìm kiếm và đặt sân phù hợp với bạn</p>
        </div>

        {/* Filter Bar */}
        <form className="filter-bar" onSubmit={handleSearch}>
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Tìm kiếm</label>
            <div className="input-group">
              <span className="input-icon">🔍</span>
              <input
                className="form-control"
                placeholder="Tên sân, địa chỉ..."
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Loại sân</label>
            <select
              className="form-control"
              value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Thành phố</label>
            <input
              className="form-control"
              placeholder="Hà Nội, TP.HCM..."
              value={filters.city}
              onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, paddingBottom: 1 }}>
            <button type="submit" className="btn btn-primary">🔍 Tìm</button>
            {Object.keys(applied).length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={handleReset}>✕</button>
            )}
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner-lg" />
            <span>Đang tải...</span>
          </div>
        ) : pitches.length > 0 ? (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Tìm thấy {pitches.length} sân bóng
            </p>
            <div className="grid-3">
              {pitches.map((p) => (
                <PitchCard key={p._id} pitch={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏟️</div>
            <h3>Không tìm thấy sân</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button className="btn btn-outline" onClick={handleReset}>Xóa bộ lọc</button>
          </div>
        )}
      </div>
    </div>
  );
}
