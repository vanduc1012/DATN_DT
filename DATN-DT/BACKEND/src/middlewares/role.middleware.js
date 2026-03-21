const { error } = require('../utils/response');

/**
 * Middleware kiểm tra quyền (role-based access control)
 * Sử dụng sau middleware `authenticate`
 * @param {...string} roles - Các roles được phép truy cập
 * @example router.get('/admin', authenticate, authorize('admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Chưa xác thực. Vui lòng đăng nhập.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${roles.join(' hoặc ')}.`,
        403,
      );
    }

    next();
  };
};

module.exports = { authorize };
