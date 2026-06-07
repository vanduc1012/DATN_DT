import App from '../App';
import LoginUser from '../pages/LoginUser';
import RegisterUser from '../pages/RegisterUser';
import AdminLayout from '../layouts/AdminLayout';
import RootLayout from '../layouts/RootLayout';
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
import GuidePage from '../pages/GuidePage';
import FAQPage from '../pages/FAQPage';
import PrivacyPage from '../pages/PrivacyPage';
import { AdminRoute, UserRoute, GuestRoute } from '../components/RouteGuard';

export const routes = [
    {
        element: <RootLayout />,
        children: [
            { path: '/', element: <App /> },
            { path: '/fields', element: <FieldList /> },
            { path: '/san/:id', element: <DetailField /> },
            { path: '/blogs', element: <BlogPage /> },
            { path: '/blog/:id', element: <BlogDetail /> },
            { path: '/huong-dan', element: <GuidePage /> },
            { path: '/cau-hoi-thuong-gap', element: <FAQPage /> },
            { path: '/policy', element: <PrivacyPage /> },

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
        ],
    },
];
