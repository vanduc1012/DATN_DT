import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    ClipboardList,
    Users,
    Settings,
    LogOut,
    DollarSign,
    Tag,
    FileText,
    Bell,
} from 'lucide-react';
import { requestLogout } from '../../config/UserRequest';
import { message } from 'antd';

function Sidebar() {
    const location = useLocation();

    const menuItems = [
        {
            name: 'Thống kê',
            path: '/admin',
            icon: LayoutDashboard,
            disabled: false,
        },
        {
            name: 'Quản lý sân bóng',
            path: '/admin/fields',
            icon: MapPin,
            disabled: false,
        },
        {
            name: 'Cấu hình giá giờ',
            path: '/admin/field-prices',
            icon: DollarSign,
            disabled: false,
        },
        {
            name: 'Quản lý đơn đặt',
            path: '/admin/bookings',
            icon: ClipboardList,
            disabled: false,
        },
        {
            name: 'Quản lý mã giảm giá',
            path: '/admin/discounts',
            icon: Tag,
            disabled: false,
        },
        {
            name: 'Quản lý người dùng',
            path: '/admin/users',
            icon: Users,
            disabled: false,
        },
        {
            name: 'Quản lý bài viết',
            path: '/admin/blogs',
            icon: FileText,
            disabled: false,
        },
        {
            name: 'Quản lý thông báo',
            path: '/admin/notifications',
            icon: Bell,
            disabled: false,
        },
    ];

    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            navigate('/');
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-gray-200 flex flex-col z-40">
            {/* Logo */}
            <div className="h-[72px] px-6 flex items-center border-b border-gray-100">
                <Link to="/admin" className="flex items-center gap-2.5">
                    <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                        <rect
                            x="2"
                            y="6"
                            width="36"
                            height="28"
                            rx="3"
                            stroke="#16A34A"
                            strokeWidth="2.5"
                            fill="none"
                        />
                        <line x1="20" y1="6" x2="20" y2="34" stroke="#16A34A" strokeWidth="2" />
                        <circle cx="20" cy="20" r="5" stroke="#16A34A" strokeWidth="2" fill="none" />
                        <rect x="2" y="13" width="6" height="14" stroke="#16A34A" strokeWidth="1.5" fill="none" />
                        <rect x="32" y="13" width="6" height="14" stroke="#16A34A" strokeWidth="1.5" fill="none" />
                    </svg>
                    <div>
                        <span className="text-lg font-bold text-[#16A34A]">SânBóng</span>
                        <span className="text-lg font-bold text-gray-800">Pro</span>
                        <span className="block text-[10px] text-gray-400 -mt-1">Admin Panel</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    if (item.disabled) {
                        return (
                            <div
                                key={item.path}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed"
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                ${
                                    active
                                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-[#16A34A]' : ''}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
