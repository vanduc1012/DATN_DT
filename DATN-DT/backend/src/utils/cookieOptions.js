function isLocalClient() {
    const clientUrl = process.env.URL_CLIENT || '';
    return /localhost|127\.0\.0\.1/i.test(clientUrl);
}

function getCookieOptions({ httpOnly = true, maxAge }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const crossOrigin = isProduction && isLocalClient();

    return {
        httpOnly,
        secure: crossOrigin || isProduction,
        sameSite: crossOrigin ? 'None' : isProduction ? 'Strict' : 'Lax',
        maxAge,
    };
}

module.exports = { getCookieOptions, isLocalClient };
