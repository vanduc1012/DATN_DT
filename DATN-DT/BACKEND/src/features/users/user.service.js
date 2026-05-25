const User = require('./user.model');
const { PAGINATION, SUPER_ADMIN_EMAIL } = require('../../utils/constants');

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
const toggleUserStatus = async (id, requestingUser) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }

  // Không được vô hiệu hóa tài khoản Super Admin (admin@gmail.com)
  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    const err = new Error('Không thể vô hiệu hóa tài khoản Super Admin.');
    err.statusCode = 403;
    throw err;
  }

  // Chỉ Super Admin mới được thay đổi trạng thái tài khoản admin khác
  if (user.role === 'admin') {
    const isRequestingSuperAdmin = requestingUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (!isRequestingSuperAdmin) {
      const err = new Error('Chỉ Super Admin (admin@gmail.com) mới có quyền khóa/mở khóa tài khoản quản trị viên khác.');
      err.statusCode = 403;
      throw err;
    }
  }

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Admin: xóa user
 * @param {string} id - ID của user cần xóa
 * @param {object} requestingUser - Thông tin admin đang thực hiện xóa (từ req.user)
 */
const deleteUser = async (id, requestingUser) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }

  // Không được xóa tài khoản Super Admin (admin@gmail.com)
  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    const err = new Error('Không thể xóa tài khoản Super Admin. Đây là tài khoản có quyền hạn cao nhất trong hệ thống.');
    err.statusCode = 403;
    throw err;
  }

  // Chỉ Super Admin mới được xóa tài khoản admin khác
  if (user.role === 'admin') {
    const isRequestingSuperAdmin = requestingUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (!isRequestingSuperAdmin) {
      const err = new Error('Chỉ Super Admin (admin@gmail.com) mới có quyền xóa tài khoản quản trị viên khác.');
      err.statusCode = 403;
      throw err;
    }
  }

  await user.deleteOne();
};

module.exports = { getAllUsers, getUserById, updateProfile, toggleUserStatus, deleteUser };
