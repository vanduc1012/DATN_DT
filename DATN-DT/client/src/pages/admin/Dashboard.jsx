import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import {
    DollarSign,
    CalendarCheck,
    MapPin,
    Users,
    TrendingUp,
    TrendingDown,
    Download,
    ChevronDown,
    Eye,
} from 'lucide-react';
import { Select, Table, Tag, Button, DatePicker } from 'antd';
import { getFullDashboard } from '../../config/DashboardRequest';

const { RangePicker } = DatePicker;

// ================== STAT CARD COMPONENT ==================
function StatCard({ title, value, change, changeType, icon: Icon, iconBg }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        changeType === 'increase' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}
                >
                    {changeType === 'increase' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {change}
                </div>
            </div>
            <div className="mt-5">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1.5">{title}</p>
            </div>
        </div>
    );
}

// ================== REVENUE CHART COMPONENT ==================
function RevenueChart({ data }) {
    const formatCurrency = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Doanh thu theo ngày</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Biểu đồ doanh thu 7 ngày gần nhất</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#16A34A]"></div>
                    <span className="text-sm text-gray-600">Doanh thu (VNĐ)</span>
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + 'đ', 'Doanh thu']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#16A34A"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ================== FIELD TYPE PIE CHART ==================
function FieldTypePieChart({ data }) {
    const COLORS = ['#16A34A', '#3B82F6', '#F59E0B'];

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Phân bố loại sân</h3>
            <p className="text-sm text-gray-500 mb-4">Tỷ lệ sân 5/7/11 người</p>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ================== BOOKINGS BY FIELD BAR CHART ==================
function BookingsByFieldChart({ data }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lượt đặt theo sân</h3>
            <p className="text-sm text-gray-500 mb-4">Top 5 sân được đặt nhiều nhất</p>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#374151', fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value) => [value + ' lượt', 'Đặt sân']}
                        />
                        <Bar dataKey="bookings" fill="#16A34A" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ================== RECENT BOOKINGS TABLE ==================
function RecentBookingsTable({ bookings }) {
    const statusConfig = {
        pending: { label: 'Chờ xác nhận', color: 'gold' },
        confirmed: { label: 'Đã xác nhận', color: 'blue' },
        completed: { label: 'Hoàn thành', color: 'green' },
        cancelled: { label: 'Đã hủy', color: 'red' },
        paid: { label: 'Đã thanh toán', color: 'cyan' },
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'bookingId',
            key: 'bookingId',
            render: (id) => <span className="font-mono text-sm text-gray-600">#{id?.slice(-8)?.toUpperCase()}</span>,
        },
        {
            title: 'Sân',
            dataIndex: 'fieldId',
            key: 'field',
            render: (field) => <span className="font-medium text-gray-900">{field?.name || 'N/A'}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'userId',
            key: 'customer',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#DCFCE7] rounded-full flex items-center justify-center text-[#16A34A] font-semibold text-sm">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700">{user?.fullName || 'N/A'}</span>
                </div>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'bookingDate',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Giờ',
            key: 'time',
            render: (_, record) => (
                <span className="text-gray-600">
                    {record.startTime} - {record.endTime}
                </span>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span className="font-semibold text-[#16A34A]">{new Intl.NumberFormat('vi-VN').format(price)}đ</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusConfig[status]?.color || 'default'}>{statusConfig[status]?.label || status}</Tag>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 pb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Đơn đặt gần đây</h3>
                    <p className="text-sm text-gray-500 mt-0.5">10 đơn đặt mới nhất</p>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={bookings}
                rowKey={(record) => record._id || record.bookingId}
                pagination={false}
                size="middle"
            />
        </div>
    );
}

// ================== MAIN DASHBOARD ==================
function Dashboard() {
    const [timeRange, setTimeRange] = useState('7days');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        revenueChange: 0,
        totalBookings: 0,
        bookingsChange: 0,
        activeFields: 0,
        newUsers: 0,
        usersChange: 0,
    });
    const [revenueData, setRevenueData] = useState([]);
    const [fieldTypeData, setFieldTypeData] = useState([]);
    const [bookingsByField, setBookingsByField] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await getFullDashboard(timeRange);
            const data = response.metadata;

            // Set stats from API
            setStats(data.stats);

            // Set chart data
            setRevenueData(data.revenueChart || []);
            setFieldTypeData(data.fieldTypes || []);
            setBookingsByField(data.topFields || []);
            setRecentBookings(data.recentBookings || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value;
    };

    const timeOptions = [
        { value: 'today', label: 'Hôm nay' },
        { value: '7days', label: '7 ngày qua' },
        { value: '30days', label: '30 ngày qua' },
        { value: 'custom', label: 'Tùy chỉnh' },
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê tổng quan</h1>
                    <p className="text-gray-500 mt-1">Theo dõi hiệu suất kinh doanh của hệ thống</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        options={timeOptions}
                        className="w-40"
                        suffixIcon={<ChevronDown className="w-4 h-4 text-gray-400" />}
                    />
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.totalRevenue) + 'đ'}
                    change={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`}
                    changeType={stats.revenueChange >= 0 ? 'increase' : 'decrease'}
                    icon={DollarSign}
                    iconBg="bg-gradient-to-br from-green-400 to-green-600"
                />
                <StatCard
                    title="Tổng lượt đặt sân"
                    value={stats.totalBookings?.toLocaleString() || 0}
                    change={`${stats.bookingsChange >= 0 ? '+' : ''}${stats.bookingsChange}%`}
                    changeType={stats.bookingsChange >= 0 ? 'increase' : 'decrease'}
                    icon={CalendarCheck}
                    iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
                />
                <StatCard
                    title="Sân đang hoạt động"
                    value={`${stats.activeFields}/${stats.totalFields || 0}`}
                    change={`${stats.activeFields} active`}
                    changeType="increase"
                    icon={MapPin}
                    iconBg="bg-gradient-to-br from-purple-400 to-purple-600"
                />
                <StatCard
                    title="Người dùng mới"
                    value={stats.newUsers}
                    change={`${stats.usersChange >= 0 ? '+' : ''}${stats.usersChange}%`}
                    changeType={stats.usersChange >= 0 ? 'increase' : 'decrease'}
                    icon={Users}
                    iconBg="bg-gradient-to-br from-orange-400 to-orange-600"
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FieldTypePieChart data={fieldTypeData} />
                <BookingsByFieldChart data={bookingsByField} />
            </div>

            {/* Recent Bookings */}
            <RecentBookingsTable bookings={recentBookings} />
        </div>
    );
}

export default Dashboard;
