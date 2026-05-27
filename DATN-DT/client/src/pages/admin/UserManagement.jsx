import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Space, Avatar } from 'antd';
import { UserPlus, Edit2, Trash2, Search, Users, Shield, Mail, Phone } from 'lucide-react';
import { getAllUsers, updateUserAdmin, deleteUserAdmin } from '../../config/AdminUserRequest';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(response.metadata || []);
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle edit
    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            fullName: record.fullName,
            email: record.email,
            phone: record.phone || '',
            address: record.address || '',
            // Dùng string để Ant Design Select so sánh đúng
            isAdmin: record.isAdmin ? 'true' : 'false',
        });
        setIsModalOpen(true);
    };

    // Handle update
    const handleUpdate = async (values) => {
        try {
            // Convert isAdmin từ string về boolean trước gửi API
            const payload = {
                ...values,
                isAdmin: values.isAdmin === 'true',
            };
            await updateUserAdmin(editingUser._id, payload);
            message.success('Cập nhật thành công!');
            setIsModalOpen(false);
            setEditingUser(null);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Handle delete
    const handleDelete = async (userId) => {
        try {
            await deleteUserAdmin(userId);
            message.success('Xóa người dùng thành công!');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xóa người dùng');
        }
    };

    // Filter users by search — reset page khi search thay đổi
    const filteredUsers = users.filter(
        (user) =>
            user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.phone?.includes(searchText),
    );

    // Table columns
    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar size={40} src={record.avatar} style={{ backgroundColor: '#16A34A' }}>
                        {record.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                        <p className="font-medium text-gray-900">{record.fullName}</p>
                        <p className="text-sm text-gray-500">{record.email}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || <span className="text-gray-400">Chưa cập nhật</span>,
        },
        {
            title: 'Loại tài khoản',
            dataIndex: 'typeLogin',
            key: 'typeLogin',
            render: (type) => (
                <Tag color={type === 'google' ? 'blue' : 'green'}>{type === 'google' ? 'Google' : 'Email'}</Tag>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin) => (
                <Tag color={isAdmin ? 'gold' : 'default'} icon={isAdmin ? <Shield size={12} /> : null}>
                    {isAdmin ? 'Admin' : 'Người dùng'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Edit2 size={16} />}
                        onClick={() => handleEdit(record)}
                        className="text-blue-500 hover:text-blue-700"
                    />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" icon={<Trash2 size={16} />} className="text-red-500 hover:text-red-700" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Stats
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.isAdmin).length;
    const googleUsers = users.filter((u) => u.typeLogin === 'google').length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-7 h-7 text-[#16A34A]" />
                    Quản lý người dùng
                </h1>
                <p className="text-gray-500 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                        <p className="text-sm text-gray-500">Tổng người dùng</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                        <p className="text-sm text-gray-500">Quản trị viên</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{googleUsers}</p>
                        <p className="text-sm text-gray-500">Đăng ký Google</p>
                    </div>
                </div>
            </div>

            {/* Search & Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1); // reset về trang 1 khi search
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80
                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                        />
                    </div>
                    <Button onClick={fetchUsers} className="flex items-center gap-2">
                        Làm mới
                    </Button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: 10,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                        onChange: (page) => setCurrentPage(page),
                        position: ['bottomCenter'],
                    }}
                />
            </div>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa người dùng"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input prefix={<Users size={16} className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input prefix={<Mail size={16} className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại">
                        <Input prefix={<Phone size={16} className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>

                    <Form.Item name="isAdmin" label="Vai trò">
                        <Select>
                            <Select.Option value="false">Người dùng</Select.Option>
                            <Select.Option value="true">Quản trị viên</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-[#16A34A]">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default UserManagement;
