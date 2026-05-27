import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestGetAllBlog } from '../config/BlogRequest';
import { Calendar, Search } from 'lucide-react';
import Header from '../components/Header';

function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await requestGetAllBlog();
                if (res && res.metadata) {
                    setBlogs(res.metadata);
                }
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Filter blogs based on search term
    const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-[#16A34A] py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                    <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">Tin tức & Sự kiện</h1>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto">
                        Khám phá những thông tin mới nhất, các giải đấu và ưu đãi hấp dẫn
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]
                                 transition-all duration-200"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
                    </div>
                ) : (
                    <>
                        {filteredBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredBlogs.map((blog) => (
                                    <Link
                                        key={blog._id}
                                        to={`/blog/${blog._id}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                            <img
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        'https://via.placeholder.com/800x500?text=Blog+Image';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 text-xs font-medium text-[#16A34A] mb-3">
                                                <span className="bg-green-50 px-2.5 py-1 rounded-full">Tin tức</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                                                {blog.title}
                                            </h3>
                                            <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-1">
                                                {blog.content.replace(/<[^>]+>/g, '')}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-lg">Không tìm thấy bài viết nào phù hợp.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default BlogPage;
