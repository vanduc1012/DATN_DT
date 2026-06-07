require('dotenv').config();

let groq = null;
if (process.env.GROQ_API_KEY) {
    try {
        const Groq = require('groq-sdk');
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } catch (err) {
        console.warn('Could not initialize Groq SDK:', err.message);
        groq = null;
    }
} else {
    console.warn('GROQ_API_KEY not set; chatbot will use database responses only.');
}

/**
 * Làm mượt câu trả lời bằng AI nhưng KHÔNG được thêm dữ liệu ngoài context
 */
async function polishReply({ question, intent, baseReply, contextData }) {
    if (!groq) return baseReply;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content:
                        'Bạn là AloBookingBot. CHỈ được diễn đạt lại nội dung đã cho. KHÔNG thêm sân, giá, khung giờ, mã giảm giá mới. Không bịa dữ liệu. Trả lời tiếng Việt, ngắn gọn, thân thiện, có emoji phù hợp.',
                },
                {
                    role: 'user',
                    content: `Intent: ${intent}
Câu hỏi: ${question}
DỮ LIỆU HỆ THỐNG (chỉ dùng đúng các thông tin này):
${contextData || 'Không có'}

NỘI DUNG CẦN DIỄN ĐẠT LẠI:
${baseReply}`,
                },
            ],
            temperature: 0.3,
            max_tokens: 600,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {        console.error('❌ Lỗi Groq polish:', error.message);
        return baseReply;
    }
}

module.exports = {
    polishReply,
    isAiEnabled: () => Boolean(groq),
};
