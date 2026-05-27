import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import cookies from 'js-cookie';

// Loading spinner
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Đang kiểm tra quyền truy cập...</p>
            </div>
        </div>
    );
}

/**
 * AdminRoute: Chỉ admin (isAdmin === true) mới được vào.
 * Người dùng thường → redirect về "/"
 * Chưa đăng nhập → redirect về "/login"
 */
export function AdminRoute({ children }) {
    const { dataUser } = useStore();
    const [checking, setChecking] = useState(true);
    const location = useLocation();

    const isLoggedIn = !!cookies.get('logged');

    useEffect(() => {
        // Chờ Provider fetch xong (dataUser khác rỗng hoặc không có cookie logged)
        if (!isLoggedIn) {
            setChecking(false);
            return;
        }
        if (dataUser && Object.keys(dataUser).length > 0) {
            setChecking(false);
        }
        // Timeout fallback nếu fetch auth quá lâu
        const timer = setTimeout(() => setChecking(false), 2000);
        return () => clearTimeout(timer);
    }, [dataUser, isLoggedIn]);

    if (checking) return <LoadingScreen />;

    // Chưa đăng nhập
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập nhưng không phải admin
    if (!dataUser?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

/**
 * UserRoute: Chỉ người dùng đã đăng nhập và KHÔNG phải admin mới được vào.
 * Admin → redirect về "/admin"
 * Chưa đăng nhập → redirect về "/login"
 */
export function UserRoute({ children }) {
    const { dataUser } = useStore();
    const [checking, setChecking] = useState(true);
    const location = useLocation();

    const isLoggedIn = !!cookies.get('logged');

    useEffect(() => {
        if (!isLoggedIn) {
            setChecking(false);
            return;
        }
        if (dataUser && Object.keys(dataUser).length > 0) {
            setChecking(false);
        }
        const timer = setTimeout(() => setChecking(false), 2000);
        return () => clearTimeout(timer);
    }, [dataUser, isLoggedIn]);

    if (checking) return <LoadingScreen />;

    // Chưa đăng nhập
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin không được vào trang user riêng tư
    if (dataUser?.isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

/**
 * GuestRoute: Chỉ khách (chưa đăng nhập) mới được vào (login, register, forgot-password).
 * Đã đăng nhập → redirect theo role
 */
export function GuestRoute({ children }) {
    const { dataUser } = useStore();
    const [checking, setChecking] = useState(true);

    const isLoggedIn = !!cookies.get('logged');

    useEffect(() => {
        if (!isLoggedIn) {
            setChecking(false);
            return;
        }
        if (dataUser && Object.keys(dataUser).length > 0) {
            setChecking(false);
        }
        const timer = setTimeout(() => setChecking(false), 2000);
        return () => clearTimeout(timer);
    }, [dataUser, isLoggedIn]);

    if (checking && isLoggedIn) return <LoadingScreen />;

    if (isLoggedIn) {
        // Redirect theo role
        if (dataUser?.isAdmin) {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}
