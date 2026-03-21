const Joi = require('joi');
const { PITCH_TYPES, PITCH_STATUS } = require('../../utils/constants');

const createPitchSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Tên sân là bắt buộc',
  }),
  description: Joi.string().max(2000).optional(),
  address: Joi.string().required().messages({
    'any.required': 'Địa chỉ là bắt buộc',
  }),
  district: Joi.string().optional(),
  city: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(PITCH_TYPES)).required().messages({
    'any.only': `Loại sân phải là: ${Object.values(PITCH_TYPES).join(', ')}`,
    'any.required': 'Loại sân là bắt buộc',
  }),
  pricePerHour: Joi.number().min(0).required().messages({
    'any.required': 'Giá thuê sân là bắt buộc',
    'number.min': 'Giá không thể âm',
  }),
  images: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  openTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().messages({
    'string.pattern.base': 'Giờ mở cửa không đúng định dạng HH:mm',
  }),
  closeTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().messages({
    'string.pattern.base': 'Giờ đóng cửa không đúng định dạng HH:mm',
  }),
});

const updatePitchSchema = createPitchSchema.fork(
  ['name', 'address', 'type', 'pricePerHour'],
  (field) => field.optional(),
).concat(
  Joi.object({
    status: Joi.string().valid(...Object.values(PITCH_STATUS)).optional(),
  }),
);

const pitchQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  type: Joi.string().valid(...Object.values(PITCH_TYPES)).optional(),
  status: Joi.string().valid(...Object.values(PITCH_STATUS)).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  city: Joi.string().optional(),
  district: Joi.string().optional(),
  search: Joi.string().optional(),
});

module.exports = { createPitchSchema, updatePitchSchema, pitchQuerySchema };
