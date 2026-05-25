import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pitchAPI } from '../api/services';

const TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: '5-a-side', label: 'Sân 5 người' },
  { value: '7-a-side', label: 'Sân 7 người' },
  { value: '11-a-side', label: 'Sân 11 người' },
];

const PRICE_RANGES = [
  { value: '', label: 'Tất cả giá' },
  { value: '0-100000', label: 'Dưới 100K/giờ' },
  { value: '100000-200000', label: '100K - 200K/giờ' },
  { value: '200000-300000', label: '200K - 300K/giờ' },
  { value: '300000-999999999', label: 'Trên 300K/giờ' },
];

const TYPE_LABELS = { '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' };

function PitchCard({ pitch }) {
  return (
    <Link to={`/pitches/${pitch._id}`} className="pitch-card">
      <div className="pitch-img">
        {pitch.images?.[0]
          ? <img src={pitch.images[0]} alt={pitch.name} />
          : <span style={{ fontSize: '3rem' }}>🏟️</span>}
        <span className="pitch-type-badge">{TYPE_LABELS[pitch.type] || pitch.type}</span>
        {pitch.status === 'maintenance' && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(245,158,11,0.9)', color: '#fff',
            fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6,
          }}>🔧 Bảo trì</span>
        )}
      </div>
      <div className="pitch-card-body">
        <div className="pitch-card-title">{pitch.name}</div>
        <div className="pitch-card-location">
          📍 {pitch.district ? `${pitch.district}, ` : ''}{pitch.city || pitch.address}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          🕐 {pitch.openTime || '06:00'} – {pitch.closeTime || '22:00'}
        </div>
        <div className="pitch-card-footer">
          <div className="pitch-price">
            {pitch.pricePerHour?.toLocaleString('vi-VN')}₫<small> /giờ</small>
          </div>
          <div>
            ⭐ <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{(pitch.averageRating || 0).toFixed(1)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>({pitch.totalReviews || 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Pitches() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', city: '', priceRange: '' });
  const [applied, setApplied] = useState({});

  const fetchPitches = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await pitchAPI.getAll({ limit: 100, ...params });
      const raw = data?.data;
      setPitches(Array.isArray(raw) ? raw : raw?.pitches || []);
    } catch {
      setPitches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters = {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
      city: searchParams.get('city') || '',
      priceRange: searchParams.get('priceRange') || ''
    };
    setFilters(initialFilters);

    const queryPayload = {};
    if (initialFilters.search) queryPayload.search = initialFilters.search;
    if (initialFilters.type) queryPayload.type = initialFilters.type;
    if (initialFilters.city) queryPayload.city = initialFilters.city;
    if (initialFilters.priceRange) {
      const [min, max] = initialFilters.priceRange.split('-');
      queryPayload.minPrice = min;
      queryPayload.maxPrice = max;
    }
    setApplied(queryPayload);
    fetchPitches(queryPayload);
  }, [window.location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.city) params.city = filters.city;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      params.minPrice = min;
      params.maxPrice = max;
    }
    setApplied(params);
    fetchPitches(params);
  };

  const handleReset = () => {
    setFilters({ search: '', type: '', city: '', priceRange: '' });
    setApplied({});
    fetchPitches();
  };

  const hasFilter = filters.search || filters.type || filters.city || filters.priceRange;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">🏟️ Danh sách sân bóng</h1>
          <p className="section-subtitle">Tìm kiếm và đặt sân phù hợp với bạn</p>
        </div>

        {/* Filter Bar */}
        <form className="filter-bar" onSubmit={handleSearch} style={{ flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '2 1 200px' }}>
            <label className="form-label">Tìm kiếm</label>
            <div className="input-group">
              <span className="input-icon">🔍</span>
              <input className="form-control" placeholder="Tên sân, địa chỉ..."
                value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
            </div>
          </div>

          <div className="form-group" style={{ flex: '1 1 140px' }}>
            <label className="form-label">Loại sân</label>
            <select className="form-control" value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flex: '1 1 160px' }}>
            <label className="form-label">Khoảng giá</label>
            <select className="form-control" value={filters.priceRange}
              onChange={(e) => setFilters((p) => ({ ...p, priceRange: e.target.value }))}>
              {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flex: '1 1 140px' }}>
            <label className="form-label">Thành phố</label>
            <input className="form-control" placeholder="Hà Nội, TP.HCM..."
              value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingBottom: 1 }}>
            <button type="submit" className="btn btn-primary">🔍 Tìm</button>
            {hasFilter && <button type="button" className="btn btn-ghost" onClick={handleReset}>✕ Xóa</button>}
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /><span>Đang tải...</span></div>
        ) : pitches.length > 0 ? (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Tìm thấy <strong style={{ color: 'var(--primary-light)' }}>{pitches.length}</strong> sân bóng
            </p>
            <div className="grid-3">
              {pitches.map((p) => <PitchCard key={p._id} pitch={p} />)}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏟️</div>
            <h3>Không tìm thấy sân</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button className="btn btn-primary" onClick={handleReset}>Xóa bộ lọc</button>
          </div>
        )}
      </div>
    </div>
  );
}
