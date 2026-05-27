import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Percent, DollarSign, Calendar, RefreshCw, X } from 'lucide-react';
import { message, Modal, Popconfirm, Select, DatePicker, Switch } from 'antd';
import dayjs from 'dayjs';
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../config/DiscountRequest';

const { RangePicker } = DatePicker;

function DiscountManagement() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxDiscountValue: null,
        usageLimit: null,
        usageLimitPerUser: 1,
        startDate: null,
        endDate: null,
        isActive: true,
        appliesTo: 'all',
    });

    // Fetch discounts
    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const response = await getAllDiscounts({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            setDiscounts(response.metadata.discounts || []);
            if (response.metadata.pagination) {
                setPagination(response.metadata.pagination);
            }
        } catch (error) {
            message.error('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, [pagination.page, statusFilter]);

    // Handle search
    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchDiscounts();
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Open create modal
    const handleOpenCreate = () => {
        setEditingDiscount(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            type: 'percentage',
            value: 0,
            minOrderValue: 0,
            maxDiscountValue: null,
            usageLimit: null,
            usageLimitPerUser: 1,
            startDate: null,
            endDate: null,
            isActive: true,
            appliesTo: 'all',
        });
        setIsModalOpen(true);
    };

    // Open edit modal
    const handleOpenEdit = (discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            name: discount.name,
            description: discount.description || '',
            type: discount.type,
            value: discount.value,
            minOrderValue: discount.minOrderValue,
            maxDiscountValue: discount.maxDiscountValue,
            usageLimit: discount.usageLimit,
            usageLimitPerUser: discount.usageLimitPerUser,
            startDate: dayjs(discount.startDate),
            endDate: dayjs(discount.endDate),
            isActive: discount.isActive,
            appliesTo: discount.appliesTo,
        });
        setIsModalOpen(true);
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
            };

            if (editingDiscount) {
                await updateDiscount(editingDiscount._id, payload);
                message.success('Cập nhật mã giảm giá thành công!');
            } else {
                await createDiscount(payload);
                message.success('Tạo mã giảm giá thành công!');
            }

            setIsModalOpen(false);
            fetchDiscounts();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await deleteDiscount(id);
            message.success('Xóa mã giảm giá thành công!');
            fetchDiscounts();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Get status badge
    const getStatusBadge = (discount) => {
        const now = new Date();
        const endDate = new Date(discount.endDate);
        const startDate = new Date(discount.startDate);

        if (!discount.isActive) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Vô hiệu</span>
            );
        }
        if (now > endDate) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">Hết hạn</span>
            );
        }
        if (now < startDate) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                    Chưa bắt đầu
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                Đang hoạt động
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
                    <p className="text-gray-500 mt-1">Tạo và quản lý các mã khuyến mãi</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm mã giảm giá
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã hoặc tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="min-w-[150px]"
                        options={[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'active', label: 'Đang hoạt động' },
                            { value: 'inactive', label: 'Vô hiệu' },
                            { value: 'expired', label: 'Hết hạn' },
                        ]}
                    />

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2.5 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803d] transition-colors"
                    >
                        Tìm kiếm
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={fetchDiscounts}
                        className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Mã</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Tên</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Loại</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Giá trị</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Đã dùng</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Thời hạn</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full mx-auto"></div>
                                    </td>
                                </tr>
                            ) : discounts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        Chưa có mã giảm giá nào
                                    </td>
                                </tr>
                            ) : (
                                discounts.map((discount) => (
                                    <tr key={discount._id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-[#16A34A]" />
                                                <span className="font-mono font-bold text-[#16A34A]">
                                                    {discount.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-gray-900">{discount.name}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {discount.type === 'percentage' ? (
                                                <span className="flex items-center gap-1 text-purple-600">
                                                    <Percent className="w-4 h-4" />
                                                    Phần trăm
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-blue-600">
                                                    <DollarSign className="w-4 h-4" />
                                                    Cố định
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-gray-900">
                                                {discount.type === 'percentage'
                                                    ? `${discount.value}%`
                                                    : `${formatPrice(discount.value)}đ`}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-gray-600">
                                                {discount.usedCount}/{discount.usageLimit || '∞'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm text-gray-600">
                                                <div>{formatDate(discount.startDate)}</div>
                                                <div className="text-gray-400">→ {formatDate(discount.endDate)}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">{getStatusBadge(discount)}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(discount)}
                                                    className="p-2 text-gray-500 hover:text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <Popconfirm
                                                    title="Xóa mã giảm giá"
                                                    description="Bạn có chắc muốn xóa mã này?"
                                                    onConfirm={() => handleDelete(discount._id)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {(pagination.page - 1) * pagination.limit + 1} -{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editingDiscount ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
            >
                <div className="space-y-4 py-4">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã giảm giá <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="VD: SALE50"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Giảm 50% đầu tháng"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                        />
                    </div>

                    {/* Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                            <Select
                                value={formData.type}
                                onChange={(value) => setFormData({ ...formData, type: value })}
                                className="w-full"
                                options={[
                                    { value: 'percentage', label: '% Phần trăm' },
                                    { value: 'fixed', label: '₫ Số tiền cố định' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá trị {formData.type === 'percentage' ? '(%)' : '(VND)'}
                            </label>
                            <input
                                type="number"
                                value={formData.value === 0 ? '' : formData.value}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, value: v === '' ? 0 : parseFloat(v) || 0 });
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '') setFormData({ ...formData, value: 0 });
                                }}
                                min={0}
                                max={formData.type === 'percentage' ? 100 : undefined}
                                placeholder={formData.type === 'percentage' ? 'VD: 10' : 'VD: 50000'}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            />
                        </div>
                    </div>

                    {/* Min/Max */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VND)</label>
                            <input
                                type="number"
                                value={formData.minOrderValue === 0 ? '' : formData.minOrderValue}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, minOrderValue: v === '' ? 0 : parseFloat(v) || 0 });
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '') setFormData({ ...formData, minOrderValue: 0 });
                                }}
                                min={0}
                                placeholder="VD: 100000"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            />
                        </div>
                        {formData.type === 'percentage' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giảm tối đa (VND)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxDiscountValue ?? ''}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFormData({ ...formData, maxDiscountValue: v === '' ? null : parseFloat(v) || null });
                                    }}
                                    min={0}
                                    placeholder="Không giới hạn"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Usage limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng lượt dùng</label>
                            <input
                                type="number"
                                value={formData.usageLimit ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, usageLimit: v === '' ? null : parseInt(v) || null });
                                }}
                                min={1}
                                placeholder="Không giới hạn"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lượt/người dùng</label>
                            <input
                                type="number"
                                value={formData.usageLimitPerUser}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData({ ...formData, usageLimitPerUser: v === '' ? 1 : parseInt(v) || 1 });
                                }}
                                min={1}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                            />
                        </div>
                    </div>

                    {/* Date range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian áp dụng <span className="text-red-500">*</span>
                        </label>
                        <RangePicker
                            value={[formData.startDate, formData.endDate]}
                            onChange={(dates) =>
                                setFormData({
                                    ...formData,
                                    startDate: dates?.[0] || null,
                                    endDate: dates?.[1] || null,
                                })
                            }
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            className="w-full"
                        />
                    </div>

                    {/* Active switch */}
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                        <Switch
                            checked={formData.isActive}
                            onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                    </div>

                    {/* Submit buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] disabled:opacity-50"
                        >
                            {submitting ? 'Đang lưu...' : editingDiscount ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default DiscountManagement;
