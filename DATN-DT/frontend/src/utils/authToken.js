const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function saveAuthTokens({ token, refreshToken }) {
    if (token) localStorage.setItem(ACCESS_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

export function clearAuthTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

export function hasAuthSession() {
    return Boolean(getAccessToken() || getRefreshToken());
}
