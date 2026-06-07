function normalizeOrigin(origin) {
    return origin?.replace(/\/$/, '');
}

function getAllowedOrigins() {
    const origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        normalizeOrigin(process.env.URL_CLIENT),
    ];

    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        origins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }

    return [...new Set(origins.filter(Boolean))];
}

function getCorsOptions() {
    const allowedOrigins = getAllowedOrigins();

    return {
        allowedOrigins,
        options: {
            origin(origin, callback) {
                if (!origin) return callback(null, true);
                const normalizedOrigin = normalizeOrigin(origin);
                if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
                console.log('Blocked by CORS:', normalizedOrigin);
                return callback(null, false);
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
    };
}

module.exports = { getAllowedOrigins, getCorsOptions, normalizeOrigin };
