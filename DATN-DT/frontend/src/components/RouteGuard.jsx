import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import cookies from 'js-cookie';

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

export function AdminRoute({ children }) {
    const { dataUser, authChecked } = useStore();
    const location = useLocation();

    const isLoggedIn = !!cookies.get('logged');

    if (!authChecked) return <LoadingScreen />;

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!dataUser?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export function UserRoute({ children }) {
    const { dataUser, authChecked } = useStore();
    const location = useLocation();

    const isLoggedIn = !!cookies.get('logged');

    if (!authChecked) return <LoadingScreen />;

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (dataUser?.isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

export function GuestRoute({ children }) {
    const { dataUser, authChecked } = useStore();

    const isLoggedIn = !!cookies.get('logged');

    if (!authChecked) return <LoadingScreen />;

    if (isLoggedIn) {
        if (dataUser?.isAdmin) {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}
