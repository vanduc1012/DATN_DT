const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require('./auth.validator');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh-token
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// POST /api/auth/logout  (cần authenticate)
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me (cần authenticate)
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/change-password (cần authenticate)
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// POST /api/auth/forgot-password (public — gửi OTP về email)
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password (public — dùng OTP để đặt lại mật khẩu)
router.post('/reset-password', authController.resetPassword);

module.exports = router;
