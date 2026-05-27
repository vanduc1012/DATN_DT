const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Import models
const Field = require('../models/field.model');
const Booking = require('../models/booking.model');
const PriceRule = require('../models/fieldPrice.model');
const Discount = require('../models/discount.model');
const MessageChatbot = require('../models/messageChatbot.model');

const IMAGE_BASE_URL = process.env.URL_IMAGE || 'http://localhost:3000';

/**
 * Lấy khung giờ trống (giới hạn 3 sân, 5 slot mỗi sân)
 */
async function getAvailableSlots(date) {
    const fields = await Field.find({ status: 'active' }).limit(3).lean();
    const priceRules = await PriceRule.find().limit(20).lean();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await Booking.find({
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'paid', 'confirmed'] },
    })
        .select('fieldId startTime endTime')
        .lean();

    const dateStr = date.toLocaleDateString('vi-VN');
    let result = `📅 Khung giờ trống ${dateStr}:\n`;

    for (const field of fields) {
        const fieldRules = priceRules.filter((p) => p.fieldId?.toString() === field._id.toString()).slice(0, 5);

        const bookedTimes = bookedSlots
            .filter((b) => b.fieldId?.toString() === field._id.toString())
            .map((b) => `${b.startTime}-${b.endTime}`);

        const available = fieldRules.filter((r) => !bookedTimes.includes(`${r.startTime}-${r.endTime}`)).slice(0, 5);

        result += `⚽ ${field.name}: `;
        if (available.length > 0) {
            result += available.map((s) => `${s.startTime}-${s.endTime} (${s.price}đ)`).join(', ');
        } else {
            result += 'Hết chỗ';
        }
        result += '\n';
    }

    return result;
}

/**
 * Lấy thông tin sân ngắn gọn (tối đa 5 sân)
 */
async function getFieldsShort() {
    const fields = await Field.find({ status: 'active' }).limit(5).select('name type address rating images').lean();

    return fields.map((f) => ({
        name: f.name,
        type: f.type,
        address: f.address || 'Liên hệ',
        rating: f.rating || 0,
        image: f.images?.[0] ? `${IMAGE_BASE_URL}/uploads/fields/${f.images[0]}` : null,
    }));
}

/**
 * Lấy giá sân ngắn gọn
 */
async function getPricesShort() {
    const prices = await PriceRule.find().limit(10).populate('fieldId', 'name').lean();

    return prices
        .slice(0, 6)
        .map(
            (p) =>
                `${p.fieldId?.name || 'Sân'}: ${p.startTime}-${p.endTime} = ${p.price}đ${p.isPeakHour ? ' (cao điểm)' : ''}`,
        )
        .join('\n');
}

/**
 * Lấy khuyến mãi đang có
 */
async function getDiscountsShort() {
    const now = new Date();
    const discounts = await Discount.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    })
        .limit(3)
        .select('code name discountValue discountType')
        .lean();

    if (discounts.length === 0) return 'Không có';

    return discounts
        .map(
            (d) => `${d.code}: Giảm ${d.discountType === 'percentage' ? d.discountValue + '%' : d.discountValue + 'đ'}`,
        )
        .join(', ');
}

/**
 * AI tư vấn sân bóng - Tối ưu token
 */
async function askFieldAssistant(question, userId) {
    try {
        // Lấy 3 tin nhắn gần nhất
        const recentMsgs = await MessageChatbot.find({ userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('sender content')
            .lean();

        const history = recentMsgs
            .reverse()
            .map((m) => `${m.sender === 'user' ? 'Khách' : 'Bot'}: ${m.content.slice(0, 100)}`)
            .join('\n');

        // Phân tích intent để chỉ lấy dữ liệu cần thiết
        const q = question.toLowerCase();
        let contextData = '';

        // Hỏi về slot/lịch trống
        if (
            q.includes('trống') ||
            q.includes('lịch') ||
            q.includes('đặt') ||
            q.includes('hôm nay') ||
            q.includes('mai')
        ) {
            const targetDate = q.includes('mai') ? new Date(Date.now() + 86400000) : new Date();
            contextData += await getAvailableSlots(targetDate);
        }

        // Hỏi về giá
        if (q.includes('giá') || q.includes('bao nhiêu') || q.includes('tiền')) {
            contextData += '\n💰 Bảng giá:\n' + (await getPricesShort());
        }

        // Hỏi về sân
        if (q.includes('sân') || q.includes('loại') || q.includes('có gì')) {
            const fields = await getFieldsShort();
            contextData +=
                '\n🏟️ Các sân:\n' +
                fields.map((f) => `• ${f.name} (${f.type} người) - ${f.address} ⭐${f.rating}`).join('\n');
        }

        // Hỏi về khuyến mãi
        if (q.includes('giảm') || q.includes('khuyến') || q.includes('mã')) {
            contextData += '\n🎁 Khuyến mãi: ' + (await getDiscountsShort());
        }

        // Nếu không match intent nào, cung cấp thông tin cơ bản
        if (!contextData) {
            const fields = await getFieldsShort();
            contextData = `🏟️ Sân: ${fields.map((f) => f.name).join(', ')}\n`;
            contextData += `⏰ Giờ: 6:00-22:00\n📞 Hotline: 1900 1234`;
        }

        // Prompt ngắn gọn
        const prompt = `Bạn là SânBóngBot, tư vấn đặt sân bóng đá.

DỮ LIỆU:
${contextData}

LỊCH SỬ: ${history || 'Mới'}

KHÁCH HỎI: "${question}"

Trả lời ngắn gọn, thân thiện, dùng emoji. Nếu khách muốn đặt sân, hướng dẫn vào /fields.`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'Trợ lý tư vấn sân bóng, trả lời tiếng Việt, ngắn gọn.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('❌ Lỗi chatbot:', error.message);

        // Fallback response
        if (error.message?.includes('rate_limit') || error.message?.includes('too large')) {
            return `⚽ Xin lỗi, hệ thống đang bận. Vui lòng:
• Truy cập /fields để xem sân
• Gọi hotline: 1900 1234`;
        }

        return '❌ Có lỗi xảy ra. Vui lòng thử lại hoặc gọi 1900 1234.';
    }
}

module.exports = {
    askFieldAssistant,
    getAvailableSlots,
    getFieldsShort,
};
