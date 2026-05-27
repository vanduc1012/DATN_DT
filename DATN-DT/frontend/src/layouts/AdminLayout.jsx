import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';

function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-[260px]">
                {/* Header */}
                <AdminHeader />

                {/* Page Content */}
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
