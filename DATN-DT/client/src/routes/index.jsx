import App from '../App';
import LoginUser from '../pages/LoginUser';
import RegisterUser from '../pages/RegisterUser';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import FieldManagement from '../pages/admin/FieldManagement';
import FieldPriceManagement from '../pages/admin/FieldPriceManagement';
import BookingManagement from '../pages/admin/BookingManagement';
import DiscountManagement from '../pages/admin/DiscountManagement';
import UserManagement from '../pages/admin/UserManagement';
import DetailField from '../pages/DetailField';
import FieldList from '../pages/FieldList';
import Checkout from '../pages/Checkout';
import BookingSuccess from '../pages/BookingSuccess';
import Profile from '../pages/Profile';
import BlogPage from '../pages/BlogPage';
import BlogDetail from '../pages/BlogDetail';
import BlogAdmin from '../pages/admin/BlogAdmin';
import NotificationAdmin from '../pages/admin/NotificationAdmin';
import NotificationsPage from '../pages/NotificationsPage';
import ForgotPassword from '../pages/ForgotPassword';
import { AdminRoute, UserRoute, GuestRoute } from '../components/RouteGuard';

export const routes = [
    // ─── Public routes (tất cả đều xem được) ───
    { path: '/', element: <App /> },
    { path: '/fields', element: <FieldList /> },
    { path: '/san/:id', element: <DetailField /> },
    { path: '/blogs', element: <BlogPage /> },
    { path: '/blog/:id', element: <BlogDetail /> },

    // ─── Guest-only routes (chỉ khi CHƯA đăng nhập) ───
    {
        path: '/login',
        element: (
            <GuestRoute>
                <LoginUser />
            </GuestRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <GuestRoute>
                <RegisterUser />
            </GuestRoute>
        ),
    },
    {
        path: '/forgot-password',
        element: (
            <GuestRoute>
                <ForgotPassword />
            </GuestRoute>
        ),
    },

    // ─── User-only routes (đã đăng nhập, KHÔNG phải admin) ───
    {
        path: '/checkout',
        element: (
            <UserRoute>
                <Checkout />
            </UserRoute>
        ),
    },
    {
        path: '/booking-success/:id',
        element: (
            <UserRoute>
                <BookingSuccess />
            </UserRoute>
        ),
    },
    {
        path: '/profile',
        element: (
            <UserRoute>
                <Profile />
            </UserRoute>
        ),
    },
    {
        path: '/notifications',
        element: (
            <UserRoute>
                <NotificationsPage />
            </UserRoute>
        ),
    },

    // ─── Admin-only routes (isAdmin === true) ───
    {
        path: '/admin',
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'fields', element: <FieldManagement /> },
            { path: 'field-prices', element: <FieldPriceManagement /> },
            { path: 'bookings', element: <BookingManagement /> },
            { path: 'discounts', element: <DiscountManagement /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'blogs', element: <BlogAdmin /> },
            { path: 'notifications', element: <NotificationAdmin /> },
        ],
    },
];
