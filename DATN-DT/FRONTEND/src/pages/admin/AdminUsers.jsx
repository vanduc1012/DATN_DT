import { useEffect, useState } from 'react';
import { userAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_LABELS = { user: 'Người dùng', owner: 'Chủ sân', admin: 'Quản trị viên' };
const ROLE_COLORS = { user: 'var(--info)', owner: 'var(--warning)', admin: 'var(--primary-light)' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll();
      const result = data?.data;
      setUsers(Array.isArray(result) ? result : result?.users || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (userId) => {
    setToggling(userId);
    try {
      const { data } = await userAPI.toggleStatus(userId);
      const updated = data.data;
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: updated?.isActive ?? !u.isActive } : u));
      toast.success('Đã cập nhật trạng thái tài khoản!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(deleteId);
    try {
      await userAPI.delete(deleteId);
      toast.success('Đã xóa người dùng!');
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(null);
      setDeleteId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = { user: 0, owner: 0, admin: 0 };
  users.forEach((u) => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>👤 Quản lý người dùng</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{users.length} tài khoản trong hệ thống</p>
      </div>

      {/* Role overview */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <div key={role} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '16px 18px',
            borderLeft: `3px solid ${ROLE_COLORS[role]}`,
            cursor: 'pointer',
            outline: filterRole === role ? `2px solid ${ROLE_COLORS[role]}` : 'none',
          }} onClick={() => setFilterRole(filterRole === role ? '' : role)}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: ROLE_COLORS[role] }}>{roleCounts[role]}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Tìm kiếm</label>
          <div className="input-group">
            <span className="input-icon">🔍</span>
            <input className="form-control" placeholder="Tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Vai trò</label>
          <select className="form-control" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {(search || filterRole) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRole(''); }} style={{ alignSelf: 'flex-end', marginBottom: 1 }}>
            ✕ Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-state"><div className="spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👤</div><h3>Không tìm thấy người dùng</h3></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Người dùng', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: u.isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.875rem',
                        }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          {u.phone && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📞 {u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                        background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role],
                        border: `1px solid ${ROLE_COLORS[u.role]}44`,
                      }}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                        background: u.isActive ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
                        color: u.isActive ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${u.isActive ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: u.isActive ? 'var(--success)' : 'var(--danger)' }} />
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className={`btn btn-sm`}
                          style={{
                            fontSize: '0.75rem', padding: '5px 10px',
                            background: u.isActive ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.12)',
                            color: u.isActive ? 'var(--warning)' : 'var(--success)',
                            border: `1px solid ${u.isActive ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)'}`,
                          }}
                          onClick={() => handleToggleStatus(u._id)}
                          disabled={toggling === u._id}
                        >
                          {toggling === u._id ? <span className="spinner" /> : u.isActive ? '🔒 Khóa' : '🔓 Mở khóa'}
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => setDeleteId(u._id)}>
                            🗑️
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xóa người dùng</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Bạn có chắc muốn xóa tài khoản{' '}
                <strong>{users.find((u) => u._id === deleteId)?.name}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={!!deleting}>
                {deleting ? <span className="spinner" /> : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
