const Joi = require('joi');
const { BOOKING_STATUS } = require('../../utils/constants');

const createBookingSchema = Joi.object({
  pitch: Joi.string().hex().length(24).required().messages({
    'any.required': 'Sân bóng là bắt buộc',
    'string.length': 'ID sân không hợp lệ',
  }),
  date: Joi.date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)))
    .required().messages({
      'any.required': 'Ngày đặt sân là bắt buộc',
      'date.min': 'Ngày đặt sân không thể trong quá khứ',
    }),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'any.required': 'Giờ bắt đầu là bắt buộc',
    'string.pattern.base': 'Giờ bắt đầu không đúng định dạng HH:mm',
  }),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'any.required': 'Giờ kết thúc là bắt buộc',
    'string.pattern.base': 'Giờ kết thúc không đúng định dạng HH:mm',
  }),
  note: Joi.string().max(500).optional(),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(BOOKING_STATUS))
    .required()
    .messages({
      'any.required': 'Trạng thái là bắt buộc',
      'any.only': `Trạng thái phải là: ${Object.values(BOOKING_STATUS).join(', ')}`,
    }),
  cancelReason: Joi.string().max(500).when('status', {
    is: 'cancelled',
    then: Joi.optional(),
  }),
});

module.exports = { createBookingSchema, updateBookingStatusSchema };
