const pitchService = require('./pitch.service');
const { success, paginated } = require('../../utils/response');

const getAllPitches = async (req, res, next) => {
  try {
    const { pitches, pagination: pg } = await pitchService.getAllPitches(req.query);
    return paginated(res, pitches, pg, 'Lấy danh sách sân thành công');
  } catch (err) {
    next(err);
  }
};

const getPitchById = async (req, res, next) => {
  try {
    const pitch = await pitchService.getPitchById(req.params.id);
    return success(res, pitch, 'Lấy thông tin sân thành công');
  } catch (err) {
    next(err);
  }
};

const getMyPitches = async (req, res, next) => {
  try {
    const { pitches, pagination: pg } = await pitchService.getMyPitches(req.user.id, req.query);
    return paginated(res, pitches, pg, 'Lấy danh sách sân của bạn thành công');
  } catch (err) {
    next(err);
  }
};

const createPitch = async (req, res, next) => {
  try {
    const pitch = await pitchService.createPitch(req.body, req.user.id);
    return success(res, pitch, 'Tạo sân thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updatePitch = async (req, res, next) => {
  try {
    const pitch = await pitchService.updatePitch(req.params.id, req.body, req.user.id, req.user.role);
    return success(res, pitch, 'Cập nhật sân thành công');
  } catch (err) {
    next(err);
  }
};

const deletePitch = async (req, res, next) => {
  try {
    await pitchService.deletePitch(req.params.id, req.user.id, req.user.role);
    return success(res, null, 'Xóa sân thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPitches, getPitchById, getMyPitches, createPitch, updatePitch, deletePitch };
