import { useEffect, useState } from 'react';
import { pitchAPI } from '../../api/services';
import toast from 'react-hot-toast';

const TYPE_OPTS = [
  { value: '5-a-side', label: 'Sân 5 người' },
  { value: '7-a-side', label: 'Sân 7 người' },
  { value: '11-a-side', label: 'Sân 11 người' },
];
const STATUS_OPTS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'inactive', label: 'Không hoạt động' },
];

const EMPTY_FORM = {
  name: '', description: '', address: '', district: '', city: '',
  type: '5-a-side', pricePerHour: '', openTime: '06:00', closeTime: '22:00',
  status: 'active', amenities: '',
};

export default function AdminPitches() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPitches = async (q = {}) => {
    setLoading(true);
    try {
      const { data } = await pitchAPI.getAll({ limit: 100, ...q });
      setPitches(data.data?.pitches || data.data || []);
    } catch { setPitches([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPitches(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '',
      address: p.address || '', district: p.district || '', city: p.city || '',
      type: p.type || '5-player', pricePerHour: p.pricePerHour || '',
      openTime: p.openTime || '06:00', closeTime: p.closeTime || '22:00',
      status: p.status || 'active',
      amenities: p.amenities?.join(', ') || '',
    });
    setEditTarget(p);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerHour: Number(form.pricePerHour),
        amenities: form.amenities ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editTarget) {
        await pitchAPI.update(editTarget._id, payload);
        toast.success('Đã cập nhật sân!');
      } else {
        await pitchAPI.create(payload);
        toast.success('Đã thêm sân mới!');
      }
      setShowModal(false);
      fetchPitches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await pitchAPI.delete(deleteId);
      toast.success('Đã xóa sân!');
      setPitches((p) => p.filter((x) => x._id !== deleteId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = pitches.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = { '5-a-side': 'Sân 5', '7-a-side': 'Sân 7', '11-a-side': 'Sân 11' };
  const statusBadge = {
    active: { bg: 'rgba(16,185,129,.12)', color: 'var(--success)', label: 'Hoạt động' },
    maintenance: { bg: 'rgba(245,158,11,.12)', color: 'var(--warning)', label: 'Bảo trì' },
    inactive: { bg: 'rgba(239,68,68,.12)', color: 'var(--danger)', label: 'Không hoạt động' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>🏟️ Quản lý sân bóng</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{pitches.length} sân trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm sân mới</button>
      </div>

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <div className="input-group">
            <span className="input-icon">🔍</span>
            <input
              className="form-control"
              placeholder="Tìm tên sân, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏟️</div>
            <h3>Chưa có sân nào</h3>
            <button className="btn btn-primary" onClick={openCreate}>Thêm sân đầu tiên</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Tên sân', 'Loại', 'Địa chỉ', 'Giá/giờ', 'Giờ mở', 'Đánh giá', 'Trạng thái', ''].map((h) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--text-muted)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const sb = statusBadge[p.status] || statusBadge.inactive;
                  return (
                    <tr key={p._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-primary">{typeLabel[p.type] || p.type}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 200 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.district ? `${p.district}, ` : ''}{p.city || p.address}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-light)', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                        {p.pricePerHour?.toLocaleString('vi-VN')}₫
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {p.openTime} – {p.closeTime}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                        ⭐ {(p.averageRating || 0).toFixed(1)}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>({p.totalReviews || 0})</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                          background: sb.bg, color: sb.color,
                        }}>{sb.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 6 }}>✏️ Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? '✏️ Sửa sân' : '➕ Thêm sân mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên sân *</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loại sân *</label>
                    <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ *</label>
                  <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quận / Huyện</label>
                    <input className="form-control" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thành phố</label>
                    <input className="form-control" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Giá thuê / giờ (₫) *</label>
                    <input type="number" className="form-control" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} required min={0} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Giờ mở cửa</label>
                    <input type="time" className="form-control" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giờ đóng cửa</label>
                    <input type="time" className="form-control" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tiện ích (phân cách bằng dấu phẩy)</label>
                  <input className="form-control" placeholder="Đèn chiếu sáng, Giữ xe, Phòng thay đồ" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editTarget ? '💾 Lưu thay đổi' : '➕ Thêm sân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xác nhận xóa sân</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Bạn có chắc muốn xóa sân này? Tất cả dữ liệu sẽ bị mất.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : '🗑️ Xóa sân'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
