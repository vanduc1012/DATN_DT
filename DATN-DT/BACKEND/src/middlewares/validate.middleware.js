const { error } = require('../utils/response');

/**
 * Middleware validate request body với Joi schema
 * @param {object} schema - Joi schema object
 * @param {string} target - 'body' | 'query' | 'params' (mặc định 'body')
 * @example router.post('/', validate(createSchema), controller)
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error: joiError, value } = schema.validate(req[target], {
      abortEarly: false,      // Trả về tất cả lỗi, không dừng ở lỗi đầu tiên
      stripUnknown: true,     // Bỏ các field không khai báo trong schema
      convert: true,
    });

    if (joiError) {
      const errors = joiError.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      return error(res, 'Dữ liệu đầu vào không hợp lệ', 400, errors);
    }

    // Gán lại giá trị đã được làm sạch
    req[target] = value;
    next();
  };
};

module.exports = { validate };
