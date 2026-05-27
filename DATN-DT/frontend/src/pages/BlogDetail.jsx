import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestGetBlogById } from '../config/BlogRequest';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            try {
                // Since the requestGetBlogById function uses params object internally (see BlogRequest.jsx)
                // We should verify if it constructs URL properly or if we need to call with params wrapper
                // Looking at BlogRequest.jsx: requestGetBlogById = async (id) => ... params: { id }
                // So calling with just id is correct.

                const res = await requestGetBlogById(id);
                setBlog(res.metadata);
            } catch (error) {
                console.error('Failed to fetch blog detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bài viết</h2>
                    <Link to="/blogs" className="text-[#16A34A] hover:underline mt-4 inline-block">
                        Quay lại danh sách bài viết
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-['Inter',sans-serif]">
            <Header />

            <article className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
                {/* Breadcrumb / Back */}
                <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-[#16A34A] mb-8 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại tin tức
                </Link>

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" />
                            {new Date(blog.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl/tight font-extrabold text-gray-900 mb-6">{blog.title}</h1>
                </header>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden shadow-lg mb-12 aspect-[21/9]">
                    <img
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/1200x600?text=Blog+Image';
                        }}
                    />
                </div>

                {/* Content */}
                <div
                    className="prose prose-lg prose-green max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-[#16A34A]"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                ></div>

                {/* Author / Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-500 italic">Cảm ơn bạn đã đọc bài viết này!</p>
                </div>
            </article>
            <Footer />
        </div>
    );
}

export default BlogDetail;
