const INTENTS = {
    BOOKING: 'booking',
    AVAILABILITY: 'availability',
    PRICE: 'price',
    SUGGEST: 'suggest',
    PROMOTION: 'promotion',
    PAYMENT: 'payment',
    INFO: 'info',
    LOOKUP: 'lookup',
    CANCEL: 'cancel',
    RESCHEDULE: 'reschedule',
    SUPPORT: 'support',
    GREETING: 'greeting',
    NEAREST: 'nearest',
    UNKNOWN: 'unknown',
};

const DEFAULT_SUGGESTIONS = ['Đặt sân', 'Xem sân trống', 'Bảng giá', 'Liên hệ'];

const QUICK_COMMANDS = {
    'dat san': INTENTS.BOOKING,
    'xem san trong': INTENTS.AVAILABILITY,
    'bang gia': INTENTS.PRICE,
    'lien he': INTENTS.SUPPORT,
    'khuyen mai': INTENTS.PROMOTION,
    'tra cuu don': INTENTS.LOOKUP,
    'don cua toi': INTENTS.LOOKUP,
    'huy don': INTENTS.CANCEL,
    'khung gio mai': INTENTS.NEAREST,
    'goi y san': INTENTS.SUGGEST,
    'san 5 nguoi': INTENTS.BOOKING,
    'san 7 nguoi': INTENTS.BOOKING,
    'san 11 nguoi': INTENTS.BOOKING,
    'hom nay': INTENTS.AVAILABILITY,
    'ngay mai': INTENTS.AVAILABILITY,
    'xac nhan': INTENTS.BOOKING,
};

const AREA_KEYWORDS = [
    { keyword: 'đà nẵng', aliases: ['da nang', 'danang'] },
    { keyword: 'hà nội', aliases: ['ha noi', 'hanoi'] },
    { keyword: 'tp.hcm', aliases: ['tphcm', 'tp hcm', 'ho chi minh', 'sai gon', 'saigon'] },
    { keyword: 'quận 1', aliases: ['quan 1'] },
    { keyword: 'quận 7', aliases: ['quan 7'] },
    { keyword: 'thủ đức', aliases: ['thu duc'] },
    { keyword: 'bình thạnh', aliases: ['binh thanh'] },
    { keyword: 'tân bình', aliases: ['tan binh'] },
    { keyword: 'gò vấp', aliases: ['go vap'] },
    { keyword: 'cần thơ', aliases: ['can tho'] },
    { keyword: 'hải phòng', aliases: ['hai phong'] },
];

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function extractTimeRange(text) {
    const match = text.match(/(\d{1,2})[:h](\d{0,2})?\s*[-–den]\s*(\d{1,2})[:h]?(\d{0,2})?/i);
    if (!match) return null;
    const startH = match[1].padStart(2, '0');
    const startM = (match[2] || '00').padStart(2, '0');
    const endH = match[3].padStart(2, '0');
    const endM = (match[4] || '00').padStart(2, '0');
    return { startTime: `${startH}:${startM}`, endTime: `${endH}:${endM}` };
}

function extractArea(text) {
    const q = normalizeText(text);
    for (const area of AREA_KEYWORDS) {
        const keys = [area.keyword, ...area.aliases].map(normalizeText);
        if (keys.some((k) => q.includes(k))) return area.keyword;
    }
    return null;
}

function detectIntent(question, sessionFlow) {
    if (sessionFlow && sessionFlow !== 'idle') return sessionFlow;

    const q = normalizeText(question);

    if (QUICK_COMMANDS[q]) return QUICK_COMMANDS[q];

    if (/dat san|muon dat|book san/.test(q) || (q.includes('dat') && q.includes('san'))) {
        return INTENTS.BOOKING;
    }
    if (/huy don|cancel/.test(q) && !q.includes('hoan')) return INTENTS.CANCEL;
    if (/doi lich|doi lich/.test(q)) return INTENTS.RESCHEDULE;
    if (/tra cuu|ma dat|lich dat|don cua toi/.test(q)) return INTENTS.LOOKUP;

    if (
        /trong|con cho|kin lich|lich trong|available/.test(q) ||
        /co san|con san|san nao|co cho|con khong|duoc khong|xem san/.test(q)
    ) {
        return INTENTS.AVAILABILITY;
    }

    if (
        (/hom nay|ngay mai|\bmai\b/.test(q) || /\d{1,2}[\/\-]\d{1,2}/.test(q)) &&
        (/o |tai |khu vuc/.test(q) || extractArea(question) || /co san|con san/.test(q))
    ) {
        return INTENTS.AVAILABILITY;
    }

    if (/khung gio gan|gan nhat|sap toi/.test(q)) return INTENTS.NEAREST;

    if (/gia|bao nhieu|bang gia|tien thue/.test(q) && extractTimeRange(question)) return INTENTS.PRICE;
    if (/gia|bao nhieu|bang gia|tien thue/.test(q)) return INTENTS.PRICE;

    if (/goi y|phu hop|recommend|san nao tot/.test(q)) return INTENTS.SUGGEST;
    if (/giam gia|khuyen mai|ma giam|voucher|uu dai/.test(q)) return INTENTS.PROMOTION;
    if (/thanh toan|coc san|hoan tien|momo|vnpay|tien mat/.test(q)) return INTENTS.PAYMENT;
    if (/dia chi|mo cua|tien ich|o dau/.test(q)) return INTENTS.INFO;
    if (/lien he|nhan vien|ho tro|hotline|tu van nhan vien/.test(q)) return INTENTS.SUPPORT;
    if (/xin chao|^chao$|hello|^hi$/.test(q)) return INTENTS.GREETING;

    return INTENTS.UNKNOWN;
}

module.exports = {
    INTENTS,
    DEFAULT_SUGGESTIONS,
    QUICK_COMMANDS,
    detectIntent,
    extractArea,
    extractTimeRange,
};
