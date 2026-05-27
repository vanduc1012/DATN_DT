import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, Users } from 'lucide-react';
import provinces from '../json/provinces.json';

function Banner() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [fieldType, setFieldType] = useState('');

    // Field types
    const fieldTypes = [
        { value: '', label: 'Tất cả loại sân' },
        { value: '5', label: 'Sân 5 người' },
        { value: '7', label: 'Sân 7 người' },
        { value: '11', label: 'Sân 11 người' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();

        // Build search params
        const params = new URLSearchParams();
        if (location) params.set('search', location);
        if (fieldType) params.set('type', fieldType);

        // Navigate to field list with params
        navigate(`/fields?${params.toString()}`);
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <section className="relative min-h-[600px] lg:min-h-[680px] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {/* Football field background - using gradient as placeholder */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070')] 
                               bg-cover bg-center bg-no-repeat"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e14]/95 via-[#0a2e14]/80 to-[#16A34A]/40" />
                {/* Pattern overlay for texture */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight">
                                Đặt sân bóng
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">
                                    nhanh chóng
                                </span>
                                <span className="text-white"> & </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#86efac]">
                                    dễ dàng
                                </span>
                            </h1>
                            <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                                Tìm sân, chọn giờ và thanh toán chỉ trong vài phút. Trải nghiệm đặt sân thông minh cùng
                                SânBóngPro.
                            </p>
                        </div>

                        {/* Search Card */}
                        <form
                            onSubmit={handleSearch}
                            className="bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[600px]"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Location - Provinces dropdown */}
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 px-1">
                                        Tỉnh/Thành phố
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                     appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            <option value="">Chọn tỉnh thành</option>
                                            {provinces.map((province) => (
                                                <option key={province.code} value={province.name}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Field Type */}
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 px-1">
                                        Loại sân
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            value={fieldType}
                                            onChange={(e) => setFieldType(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                     appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            {fieldTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 px-1">
                                        Ngày đặt
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={date}
                                            min={today}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700
                                                     focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                                     cursor-pointer transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-[#16A34A] hover:bg-[#15803d] 
                                         text-white text-base font-semibold rounded-xl
                                         shadow-[0_4px_20px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_24px_rgba(22,163,74,0.5)]
                                         transition-all duration-300 ease-out active:scale-[0.98]"
                            >
                                <Search className="w-5 h-5" />
                                Tìm sân ngay
                            </button>
                        </form>

                        {/* Stats */}
                        <div className="flex items-center gap-8 pt-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">500+</p>
                                <p className="text-sm text-white/60">Sân bóng</p>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">10K+</p>
                                <p className="text-sm text-white/60">Lượt đặt</p>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">63</p>
                                <p className="text-sm text-white/60">Tỉnh thành</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite 1.5s;
                }
            `}</style>
        </section>
    );
}

export default Banner;
