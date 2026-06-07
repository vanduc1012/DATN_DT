const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const modelUser = require('../models/users.model');
const { isSuperAdmin } = require('../config/superAdmin');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const clearAuthCookies = (res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.clearCookie('logged');
};

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Vui lòng đăng nhập');

        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (_jwtErr) {
            clearAuthCookies(res);
            throw new AuthFailureError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }

        const findUser = await modelUser.findById(decoded.id);
        if (!findUser) {
            clearAuthCookies(res);
            throw new AuthFailureError('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');

        // Bọc verifyToken riêng → JWT error phải thành AuthFailureError (401)
        // để axios interceptor phía client có thể refresh token và retry
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (_jwtErr) {
            throw new AuthFailureError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }

        const { id } = decoded;
        const findUser = await modelUser.findOne({ _id: id });

        if (!findUser || (!findUser.isAdmin && !isSuperAdmin(findUser))) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }

        if (isSuperAdmin(findUser) && !findUser.isAdmin) {
            findUser.isAdmin = true;
            await findUser.save();
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
};
