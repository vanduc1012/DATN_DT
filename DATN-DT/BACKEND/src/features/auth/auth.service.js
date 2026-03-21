const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const jwtConfig = require('../../config/jwt');
const logger = require('../../utils/logger');

/**
 * Tạo access token (15 phút)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

/**
 * Tạo refresh token (7 ngày)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
};

/**
 * Tạo cặp token và lưu refreshToken vào DB
 */
const issueTokens = async (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Lưu refresh token vào DB
  await User.findByIdAndUpdate(user._id, { refreshToken });

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────

/**
 * Đăng ký tài khoản
 */
const register = async ({ name, email, password, phone, role }) => {
  // Kiểm tra email đã tồn tại
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email này đã được sử dụng.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, phone, role: role || 'user' });
  logger.info(`Người dùng mới đăng ký: ${email}`);

  const tokens = await issueTokens(user);
  return { user, ...tokens };
};

/**
 * Đăng nhập
 */
const login = async ({ email, password }) => {
  // Lấy user kèm password (vì select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Tài khoản của bạn đã bị vô hiệu hóa.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.statusCode = 401;
    throw err;
  }

  logger.info(`Đăng nhập thành công: ${email}`);
  const tokens = await issueTokens(user);
  return { user, ...tokens };
};

/**
 * Làm mới access token bằng refresh token
 */
const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.refreshSecret);
  } catch {
    const err = new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    const err = new Error('Refresh token không khớp. Vui lòng đăng nhập lại.');
    err.statusCode = 401;
    throw err;
  }

  const tokens = await issueTokens(user);
  return tokens;
};

/**
 * Đăng xuất — xóa refresh token trong DB
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Đổi mật khẩu
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Mật khẩu hiện tại không đúng.');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();
};

/**
 * Quên mật khẩu — tạo reset token (6 chữ số OTP)
 * Trong thực tế sẽ gửi email; ở đây log ra console để test
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Trả về success kể cả không tìm thấy (tránh user enumeration)
    return;
  }

  // Tạo OTP 6 chữ số
  const crypto = require('crypto');
  const resetToken = crypto.randomInt(100000, 999999).toString();
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
  await user.save({ validateBeforeSave: false });

  // TODO: gửi email ở đây
  logger.info(`[DEV] Reset OTP cho ${email}: ${resetToken}`);

  return resetToken; // Trả về để test, production thì không trả
};

/**
 * Reset mật khẩu bằng OTP token
 */
const resetPassword = async (email, token, newPassword) => {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ email })
    .select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    const err = new Error('Email không tồn tại.');
    err.statusCode = 404;
    throw err;
  }

  if (!user.resetPasswordToken || user.resetPasswordToken !== hashedToken) {
    const err = new Error('Mã OTP không hợp lệ.');
    err.statusCode = 400;
    throw err;
  }

  if (user.resetPasswordExpires < new Date()) {
    const err = new Error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  logger.info(`Reset mật khẩu thành công: ${email}`);
};

module.exports = { register, login, refreshToken, logout, changePassword, forgotPassword, resetPassword };

