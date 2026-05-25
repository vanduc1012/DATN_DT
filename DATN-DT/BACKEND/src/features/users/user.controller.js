const userService = require('./user.service');
const { success, paginated } = require('../../utils/response');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return success(res, user, 'Lấy thông tin cá nhân thành công');
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return success(res, user, 'Cập nhật thông tin thành công');
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { users, pagination: pg } = await userService.getAllUsers(req.query);
    return paginated(res, users, pg, 'Lấy danh sách người dùng thành công');
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, user, 'Lấy thông tin người dùng thành công');
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id, req.user);
    const msg = user.isActive ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công';
    return success(res, user, msg);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    return success(res, null, 'Xóa người dùng thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, getAllUsers, getUserById, toggleUserStatus, deleteUser };
