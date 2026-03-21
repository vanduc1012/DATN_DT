const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Tên phải có ít nhất 2 ký tự',
    'string.max': 'Tên không được vượt quá 100 ký tự',
    'any.required': 'Tên là bắt buộc',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 chữ số)',
  }),
  role: Joi.string().valid('user', 'owner').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token là bắt buộc',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Mật khẩu hiện tại là bắt buộc',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema };
