const User = require('./user.model');
const { PAGINATION } = require('../../utils/constants');

/**
 * Lấy danh sách tất cả user (admin)
 */
const getAllUsers = async (query = {}) => {
  const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT, role, search } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy thông tin user theo ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Cập nhật thông tin profile của chính mình
 */
const updateProfile = async (userId, data) => {
  const allowed = ['name', 'phone', 'avatar'];
  const updates = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) updates[field] = data[field];
  });

  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Admin: vô hiệu hóa / kích hoạt tài khoản
 */
const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Admin: xóa user
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, toggleUserStatus, deleteUser };
