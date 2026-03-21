// ── Roles ─────────────────────────────────────────────────────
const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  USER: 'user',
};

// ── Booking Status ────────────────────────────────────────────
const BOOKING_STATUS = {
  PENDING: 'pending',       // Chờ xác nhận
  CONFIRMED: 'confirmed',   // Đã xác nhận
  CANCELLED: 'cancelled',   // Đã hủy
  COMPLETED: 'completed',   // Hoàn thành
};

// ── Payment Status ────────────────────────────────────────────
const PAYMENT_STATUS = {
  UNPAID: 'unpaid',         // Chưa thanh toán
  PAID: 'paid',             // Đã thanh toán
  REFUNDED: 'refunded',     // Đã hoàn tiền
};

// ── Pitch Status ──────────────────────────────────────────────
const PITCH_STATUS = {
  ACTIVE: 'active',         // Đang hoạt động
  INACTIVE: 'inactive',     // Tạm dừng
  MAINTENANCE: 'maintenance', // Bảo trì
};

// ── Pitch Types ───────────────────────────────────────────────
const PITCH_TYPES = {
  FIVE: '5-a-side',         // Sân 5 người
  SEVEN: '7-a-side',        // Sân 7 người
  ELEVEN: '11-a-side',      // Sân 11 người
};

// ── Pagination defaults ───────────────────────────────────────
const PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PITCH_STATUS,
  PITCH_TYPES,
  PAGINATION,
};
