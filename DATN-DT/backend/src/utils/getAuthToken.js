function getAccessToken(req) {
    if (req.cookies?.token) return req.cookies.token;

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }

    return null;
}

function getRefreshToken(req) {
    if (req.cookies?.refreshToken) return req.cookies.refreshToken;

    const headerToken = req.headers['x-refresh-token'];
    if (headerToken) return headerToken;

    if (req.body?.refreshToken) return req.body.refreshToken;

    return null;
}

module.exports = { getAccessToken, getRefreshToken };
