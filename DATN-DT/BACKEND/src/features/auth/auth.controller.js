const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    return success(res, { user, accessToken, refreshToken }, 'Đăng ký thành công', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    return success(res, { user, accessToken, refreshToken }, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const tokens = await authService.refreshToken(token);
    return success(res, tokens, 'Làm mới token thành công');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return success(res, null, 'Đăng xuất thành công');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const User = require('../users/user.model');
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);
    return success(res, user, 'Lấy thông tin cá nhân thành công');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    // Trong production: không trả token, chỉ báo "email đã được gửi"
    const data = process.env.NODE_ENV === 'development' ? { resetToken } : null;
    return success(res, data, 'Nếu email tồn tại, mã OTP đã được gửi (kiểm tra console trong dev mode)');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    await authService.resetPassword(email, token, newPassword);
    return success(res, null, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, changePassword, getMe, forgotPassword, resetPassword };

