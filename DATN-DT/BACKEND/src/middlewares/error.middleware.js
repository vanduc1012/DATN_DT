const logger = require('../utils/logger');

/**
 * Global Error Handler — phải đặt cuối cùng trong app.js
 * Express nhận biết error handler qua 4 tham số (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, url: req.originalUrl });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi server nội bộ';
  let errors = null;

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError (sai ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID không hợp lệ: ${err.value}`;
  }

  // MongoDB Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Giá trị '${value}' của trường '${field}' đã tồn tại.`;
  }

  // JWT Errors (nếu không được bắt ở middleware)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn.';
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;

  // Ở development, hiển thị thêm stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
