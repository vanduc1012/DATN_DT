const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

// ── Current user ──────────────────────────────────────────────
// GET  /api/users/me
router.get('/me', authenticate, userController.getMe);

// PUT  /api/users/me
router.put('/me', authenticate, userController.updateMe);

// ── Admin only ────────────────────────────────────────────────
// GET  /api/users
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

// GET  /api/users/:id
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);

// PATCH /api/users/:id/toggle-status
router.patch('/:id/toggle-status', authenticate, authorize('admin'), userController.toggleUserStatus);

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;
