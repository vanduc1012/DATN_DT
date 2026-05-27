const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const modelUser = require('../models/users.model');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const authUser = async (req, res, next) => {
    try {
        const user = req.cookies.token;
        if (!user) throw new AuthFailureError('Vui lòng đăng nhập');
        const token = user;
        const decoded = await verifyToken(token);
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

        // Dùng !findUser.isAdmin thay vì === false để bắt cả undefined/null
        if (!findUser || !findUser.isAdmin) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
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
