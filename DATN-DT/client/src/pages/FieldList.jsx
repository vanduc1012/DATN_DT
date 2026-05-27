import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { getAllFields } from '../config/FieldRequest';
import {
    Search,
    MapPin,
    Star,
    Users,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import Footer from '../components/Footer';

function FieldList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Filter states
    const [searchText, setSearchText] = useState(searchParams.get('search') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
    const [showFilters, setShowFilters] = useState(false);

    const fieldTypes = [
        { value: '', label: 'Tất cả loại sân' },
        { value: '5', label: 'Sân 5 người' },
        { value: '7', label: 'Sân 7 người' },
        { value: '11', label: 'Sân 11 người' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'rating', label: 'Đánh giá cao' },
        { value: 'name', label: 'Tên A-Z' },
    ];

    // Fetch fields
    const fetchFields = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: searchParams.get('page') || 1,
                limit: 12,
                status: 'active',
            };

            if (searchText) params.search = searchText;
            if (selectedType) params.type = selectedType;

            const response = await getAllFields(params);
            let fetchedFields = response.metadata?.fields || response.metadata || [];

            // Client-side sorting (can be moved to backend)
            if (sortBy === 'rating') {
                fetchedFields.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (sortBy === 'name') {
                fetchedFields.sort((a, b) => a.name.localeCompare(b.name));
            }

            setFields(fetchedFields);
            setPagination(response.metadata?.pagination || { page: 1, totalPages: 1, total: fetchedFields.length });
        } catch (error) {
            console.error('Failed to fetch fields:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, searchText, selectedType, sortBy]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchText) params.set('search', searchText);
        if (selectedType) params.set('type', selectedType);
        params.set('sort', sortBy);
        params.set('page', '1');
        setSearchParams(params);
    };

    // Handle filter change
    const handleFilterChange = (type, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(type, value);
        } else {
            params.delete(type);
        }
        params.set('page', '1');
        setSearchParams(params);

        if (type === 'type') setSelectedType(value);
        if (type === 'sort') setSortBy(value);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchText('');
        setSelectedType('');
        setSortBy('newest');
        setSearchParams({});
    };

    // Pagination
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format price
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    const hasActiveFilters = searchText || selectedType || sortBy !== 'newest';

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#16A34A] to-[#15803d] py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Tìm Sân Bóng Hoàn Hảo</h1>
                    <p className="text-white/80 text-lg mb-8">
                        Khám phá hàng trăm sân bóng chất lượng cao trên khắp thành phố
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative flex bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên sân, địa chỉ..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-gray-900 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-4 bg-[#16A34A] text-white font-semibold hover:bg-[#15803d] transition-colors"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters Bar */}
                <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Field Type Filter */}
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                                             text-sm font-medium text-gray-700 cursor-pointer
                                             focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                                >
                                    {fieldTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                                             text-sm font-medium text-gray-700 cursor-pointer
                                             focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                                >
                                    {sortOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-gray-500">
                            Tìm thấy{' '}
                            <span className="font-semibold text-gray-900">{pagination.total || fields.length}</span> sân
                            bóng
                        </p>
                    </div>
                </div>

                {/* Fields Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : fields.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sân bóng</h3>
                        <p className="text-gray-500 mb-4">Thử thay đổi từ khóa hoặc bộ lọc khác</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2.5 bg-[#16A34A] text-white font-medium rounded-xl hover:bg-[#15803d] transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {fields.map((field) => (
                            <div
                                key={field._id}
                                onClick={() => navigate(`/san/${field._id}`)}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm
                                         hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={
                                            field.images?.[0]?.startsWith('http')
                                                ? field.images[0]
                                                : `http://localhost:3000/uploads/fields/${field.images?.[0]}`
                                        }
                                        alt={field.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src =
                                                'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800';
                                        }}
                                    />
                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                                            Sân {field.type} người
                                        </span>
                                    </div>
                                    {/* Rating Badge */}
                                    {field.rating > 0 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                {field.rating?.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-[#16A34A] transition-colors">
                                        {field.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="line-clamp-1">{field.address || 'Chưa cập nhật địa chỉ'}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span>{field.type} người</span>
                                        </div>
                                        {field.totalReviews > 0 && (
                                            <span className="text-xs text-gray-400">{field.totalReviews} đánh giá</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                    pagination.page === i + 1
                                        ? 'bg-[#16A34A] text-white'
                                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default FieldList;
