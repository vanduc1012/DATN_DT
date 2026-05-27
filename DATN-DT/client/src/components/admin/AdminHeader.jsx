import { User } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

function AdminHeader() {
    const { dataUser } = useStore();

    return (
        <header className="h-[72px] bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Left - placeholder for spacing */}
            <div className="w-[400px]" />

            {/* Right - chỉ hiển thị thông tin admin, không có tương tác */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#16A34A] to-[#22c55e] flex items-center justify-center overflow-hidden">
                    {dataUser?.avatar ? (
                        <img src={dataUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">{dataUser?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;
