import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { message, Modal, Popconfirm, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { getAllFields } from '../../config/FieldRequest';
import { getFieldPrices, createFieldPrice, updateFieldPrice, deleteFieldPrice } from '../../config/FieldPriceRequest';

function FieldPriceManagement() {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [formData, setFormData] = useState({
        dayOfWeek: 1,
        startTime: '06:00',
        endTime: '08:00',
        price: 200000,
    });
    const [submitting, setSubmitting] = useState(false);
    // Dùng string riêng cho ô nhập giá để tránh lỗi parseInt khi gõ dở
    const [priceInput, setPriceInput] = useState('200000');

    // Day of week labels
    const dayLabels = {
        0: 'Chủ nhật',
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
    };

    // Fetch fields
    const fetchFields = async () => {
        try {
            const response = await getAllFields({ limit: 100 });
            setFields(response.metadata.fields);
        } catch (error) {
            message.error('Không thể tải danh sách sân');
        }
    };

    // Fetch prices for selected field
    const fetchPrices = async () => {
        if (!selectedField) return;
        setLoading(true);
        try {
            const response = await getFieldPrices(selectedField._id);
            setPrices(response.metadata);
        } catch (error) {
            message.error('Không thể tải bảng giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    useEffect(() => {
        if (selectedField) {
            fetchPrices();
        }
    }, [selectedField]);

    // Filter fields by search
    const filteredFields = fields.filter(
        (field) =>
            field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (field.address && field.address.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    // Select field
    const handleSelectField = (field) => {
        setSelectedField(field);
    };

    // Back to field list
    const handleBackToList = () => {
        setSelectedField(null);
        setPrices([]);
    };

    // Open modal for create
    const handleOpenCreate = () => {
        setEditingPrice(null);
        setFormData({
            dayOfWeek: 1,
            startTime: '06:00',
            endTime: '08:00',
            price: 200000,
        });
        setPriceInput('200000');
        setIsModalOpen(true);
    };

    // Open modal for edit
    const handleOpenEdit = (priceItem) => {
        setEditingPrice(priceItem);
        setFormData({
            dayOfWeek: priceItem.dayOfWeek,
            startTime: priceItem.startTime,
            endTime: priceItem.endTime,
            price: priceItem.price,
        });
        setPriceInput(String(priceItem.price));
        setIsModalOpen(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Parse giá từ priceInput khi submit
        const parsedPrice = parseInt(priceInput.replace(/\D/g, ''), 10) || 0;
        const finalFormData = { ...formData, price: parsedPrice };

        if (finalFormData.startTime >= finalFormData.endTime) {
            message.error('Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        if (parsedPrice <= 0) {
            message.error('Giá phải lớn hơn 0');
            return;
        }

        setSubmitting(true);
        try {
            if (editingPrice) {
                await updateFieldPrice(editingPrice._id, finalFormData);
                message.success('Cập nhật giá thành công');
            } else {
                await createFieldPrice({
                    ...finalFormData,
                    fieldId: selectedField._id,
                });
                message.success('Thêm giá thành công');
            }
            setIsModalOpen(false);
            fetchPrices();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete price
    const handleDelete = async (id) => {
        try {
            await deleteFieldPrice(id);
            message.success('Xóa giá thành công');
            fetchPrices();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xóa');
        }
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Group prices by day
    const groupedPrices = prices.reduce((acc, price) => {
        const day = price.dayOfWeek;
        if (!acc[day]) acc[day] = [];
        acc[day].push(price);
        return acc;
    }, {});

    // Field selection view
    if (!selectedField) {
        return (
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cấu hình giá giờ</h1>
                    <p className="text-gray-500 mt-1">Chọn sân bóng để cấu hình bảng giá theo khung giờ</p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                     transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Field Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFields.map((field) => (
                        <div
                            key={field._id}
                            onClick={() => handleSelectField(field)}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#16A34A] hover:shadow-md cursor-pointer transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={field.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'}
                                    alt={field.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-[#16A34A] transition-colors">
                                        {field.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {field.address || 'Chưa có địa chỉ'}
                                    </p>
                                    <span className="inline-flex mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        Sân {field.type} người
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFields.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Không tìm thấy sân bóng nào</div>
                )}
            </div>
        );
    }

    // Price management view
    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Bảng giá: {selectedField.name}</h1>
                        <p className="text-gray-500 mt-1">Cấu hình giá theo khung giờ và ngày trong tuần</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold rounded-lg
                             shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)]
                             transition-all duration-200 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Thêm giá mới
                </button>
            </div>

            {/* Price Table by Day */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải...</div>
                ) : prices.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có bảng giá nào</p>
                        <button
                            onClick={handleOpenCreate}
                            className="mt-4 px-4 py-2 text-[#16A34A] hover:bg-green-50 rounded-lg transition-colors"
                        >
                            + Thêm giá đầu tiên
                        </button>
                    </div>
                ) : (
                    Object.entries(dayLabels).map(([day, label]) => {
                        const dayPrices = groupedPrices[day] || [];
                        if (dayPrices.length === 0) return null;

                        return (
                            <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#16A34A] to-[#22c55e] px-6 py-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-semibold">{label}</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {dayPrices.map((priceItem) => (
                                        <div
                                            key={priceItem._id}
                                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {priceItem.startTime} - {priceItem.endTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-[#16A34A]" />
                                                    <span className="font-bold text-[#16A34A] text-lg">
                                                        {formatPrice(priceItem.price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(priceItem)}
                                                    className="p-2 text-gray-400 hover:text-[#16A34A] hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <Popconfirm
                                                    title="Xác nhận xóa"
                                                    description="Bạn có chắc muốn xóa giá này?"
                                                    onConfirm={() => handleDelete(priceItem._id)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                title={editingPrice ? 'Chỉnh sửa giá' : 'Thêm giá mới'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
            >
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Day of Week */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày trong tuần <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.dayOfWeek}
                            onChange={(value) => setFormData((prev) => ({ ...prev, dayOfWeek: value }))}
                            options={Object.entries(dayLabels).map(([value, label]) => ({
                                value: parseInt(value),
                                label,
                            }))}
                            className="w-full"
                            size="large"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <TimePicker
                                value={dayjs(formData.startTime, 'HH:mm')}
                                onChange={(time) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        startTime: time ? time.format('HH:mm') : '06:00',
                                    }))
                                }
                                format="HH:mm"
                                minuteStep={30}
                                className="w-full"
                                size="large"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ kết thúc <span className="text-red-500">*</span>
                            </label>
                            <TimePicker
                                value={dayjs(formData.endTime, 'HH:mm')}
                                onChange={(time) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        endTime: time ? time.format('HH:mm') : '08:00',
                                    }))
                                }
                                format="HH:mm"
                                minuteStep={30}
                                className="w-full"
                                size="large"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá tiền (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#16A34A]/20 focus-within:border-[#16A34A] transition-all">
                            {/* Nút giảm */}
                            <button
                                type="button"
                                onClick={() => {
                                    const current = parseInt(priceInput.replace(/\D/g, ''), 10) || 0;
                                    const next = Math.max(0, current - 10000);
                                    setPriceInput(String(next));
                                }}
                                className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-bold text-lg select-none transition-colors border-r border-gray-200"
                            >
                                −
                            </button>

                            {/* Input nhập tay */}
                            <input
                                type="text"
                                inputMode="numeric"
                                value={priceInput}
                                onChange={(e) => {
                                    // Chỉ cho phép nhập số
                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                    setPriceInput(raw);
                                }}
                                onBlur={() => {
                                    // Khi blur, chuẩn hoá: bỏ leading zero
                                    const num = parseInt(priceInput, 10) || 0;
                                    setPriceInput(String(num));
                                }}
                                placeholder="200000"
                                className="flex-1 px-4 py-2.5 text-center text-gray-800 font-medium focus:outline-none bg-white"
                                required
                            />

                            {/* Nút tăng */}
                            <button
                                type="button"
                                onClick={() => {
                                    const current = parseInt(priceInput.replace(/\D/g, ''), 10) || 0;
                                    const next = current + 10000;
                                    setPriceInput(String(next));
                                }}
                                className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-bold text-lg select-none transition-colors border-l border-gray-200"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Hiển thị:{' '}
                            <span className="font-medium text-[#16A34A]">
                                {formatPrice(parseInt(priceInput.replace(/\D/g, ''), 10) || 0)}
                            </span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Đang xử lý...' : editingPrice ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default FieldPriceManagement;
