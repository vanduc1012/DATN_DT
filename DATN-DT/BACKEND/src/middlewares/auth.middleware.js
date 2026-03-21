const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { error } = require('../utils/response');

/**
 * Middleware xác thực JWT từ Authorization header
 * Gán thông tin user vào req.user sau khi verify thành công
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Không tìm thấy token xác thực. Vui lòng đăng nhập.', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Token không hợp lệ.', 401);
    }
    next(err);
  }
};

module.exports = { authenticate };
