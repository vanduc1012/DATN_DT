import { useEffect, useRef, useState } from 'react';
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
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  // Image states
  const [imageModal, setImageModal] = useState(null); // pitch object
  const [uploadFiles, setUploadFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const fetchPitches = async () => {
    setLoading(true);
    try {
      const { data } = await pitchAPI.getAll({ limit: 100 });
      const raw = data?.data;
      setPitches(Array.isArray(raw) ? raw : raw?.pitches || []);
    } catch { setPitches([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPitches(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '',
      address: p.address || '', district: p.district || '', city: p.city || '',
      type: p.type || '5-a-side', pricePerHour: p.pricePerHour || '',
      openTime: p.openTime || '06:00', closeTime: p.closeTime || '22:00',
      status: p.status || 'active', amenities: p.amenities?.join(', ') || '',
    });
    setEditTarget(p);
    setShowModal(true);
  };
  const openImages = (p) => { setImageModal(p); setUploadFiles([]); setPreviews([]); };

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
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await pitchAPI.delete(deleteId);
      toast.success('Đã xóa sân!');
      setPitches((p) => p.filter((x) => x._id !== deleteId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    } finally { setDeleting(false); setDeleteId(null); }
  };

  // ── Image upload ────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // Validate size
    const oversize = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversize.length) { toast.error('Mỗi ảnh không vượt quá 5MB'); return; }
    // Giới hạn tổng ảnh
    const currentCount = imageModal?.images?.length || 0;
    if (currentCount + files.length > 10) {
      toast.error(`Tối đa 10 ảnh/sân. Hiện có ${currentCount} ảnh.`); return;
    }
    setUploadFiles(files);
    // Preview
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleUpload = async () => {
    if (!uploadFiles.length || !imageModal) return;
    setUploading(true);
    try {
      const fd = new FormData();
      uploadFiles.forEach((f) => fd.append('images', f));
      const { data } = await pitchAPI.uploadImages(imageModal._id, fd);
      toast.success(`Upload ${uploadFiles.length} ảnh thành công!`);
      setImageModal(data.data);
      setUploadFiles([]);
      setPreviews([]);
      if (fileRef.current) fileRef.current.value = '';
      // Update list
      setPitches((ps) => ps.map((p) => p._id === data.data._id ? data.data : p));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload thất bại');
    } finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      const { data } = await pitchAPI.deleteImage(imageModal._id, imageUrl);
      toast.success('Đã xóa ảnh!');
      setImageModal(data.data);
      setPitches((ps) => ps.map((p) => p._id === data.data._id ? data.data : p));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa ảnh thất bại');
    }
  };

  // ── UI helpers ──────────────────────────────────────────────
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
            <input className="form-control" placeholder="Tìm tên sân, địa chỉ..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  {['Ảnh', 'Tên sân', 'Loại', 'Địa chỉ', 'Giá/giờ', 'Giờ mở', 'Đánh giá', 'Trạng thái', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
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
                      {/* Ảnh thumbnail */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{
                          width: 52, height: 40, borderRadius: 8, overflow: 'hidden',
                          background: 'linear-gradient(135deg, #1e3a2f, #0f2417)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem', cursor: 'pointer', position: 'relative',
                          border: '1px solid var(--border)',
                        }} onClick={() => openImages(p)} title="Quản lý ảnh">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🏟️'}
                          {p.images?.length > 0 && (
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '4px 0 0 0', fontWeight: 700 }}>
                              {p.images.length}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-primary">{typeLabel[p.type] || p.type}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 180 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.district ? `${p.district}, ` : ''}{p.city || p.address}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--primary-light)', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                        {(p.pricePerHour || 0).toLocaleString('vi-VN')}₫
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {p.openTime} – {p.closeTime}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                        ⭐ {(p.averageRating || 0).toFixed(1)}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>({p.totalReviews || 0})</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, background: sb.bg, color: sb.color }}>{sb.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openImages(p)} style={{ marginRight: 4 }} title="Quản lý ảnh">🖼️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 4 }}>✏️</button>
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
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
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
                {editTarget && (
                  <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    💡 Để quản lý ảnh sân, nhấn nút <strong>🖼️</strong> trong bảng hoặc <strong style={{ color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => { setShowModal(false); openImages(editTarget); }}>click vào đây</strong>.
                  </div>
                )}
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

      {/* Image Management Modal */}
      {imageModal && (
        <div className="modal-overlay" onClick={() => setImageModal(null)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🖼️ Ảnh sân — {imageModal.name}</h3>
              <button className="modal-close" onClick={() => setImageModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Current images */}
              {imageModal.images?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ marginBottom: 12 }}>
                    Ảnh hiện tại ({imageModal.images.length}/10)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {imageModal.images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <img src={url} alt={`Ảnh ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && (
                          <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(22,163,74,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                            Ảnh chính
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteImage(url)}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none',
                            borderRadius: '50%', width: 26, height: 26, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                          }}
                          title="Xóa ảnh này"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              {imageModal.images?.length < 10 && (
                <div>
                  <label className="form-label" style={{ marginBottom: 10 }}>
                    Thêm ảnh mới (tối đa 5 ảnh/lần, mỗi ảnh ≤ 5MB)
                  </label>

                  {/* Drag & drop zone */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'var(--border)';
                      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                      if (files.length) {
                        const input = fileRef.current;
                        if (input) {
                          const dt = new DataTransfer();
                          files.forEach((f) => dt.items.add(f));
                          input.files = dt.files;
                          handleFileSelect({ target: { files: dt.files } });
                        }
                      }
                    }}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: 12, padding: '28px 20px',
                      textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)',
                      background: 'rgba(22,163,74,0.03)',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📸</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Click hoặc kéo thả ảnh vào đây</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP, GIF · Tối đa 5MB/ảnh</div>
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />

                  {/* Previews */}
                  {previews.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                        Xem trước ({previews.length} ảnh):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        {previews.map((url, i) => (
                          <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {imageModal.images?.length >= 10 && (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--warning)', fontWeight: 600 }}>
                  ⚠️ Đã đạt giới hạn 10 ảnh. Xóa bớt để thêm ảnh mới.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setImageModal(null); fetchPitches(); }}>Đóng</button>
              {previews.length > 0 && (
                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? <span className="spinner" /> : `📤 Upload ${previews.length} ảnh`}
                </button>
              )}
            </div>
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
              <p style={{ color: 'var(--text-secondary)' }}>Bạn có chắc muốn xóa sân này? Tất cả dữ liệu và ảnh sẽ bị mất.</p>
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
