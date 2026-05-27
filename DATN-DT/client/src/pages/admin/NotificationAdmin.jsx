import { useState } from 'react';
import { Button, Input, Form, Card, Radio, message, Spin } from 'antd';
import { SendOutlined, BellOutlined, GiftOutlined } from '@ant-design/icons';
import { apiClient } from '../../config/axiosClient';

const { TextArea } = Input;

function NotificationAdmin() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [notificationType, setNotificationType] = useState('promotion');

    const handleSendNotification = async (values) => {
        setLoading(true);
        try {
            const endpoint =
                notificationType === 'promotion'
                    ? '/api/notifications/admin/promotion'
                    : '/api/notifications/admin/system';

            const res = await apiClient.post(endpoint, {
                title: values.title,
                message: values.message,
            });

            message.success(res.data.message || 'Gửi thông báo thành công!');
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Gửi thông báo thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thông báo</h1>
                <p className="text-gray-500 mt-1">Gửi thông báo đến tất cả người dùng</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Send Notification Form */}
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <BellOutlined className="text-[#16A34A]" />
                            <span>Gửi thông báo mới</span>
                        </div>
                    }
                    className="shadow-sm"
                >
                    <Form form={form} layout="vertical" onFinish={handleSendNotification}>
                        <Form.Item label="Loại thông báo" className="mb-4">
                            <Radio.Group
                                value={notificationType}
                                onChange={(e) => setNotificationType(e.target.value)}
                                className="flex gap-4"
                            >
                                <Radio.Button value="promotion" className="flex items-center gap-2">
                                    <GiftOutlined /> Khuyến mãi
                                </Radio.Button>
                                <Radio.Button value="system" className="flex items-center gap-2">
                                    <BellOutlined /> Hệ thống
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label="Tiêu đề"
                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                        >
                            <Input
                                placeholder={
                                    notificationType === 'promotion'
                                        ? 'VD: Giảm 50% tất cả sân cuối tuần!'
                                        : 'VD: Thông báo bảo trì hệ thống'
                                }
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="message"
                            label="Nội dung"
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder={
                                    notificationType === 'promotion'
                                        ? 'Mô tả chi tiết chương trình khuyến mãi...'
                                        : 'Nội dung thông báo hệ thống...'
                                }
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SendOutlined />}
                                className="bg-[#16A34A] hover:bg-[#15803d] border-none"
                                size="large"
                            >
                                Gửi thông báo đến tất cả
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                {/* Info Card */}
                <Card title="Hướng dẫn" className="shadow-sm h-fit">
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-700 flex items-center gap-2">
                                <GiftOutlined /> Thông báo khuyến mãi
                            </h4>
                            <p className="text-green-600 text-sm mt-1">
                                Dùng để gửi các chương trình ưu đãi, giảm giá, sự kiện đặc biệt.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                <BellOutlined /> Thông báo hệ thống
                            </h4>
                            <p className="text-blue-600 text-sm mt-1">
                                Dùng để thông báo bảo trì, cập nhật tính năng, thông tin quan trọng.
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-700">📌 Lưu ý</h4>
                            <ul className="text-gray-600 text-sm mt-1 list-disc list-inside space-y-1">
                                <li>
                                    Thông báo sẽ được gửi đến <strong>tất cả</strong> người dùng
                                </li>
                                <li>Người dùng online sẽ nhận thông báo ngay lập tức (real-time)</li>
                                <li>Người dùng offline sẽ thấy thông báo khi đăng nhập</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default NotificationAdmin;
