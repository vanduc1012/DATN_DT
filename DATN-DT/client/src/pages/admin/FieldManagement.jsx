import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, X, Upload, Image as ImageIcon } from 'lucide-react';
import { message, Modal, Popconfirm, Select } from 'antd';
import { getAllFields, createField, updateField, deleteField } from '../../config/FieldRequest';
import provinces from '../../json/provinces.json';

function FieldManagement() {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '5',
        description: '',
        detailAddress: '',
        province: '',
        status: 'active',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Field type labels
    const typeLabels = {
        5: '5 người',
        7: '7 người',
        11: '11 người',
    };

    // Status config
    const statusConfig = {
        active: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
        maintenance: { label: 'Bảo trì', class: 'bg-yellow-100 text-yellow-700' },
        inactive: { label: 'Tạm ngưng', class: 'bg-red-100 text-red-700' },
    };

    // Fetch fields
    const fetchFields = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                page: pagination.page,
                limit: pagination.limit,
            };
            if (filterType) params.type = filterType;
            if (filterStatus) params.status = filterStatus;

            const response = await getAllFields(params);
            setFields(response.metadata.fields);
            setPagination(response.metadata.pagination);
        } catch (error) {
            message.error('Không thể tải danh sách sân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, [pagination.page, searchTerm, filterType, filterStatus]);

    // Open modal for create
    const handleOpenCreate = () => {
        setEditingField(null);
        setFormData({
            name: '',
            type: '5',
            description: '',
            detailAddress: '',
            province: '',
            status: 'active',
        });
        setImageFiles([]);
        setImagePreview([]);
        setExistingImages([]);
        setIsModalOpen(true);
    };

    // Open modal for edit
    const handleOpenEdit = (field) => {
        setEditingField(field);

        // Split address into detail and province if possible
        let detail = field.address || '';
        let prov = '';

        // Check if address ends with a known province
        const foundProvince = provinces.find((p) => detail.includes(p.name));
        if (foundProvince) {
            // Check if it's actually at the end or separated by comma
            // Simple approach: if present, assume it's the province
            prov = foundProvince.name;
            // Remove province from detail to avoid duplication in UI
            detail = detail.replace(`, ${prov}`, '').replace(` ${prov}`, '').replace(prov, '').trim();
            // Remove trailing comma if any
            if (detail.endsWith(',')) detail = detail.slice(0, -1).trim();
        }

        setFormData({
            name: field.name,
            type: field.type,
            description: field.description || '',
            detailAddress: detail,
            province: prov,
            status: field.status,
        });
        setImageFiles([]);
        setImagePreview([]);
        setExistingImages(field.images || []);
        setIsModalOpen(true);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles((prev) => [...prev, ...files]);

        // Create previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove new image
    const removeNewImage = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreview((prev) => prev.filter((_, i) => i !== index));
    };

    // Remove existing image
    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            message.error('Vui lòng nhập tên sân');
            return;
        }

        setSubmitting(true);
        try {
            const fullAddress = formData.province;

            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('address', fullAddress);
            data.append('status', formData.status);

            // Add existing images for update
            if (editingField) {
                data.append('existingImages', JSON.stringify(existingImages));
            }

            // Add new images
            imageFiles.forEach((file) => {
                data.append('images', file);
            });

            if (editingField) {
                await updateField(editingField._id, data);
                message.success('Cập nhật sân bóng thành công');
            } else {
                await createField(data);
                message.success('Thêm sân bóng thành công');
            }

            setIsModalOpen(false);
            fetchFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete field
    const handleDelete = async (id) => {
        try {
            await deleteField(id);
            message.success('Xoá sân bóng thành công');
            fetchFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xoá sân');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý sân bóng</h1>
                    <p className="text-gray-500 mt-1">Quản lý tất cả sân bóng trong hệ thống</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold rounded-lg
                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                             transition-all duration-200 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Thêm sân mới
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination((p) => ({ ...p, page: 1 }));
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                 transition-all duration-200"
                    />
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200" />

                {/* Filter: Loại sân */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            setPagination((p) => ({ ...p, page: 1 }));
                        }}
                        className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600
                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                 transition-all duration-200 appearance-none cursor-pointer"
                    >
                        <option value="">Tất cả loại sân</option>
                        <option value="5">Sân 5 người</option>
                        <option value="7">Sân 7 người</option>
                        <option value="11">Sân 11 người</option>
                    </select>
                </div>

                {/* Filter: Trạng thái */}
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600
                             focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                             transition-all duration-200 appearance-none cursor-pointer"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Tạm ngưng</option>
                </select>

                {/* Reset */}
                {(searchTerm || filterType || filterStatus) && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('');
                            setFilterStatus('');
                            setPagination((p) => ({ ...p, page: 1 }));
                        }}
                        className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        Xóa lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Sân bóng
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Địa chỉ
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Loại sân
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Mô tả
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : fields.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    Không có sân bóng nào
                                </td>
                            </tr>
                        ) : (
                            fields.map((field) => (
                                <tr key={field._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    field.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'
                                                }
                                                alt={field.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <span className="font-medium text-gray-800">{field.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 line-clamp-1">
                                            {field.address || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{typeLabels[field.type]}</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px]">
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {field.description || 'Chưa có mô tả'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[field.status]?.class || 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {statusConfig[field.status]?.label || field.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(field)}
                                                className="p-2 text-gray-400 hover:text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <Popconfirm
                                                title="Xác nhận xoá"
                                                description="Bạn có chắc chắn muốn xoá sân này?"
                                                onConfirm={() => handleDelete(field._id)}
                                                okText="Xoá"
                                                cancelText="Huỷ"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Trang {pagination.page} / {pagination.totalPages} ({pagination.total} sân)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editingField ? 'Chỉnh sửa sân bóng' : 'Thêm sân bóng mới'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
            >
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên sân <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên sân bóng"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            required
                        />
                    </div>

                    {/* Type & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại sân</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            >
                                <option value="5">5 người</option>
                                <option value="7">7 người</option>
                                <option value="11">11 người</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="maintenance">Bảo trì</option>
                                <option value="inactive">Tạm ngưng</option>
                            </select>
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tỉnh/Thành phố <span className="text-red-500">*</span>
                            </label>
                            <Select
                                showSearch
                                placeholder="Chọn tỉnh/thành phố"
                                optionFilterProp="children"
                                value={formData.province || undefined}
                                onChange={(value) => setFormData((prev) => ({ ...prev, province: value }))}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={provinces.map((p) => ({ value: p.name, label: p.name }))}
                                className="w-full h-[42px]"
                                size="large"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả về sân bóng..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] resize-none"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {existingImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Image Previews */}
                        {imagePreview.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {imagePreview.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt=""
                                            className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#16A34A] hover:bg-green-50 transition-colors">
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Nhấn để tải ảnh lên</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Đang xử lý...' : editingField ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default FieldManagement;
