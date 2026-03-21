const express = require('express');
const router = express.Router();
const pitchController = require('./pitch.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { createPitchSchema, updatePitchSchema, pitchQuerySchema } = require('./pitch.validator');
const { upload } = require('../../middlewares/upload.middleware');

// GET  /api/pitches  (public)
router.get('/', validate(pitchQuerySchema, 'query'), pitchController.getAllPitches);
// GET  /api/pitches/my (owner/admin)
router.get('/my', authenticate, authorize('owner', 'admin'), pitchController.getMyPitches);
// GET  /api/pitches/:id (public)
router.get('/:id', pitchController.getPitchById);
// POST /api/pitches (owner, admin)
router.post('/', authenticate, authorize('owner', 'admin'), validate(createPitchSchema), pitchController.createPitch);
// PUT  /api/pitches/:id
router.put('/:id', authenticate, authorize('owner', 'admin'), validate(updatePitchSchema), pitchController.updatePitch);
// DELETE /api/pitches/:id
router.delete('/:id', authenticate, authorize('owner', 'admin'), pitchController.deletePitch);

// POST /api/pitches/:id/images — upload ảnh (tối đa 5)
router.post('/:id/images', authenticate, authorize('owner', 'admin'), upload.array('images', 5), async (req, res, next) => {
  try {
    const Pitch = require('./pitch.model');
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ success: false, message: 'Không tìm thấy sân.' });

    const newUrls = (req.files || []).map((f) => `/uploads/pitches/${f.filename}`);
    const updatedImages = [...(pitch.images || []), ...newUrls].slice(0, 10); // giới hạn 10 ảnh

    pitch.images = updatedImages;
    await pitch.save();

    return res.json({ success: true, data: pitch, message: 'Upload ảnh thành công!' });
  } catch (err) { next(err); }
});

// DELETE /api/pitches/:id/images — xóa ảnh theo URL
router.delete('/:id/images', authenticate, authorize('owner', 'admin'), async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const Pitch = require('./pitch.model');
    const pitch = await Pitch.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: imageUrl } },
      { new: true }
    );
    if (!pitch) return res.status(404).json({ success: false, message: 'Không tìm thấy sân.' });
    // Xóa file vật lý nếu là local upload
    if (imageUrl?.startsWith('/uploads/')) {
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', '..', '..', imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.json({ success: true, data: pitch, message: 'Đã xóa ảnh!' });
  } catch (err) { next(err); }
});

module.exports = router;

