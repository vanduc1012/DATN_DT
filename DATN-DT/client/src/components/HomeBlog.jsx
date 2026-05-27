import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestGetAllBlog } from '../config/BlogRequest';
import { User, Calendar, ArrowRight } from 'lucide-react';

function HomeBlog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await requestGetAllBlog();
                if (res && res.metadata) {
                    setBlogs(res.metadata.slice(0, 3)); // Get latest 3 blogs
                }
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (!loading && blogs.length === 0) return null;

    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Tin tức & Sự kiện</h2>
                        <p className="mt-2 text-gray-500">Cập nhật những thông tin mới nhất từ chúng tôi</p>
                    </div>
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 text-[#16A34A] font-semibold hover:gap-3 transition-all duration-200"
                    >
                        Xem tất cả
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Blog Grid */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <Link
                                key={blog._id}
                                to={`/blog/${blog._id}`}
                                className="group flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/800x450?text=Blog+Image';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1 p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                                        {blog.title}
                                    </h3>

                                    {/* Excerpt - Strip HTML tags */}
                                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                                        {blog.content.replace(/<[^>]+>/g, '')}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default HomeBlog;
