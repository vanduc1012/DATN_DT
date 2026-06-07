const Field = require('../models/field.model');
const FieldPrice = require('../models/fieldPrice.model');
const Booking = require('../models/booking.model');
const Discount = require('../models/discount.model');
const User = require('../models/users.model');

const IMAGE_BASE_URL = process.env.URL_IMAGE || 'http://localhost:3000';
const OPEN_HOURS = '06:00 - 22:00';

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
}

function parseDateInput(text) {
    const q = text.toLowerCase().trim();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (q.includes('hôm nay') || q.includes('hom nay')) return new Date(today);
    if (q.includes('ngày mai') || q.includes('ngay mai') || q === 'mai') {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return d;
    }

    const match = q.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]) - 1;
        const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : today.getFullYear();
        const d = new Date(year, month, day);
        if (!Number.isNaN(d.getTime())) return d;
    }

    return null;
}

function extractFieldType(text) {
    if (/\b11\b|11 người|11 nguoi/.test(text)) return '11';
    if (/\b7\b|7 người|7 nguoi/.test(text)) return '7';
    if (/\b5\b|5 người|5 nguoi/.test(text)) return '5';
    return null;
}

function extractTimeRange(text) {
    const match = text.match(/(\d{1,2})[:h](\d{0,2})?\s*[-–đến]\s*(\d{1,2})[:h]?(\d{0,2})?/i);
    if (!match) return null;

    const startH = match[1].padStart(2, '0');
    const startM = (match[2] || '00').padStart(2, '0');
    const endH = match[3].padStart(2, '0');
    const endM = (match[4] || '00').padStart(2, '0');
    return { startTime: `${startH}:${startM}`, endTime: `${endH}:${endM}` };
}

function extractPhone(text) {
    const match = text.match(/(?:0|\+84)\d{9,10}/);
    return match ? match[0].replace('+84', '0') : null;
}

function extractBookingCode(text) {
    const uuid = text.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    return uuid ? uuid[0] : null;
}

async function getBookedSlots(fieldId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Booking.find({
        fieldId,
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled'] },
    })
        .select('startTime endTime')
        .lean();
}

function isSlotBooked(bookedSlots, startTime, endTime) {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    return bookedSlots.some((slot) => {
        const existStart = timeToMinutes(slot.startTime);
        const existEnd = timeToMinutes(slot.endTime);
        return newStart < existEnd && existStart < newEnd;
    });
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

async function getActiveFields({ type, area, limit = 10 } = {}) {
    const query = { status: 'active' };
    if (type) query.type = type;

    let fields = await Field.find(query).limit(limit * 2).lean();
    if (area) {
        const keyword = normalizeText(area);
        fields = fields.filter((f) => normalizeText(f.address).includes(keyword));
    }
    return fields.slice(0, limit);
}

async function getPriceForSlot(fieldId, date, startTime, endTime) {
    const dayOfWeek = new Date(date).getDay();
    return FieldPrice.findOne({ fieldId, dayOfWeek, startTime, endTime }).lean();
}

async function getAvailableSlotsForField(field, date, limit = 5) {
    const dayOfWeek = new Date(date).getDay();
    const priceRules = await FieldPrice.find({ fieldId: field._id, dayOfWeek }).sort({ startTime: 1 }).lean();
    const bookedSlots = await getBookedSlots(field._id, date);

    const available = [];
    for (const rule of priceRules) {
        if (!isSlotBooked(bookedSlots, rule.startTime, rule.endTime)) {
            available.push({
                fieldId: field._id,
                fieldName: field.name,
                fieldType: field.type,
                address: field.address,
                startTime: rule.startTime,
                endTime: rule.endTime,
                price: rule.price,
            });
        }
        if (available.length >= limit) break;
    }
    return available;
}

async function getAvailabilitySummary({ date = new Date(), type, area, limit = 5 }) {
    const fields = await getActiveFields({ type, area, limit: 8 });
    const results = [];

    for (const field of fields) {
        const slots = await getAvailableSlotsForField(field, date, limit);
        const allRules = await FieldPrice.countDocuments({ fieldId: field._id });
        const bookedCount = (await getBookedSlots(field._id, date)).length;

        results.push({
            field,
            slots,
            isFull: slots.length === 0 && bookedCount > 0,
            hasRules: allRules > 0,
        });
    }

    return results;
}

async function suggestFields({ type, maxPrice, area, limit = 3 }) {
    const fields = await getActiveFields({ type, area, limit: 10 });
    const suggestions = [];

    for (const field of fields) {
        const prices = await FieldPrice.find({ fieldId: field._id }).sort({ price: 1 }).limit(1).lean();
        const minPrice = prices[0]?.price || null;
        if (maxPrice && minPrice && minPrice > maxPrice) continue;

        suggestions.push({
            name: field.name,
            type: field.type,
            address: field.address || 'Liên hệ',
            rating: field.rating || 0,
            minPrice,
            image: field.images?.[0]?.startsWith('http')
                ? field.images[0]
                : field.images?.[0]
                  ? `${IMAGE_BASE_URL}/uploads/fields/${field.images[0]}`
                  : null,
        });
        if (suggestions.length >= limit) break;
    }

    return suggestions;
}

async function getPriceTable({ type, fieldName } = {}) {
    const fieldQuery = { status: 'active' };
    if (type) fieldQuery.type = type;
    if (fieldName) fieldQuery.name = new RegExp(fieldName, 'i');

    const fields = await Field.find(fieldQuery).limit(3).lean();
    const lines = [];

    for (const field of fields) {
        const prices = await FieldPrice.find({ fieldId: field._id })
            .sort({ dayOfWeek: 1, startTime: 1 })
            .limit(6)
            .lean();
        lines.push({
            fieldName: field.name,
            type: field.type,
            slots: prices.map((p) => ({
                day: p.dayOfWeek,
                time: `${p.startTime}-${p.endTime}`,
                price: p.price,
            })),
        });
    }
    return lines;
}

async function getActiveDiscounts() {
    const now = new Date();
    return Discount.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    })
        .limit(5)
        .lean();
}

async function getNearestAvailableSlots({ type, area, daysAhead = 7, limit = 5 } = {}) {
    const results = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= daysAhead; i += 1) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const summary = await getAvailabilitySummary({ date, type, area, limit: 3 });

        for (const item of summary) {
            for (const slot of item.slots) {
                results.push({ ...slot, date });
                if (results.length >= limit) return results;
            }
        }
    }
    return results;
}

async function getPriceByTimeSlot({ type, area, date, startTime, endTime }) {
    const fields = await getActiveFields({ type, area, limit: 5 });
    const targetDate = date || new Date();
    const lines = [];

    for (const field of fields) {
        const dayOfWeek = new Date(targetDate).getDay();
        const query = { fieldId: field._id, dayOfWeek };
        if (startTime) query.startTime = startTime;
        if (endTime) query.endTime = endTime;

        const prices = await FieldPrice.find(query).sort({ startTime: 1 }).limit(3).lean();
        for (const p of prices) {
            const booked = await getBookedSlots(field._id, targetDate);
            const available = !isSlotBooked(booked, p.startTime, p.endTime);
            lines.push({
                fieldName: field.name,
                type: field.type,
                address: field.address,
                time: `${p.startTime}-${p.endTime}`,
                price: p.price,
                available,
                date: targetDate,
            });
        }
    }
    return lines;
}

async function lookupBookings({ userId, phone, bookingCode }) {
    let userFilter = null;

    if (phone) {
        const user = await User.findOne({ phone: extractPhone(phone) || phone }).lean();
        if (user) userFilter = user._id;
    }

    const query = { status: { $nin: ['cancelled'] } };
    if (bookingCode) query.bookingId = bookingCode;
    if (userFilter) query.userId = userFilter;
    if (!bookingCode && !userFilter && userId) query.userId = userId;

    const bookings = await Booking.find(query)
        .sort({ bookingDate: -1 })
        .limit(5)
        .populate('fieldId', 'name address type')
        .lean();

    return bookings;
}

const PAYMENT_FAQ = `💳 THANH TOÁN:
• Tiền mặt tại sân
• MoMo / VNPay online
• Đặt cọc: không bắt buộc với thanh toán tiền mặt
• Hoàn tiền: hủy trước 24h được hoàn 100%`;

const FIELD_INFO_FAQ = `🏟️ THÔNG TIN SÂN:
• Giờ mở cửa: ${OPEN_HOURS}
• Tiện ích: đèn LED, phòng thay đồ, bãi xe, nước uống
• Hotline: 1900 1234`;

module.exports = {
    OPEN_HOURS,
    PAYMENT_FAQ,
    FIELD_INFO_FAQ,
    parseDateInput,
    extractFieldType,
    extractTimeRange,
    extractPhone,
    extractBookingCode,
    getActiveFields,
    getPriceForSlot,
    getAvailableSlotsForField,
    getAvailabilitySummary,
    suggestFields,
    getPriceTable,
    getActiveDiscounts,
    lookupBookings,
    getNearestAvailableSlots,
    getPriceByTimeSlot,
    normalizeText,
    isSlotBooked,
    getBookedSlots,
};
