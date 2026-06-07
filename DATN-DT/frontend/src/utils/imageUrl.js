const BLOG_FALLBACK =
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';

const FIELD_FALLBACK =
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80';

export const getBlogImageUrl = (image) => {
    if (!image) return BLOG_FALLBACK;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;

    const base = import.meta.env.VITE_URL_IMAGE || 'http://localhost:3000';
    return `${base}/uploads/blogs/${image}`;
};

export const getBlogImageFallback = () => BLOG_FALLBACK;

export const getFieldImageUrl = (image) => {
    if (!image) return FIELD_FALLBACK;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;

    const base = import.meta.env.VITE_URL_IMAGE || 'http://localhost:3000';
    return `${base}/uploads/fields/${image}`;
};

export const getFieldImageFallback = () => FIELD_FALLBACK;
