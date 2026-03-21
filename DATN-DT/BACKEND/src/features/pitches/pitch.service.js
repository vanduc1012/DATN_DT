const Pitch = require('./pitch.model');
const { PAGINATION } = require('../../utils/constants');

/**
 * Lấy danh sách sân có filter và phân trang
 */
const getAllPitches = async (query = {}) => {
  const {
    page = PAGINATION.PAGE,
    limit = PAGINATION.LIMIT,
    type,
    status,
    minPrice,
    maxPrice,
    city,
    district,
    search,
  } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (district) filter.district = { $regex: district, $options: 'i' };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.pricePerHour = {};
    if (minPrice !== undefined) filter.pricePerHour.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.pricePerHour.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const [pitches, total] = await Promise.all([
    Pitch.find(filter)
      .populate('owner', 'name email phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Pitch.countDocuments(filter),
  ]);

  return {
    pitches,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết sân theo ID
 */
const getPitchById = async (id) => {
  const pitch = await Pitch.findById(id).populate('owner', 'name email phone');
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }
  return pitch;
};

/**
 * Lấy danh sách sân của owner
 */
const getMyPitches = async (ownerId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [pitches, total] = await Promise.all([
    Pitch.find({ owner: ownerId }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Pitch.countDocuments({ owner: ownerId }),
  ]);

  return {
    pitches,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Tạo sân mới (owner)
 */
const createPitch = async (data, ownerId) => {
  const pitch = await Pitch.create({ ...data, owner: ownerId });
  return Pitch.findById(pitch._id).populate('owner', 'name email phone');
};

/**
 * Cập nhật sân (owner chỉ được sửa sân của mình; admin sửa bất kỳ)
 */
const updatePitch = async (id, data, userId, userRole) => {
  const pitch = await Pitch.findById(id);
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && pitch.owner.toString() !== userId) {
    const err = new Error('Bạn không có quyền chỉnh sửa sân này.');
    err.statusCode = 403;
    throw err;
  }

  Object.assign(pitch, data);
  await pitch.save();
  return Pitch.findById(pitch._id).populate('owner', 'name email phone');
};

/**
 * Xóa sân
 */
const deletePitch = async (id, userId, userRole) => {
  const pitch = await Pitch.findById(id);
  if (!pitch) {
    const err = new Error('Không tìm thấy sân bóng.');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && pitch.owner.toString() !== userId) {
    const err = new Error('Bạn không có quyền xóa sân này.');
    err.statusCode = 403;
    throw err;
  }

  await pitch.deleteOne();
};

module.exports = { getAllPitches, getPitchById, getMyPitches, createPitch, updatePitch, deletePitch };
