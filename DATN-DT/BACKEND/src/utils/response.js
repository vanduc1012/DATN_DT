/**
 * Hàm trả về response thành công chuẩn
 * @param {object} res - Express response object
 * @param {*} data - Dữ liệu trả về
 * @param {string} message - Thông báo
 * @param {number} statusCode - HTTP status code
 */
const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Hàm trả về response lỗi chuẩn
 * @param {object} res - Express response object
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Chi tiết lỗi (validation errors, etc.)
 */
const error = (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Trả về response có phân trang
 */
const paginated = (res, data, pagination, message = 'Thành công') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { success, error, paginated };
