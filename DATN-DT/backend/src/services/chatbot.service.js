const { v4: uuidv4 } = require('uuid');
const ChatbotSession = require('../models/chatbotSession.model');
const User = require('../models/users.model');
const BookingService = require('./booking.service');
const { polishReply } = require('../utils/chatbot');
const { INTENTS, DEFAULT_SUGGESTIONS, detectIntent, extractArea, extractTimeRange } = require('../utils/chatbotIntents');
const {
    OPEN_HOURS,
    PAYMENT_FAQ,
    FIELD_INFO_FAQ,
    parseDateInput,
    extractFieldType,
    extractPhone,
    extractBookingCode,
    getAvailabilitySummary,
    suggestFields,
    getPriceTable,
    getActiveDiscounts,
    lookupBookings,
    getPriceForSlot,
    getAvailableSlotsForField,
    getActiveFields,
    getNearestAvailableSlots,
    getPriceByTimeSlot,
    isSlotBooked,
    getBookedSlots,
} = require('../utils/chatbotData');

const SUPPORT_CONTACT = '📞 Hotline: 0355728627 | Email: support@alobooking.com';

class ChatbotService {
    async getSession(userId) {
        let session = await ChatbotSession.findOne({ userId });
        if (!session) {
            session = await ChatbotSession.create({ userId, flow: 'idle', step: null, data: {} });
        }
        return session;
    }

    async resetSession(session) {
        session.flow = 'idle';
        session.step = null;
        session.data = {};
        await session.save();
    }

    suggestionsForIntent(intent, needsHuman = false) {
        if (needsHuman) return ['Liên hệ nhân viên', 'Đặt sân', 'Xem sân trống'];
        switch (intent) {
            case INTENTS.BOOKING:
                return ['Xem sân trống', 'Bảng giá', 'Xác nhận đặt sân', 'Hủy'];
            case INTENTS.AVAILABILITY:
                return ['Đặt sân', 'Khung giờ mai', 'Bảng giá', 'Liên hệ'];
            case INTENTS.PRICE:
                return ['Đặt sân', 'Xem sân trống', 'Khuyến mãi', 'Liên hệ'];
            default:
                return DEFAULT_SUGGESTIONS;
        }
    }

    formatAvailability(date, summary) {
        const dateStr = date.toLocaleDateString('vi-VN');
        let text = `📅 Lịch trống ngày ${dateStr}:\n\n`;
        let hasAny = false;

        for (const item of summary) {
            if (item.isFull) {
                text += `🔴 ${item.field.name} (${item.field.type} người) - ${item.field.address}\n   ⚠️ Đã kín lịch\n\n`;
                continue;
            }
            if (item.slots.length === 0) {
                text += `⚪ ${item.field.name} - Chưa có bảng giá cho ngày này\n\n`;
                continue;
            }
            hasAny = true;
            text += `🟢 ${item.field.name} (${item.field.type} người) - ${item.field.address}\n`;
            text += item.slots.map((s) => `   • ${s.startTime}-${s.endTime}: ${s.price.toLocaleString('vi-VN')}đ`).join('\n');
            text += '\n\n';
        }

        if (!hasAny) text += '⚠️ Không còn khung giờ trống. Thử ngày khác hoặc loại sân khác.\n';
        return text.trim();
    }

    async handleBookingFlow(question, userId, session) {
        const user = await User.findById(userId).lean();
        const q = question.toLowerCase();

        if (/hủy|huy|thôi|thoi|cancel/.test(q) && session.step) {
            await this.resetSession(session);
            return {
                reply: 'Đã hủy quy trình đặt sân. Bạn cần hỗ trợ gì tiếp theo?',
                intent: INTENTS.BOOKING,
                suggestions: DEFAULT_SUGGESTIONS,
            };
        }

        if (!session.step || session.step === 'start') {
            session.flow = 'booking';
            session.step = 'field_type';
            session.data = { fullName: user?.fullName, phone: user?.phone };
            await session.save();
            return {
                reply: `⚽ Bắt đầu đặt sân qua chat!\n\n1️⃣ Loại sân: 5 / 7 / 11 người\n2️⃣ Khu vực (Quận 1, Thủ Đức...)\n3️⃣ Ngày (hôm nay, mai, DD/MM/YYYY)\n4️⃣ Khung giờ\n5️⃣ Xác nhận (tên, SĐT từ tài khoản)\n\nBạn muốn đặt sân mấy người?`,
                intent: INTENTS.BOOKING,
                suggestions: ['Sân 5 người', 'Sân 7 người', 'Sân 11 người', 'Hủy'],
            };
        }

        if (session.step === 'field_type') {
            const type = extractFieldType(question) || session.data.fieldType;
            if (!type) {
                return {
                    reply: 'Vui lòng chọn loại sân: 5, 7 hoặc 11 người.',
                    intent: INTENTS.BOOKING,
                    suggestions: ['Sân 5 người', 'Sân 7 người', 'Sân 11 người'],
                };
            }
            session.data.fieldType = type;
            session.step = 'area';
            await session.save();
            return {
                reply: `✅ Sân ${type} người.\n\n📍 Bạn muốn đặt ở khu vực nào? (Quận 1, Quận 7, Thủ Đức, Bình Thạnh...)\nGõ "bỏ qua" nếu không yêu cầu khu vực.`,
                intent: INTENTS.BOOKING,
                suggestions: ['Quận 1', 'Quận 7', 'Thủ Đức', 'Bỏ qua'],
            };
        }

        if (session.step === 'area') {
            if (/bo qua|khong can|tat ca/.test(q)) {
                session.data.area = null;
            } else {
                const area = extractArea(question);
                session.data.area = area || question.trim();
            }
            session.step = 'date';
            await session.save();
            return {
                reply: `📅 Bạn muốn đặt ngày nào? (hôm nay / mai / DD/MM/YYYY)`,
                intent: INTENTS.BOOKING,
                suggestions: ['Hôm nay', 'Ngày mai', 'Hủy'],
            };
        }

        if (session.step === 'date') {
            const date = parseDateInput(question);
            if (!date) {
                return {
                    reply: 'Không hiểu ngày bạn nhập. Vui lòng nhập: hôm nay, mai, hoặc DD/MM/YYYY.',
                    intent: INTENTS.BOOKING,
                    suggestions: ['Hôm nay', 'Ngày mai'],
                };
            }
            session.data.bookingDate = date;
            session.step = 'slot';
            await session.save();

            const area = session.data.area || extractArea(question);
            const summary = await getAvailabilitySummary({
                date,
                type: session.data.fieldType,
                area,
                limit: 3,
            });

            const slotLines = [];
            for (const item of summary) {
                for (const slot of item.slots.slice(0, 3)) {
                    slotLines.push(
                        `${slot.fieldName}: ${slot.startTime}-${slot.endTime} (${slot.price.toLocaleString('vi-VN')}đ)`,
                    );
                }
            }

            if (slotLines.length === 0) {
                return {
                    reply: `⚠️ Ngày ${date.toLocaleDateString('vi-VN')} không còn khung giờ trống cho sân ${session.data.fieldType} người.\nThử ngày khác nhé!`,
                    intent: INTENTS.AVAILABILITY,
                    suggestions: ['Ngày mai', 'Sân 7 người', 'Liên hệ'],
                    needsHuman: false,
                };
            }

            session.data.availableOptions = summary;
            await session.save();

            return {
                reply: `🟢 Khung giờ còn trống:\n${slotLines.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\nNhập số thứ tự hoặc khung giờ (VD: 18:00-20:00).`,
                intent: INTENTS.BOOKING,
                suggestions: slotLines.slice(0, 3),
            };
        }

        if (session.step === 'slot') {
            let selected = null;
            const optionIndex = Number(question.trim());
            const allSlots = (session.data.availableOptions || []).flatMap((item) =>
                item.slots.map((s) => ({ ...s })),
            );

            if (!Number.isNaN(optionIndex) && optionIndex >= 1 && optionIndex <= allSlots.length) {
                selected = allSlots[optionIndex - 1];
            } else {
                const time = extractTimeRange(question);
                if (time) {
                    selected = allSlots.find(
                        (s) => s.startTime === time.startTime && s.endTime === time.endTime,
                    );
                }
            }

            if (!selected) {
                return {
                    reply: 'Chưa chọn được khung giờ. Nhập số thứ tự hoặc khung giờ (VD: 18:00-20:00).',
                    intent: INTENTS.BOOKING,
                    suggestions: ['Hủy', 'Xem sân trống'],
                };
            }

            session.data.selectedSlot = selected;
            session.step = 'confirm';
            await session.save();

            return {
                reply: `📋 Xác nhận đặt sân:\n• Sân: ${selected.fieldName}\n• Loại: ${selected.fieldType} người\n• Ngày: ${new Date(session.data.bookingDate).toLocaleDateString('vi-VN')}\n• Giờ: ${selected.startTime}-${selected.endTime}\n• Giá: ${selected.price.toLocaleString('vi-VN')}đ\n• Khách: ${session.data.fullName || 'Chưa có'}\n• SĐT: ${session.data.phone || 'Chưa có'}\n\nGõ "xác nhận" để đặt hoặc cập nhật SĐT (VD: 0901234567).`,
                intent: INTENTS.BOOKING,
                suggestions: ['Xác nhận', 'Hủy'],
            };
        }

        if (session.step === 'confirm') {
            const phone = extractPhone(question);
            if (phone) {
                session.data.phone = phone;
                await User.findByIdAndUpdate(userId, { phone });
                await session.save();
                return {
                    reply: `Đã cập nhật SĐT: ${phone}.\nGõ "xác nhận" để hoàn tất đặt sân.`,
                    intent: INTENTS.BOOKING,
                    suggestions: ['Xác nhận', 'Hủy'],
                };
            }

            if (!/xác nhận|xac nhan|đồng ý|dong y|ok|chốt|chot/.test(q)) {
                return {
                    reply: 'Gõ "xác nhận" để tạo đơn hoặc gửi SĐT nếu chưa có.',
                    intent: INTENTS.BOOKING,
                    suggestions: ['Xác nhận', 'Hủy'],
                };
            }

            const slot = session.data.selectedSlot;
            const booked = await getBookedSlots(slot.fieldId, session.data.bookingDate);
            if (isSlotBooked(booked, slot.startTime, slot.endTime)) {
                await this.resetSession(session);
                return {
                    reply: '⚠️ Khung giờ vừa được người khác đặt. Vui lòng chọn khung giờ khác.',
                    intent: INTENTS.AVAILABILITY,
                    suggestions: ['Xem sân trống', 'Đặt sân'],
                };
            }

            const bookingGroupId = uuidv4();
            await BookingService.createBooking({
                bookingId: bookingGroupId,
                typePayment: 'cash',
                userId,
                fieldId: slot.fieldId,
                bookingDate: session.data.bookingDate,
                slots: [{ startTime: slot.startTime, endTime: slot.endTime, price: slot.price }],
                note: 'Đặt qua chatbot AloBooking',
            });

            await this.resetSession(session);

            return {
                reply: `✅ ĐẶT SÂN THÀNH CÔNG!\n\nMã đặt sân: ${bookingGroupId}\nSân: ${slot.fieldName}\nNgày: ${new Date(session.data.bookingDate).toLocaleDateString('vi-VN')}\nGiờ: ${slot.startTime}-${slot.endTime}\nGiá: ${slot.price.toLocaleString('vi-VN')}đ\nThanh toán: Tiền mặt tại sân\n\nLưu mã để tra cứu hoặc hủy đơn.`,
                intent: INTENTS.BOOKING,
                suggestions: ['Tra cứu đơn', 'Đặt sân khác', 'Bảng giá'],
            };
        }

        return {
            reply: 'Tiếp tục quy trình đặt sân nhé.',
            intent: INTENTS.BOOKING,
            suggestions: DEFAULT_SUGGESTIONS,
        };
    }

    async handleCancelFlow(question, userId, session) {
        const q = question.toLowerCase();

        if (!session.step) {
            session.flow = 'cancel';
            session.step = 'input';
            await session.save();
            return {
                reply: 'Nhập mã đặt sân (booking ID) hoặc gõ "đơn của tôi" để xem đơn gần nhất.',
                intent: INTENTS.CANCEL,
                suggestions: ['Đơn của tôi', 'Hủy'],
            };
        }

        if (/đơn của tôi|don cua toi/.test(q)) {
            const bookings = await lookupBookings({ userId });
            if (!bookings.length) {
                await this.resetSession(session);
                return { reply: 'Bạn chưa có đơn đặt sân nào.', intent: INTENTS.LOOKUP, suggestions: DEFAULT_SUGGESTIONS };
            }
            const lines = bookings.map(
                (b, i) =>
                    `${i + 1}. ${b.bookingId || b._id} | ${b.fieldId?.name} | ${new Date(b.bookingDate).toLocaleDateString('vi-VN')} ${b.startTime}-${b.endTime} | ${b.status}`,
            );
            session.data.bookings = bookings;
            session.step = 'pick';
            await session.save();
            return {
                reply: `📋 Đơn của bạn:\n${lines.join('\n')}\n\nNhập số thứ tự để hủy.`,
                intent: INTENTS.CANCEL,
                suggestions: ['Hủy'],
            };
        }

        const code = extractBookingCode(question);
        if (session.step === 'pick') {
            const idx = Number(question.trim()) - 1;
            const booking = session.data.bookings?.[idx];
            if (!booking) {
                return { reply: 'Không tìm thấy đơn. Nhập số thứ tự hợp lệ.', intent: INTENTS.CANCEL, suggestions: ['Hủy'] };
            }
            await BookingService.cancelBooking(booking._id, userId);
            await this.resetSession(session);
            return {
                reply: `✅ Đã hủy đơn ${booking.bookingId || booking._id} thành công.`,
                intent: INTENTS.CANCEL,
                suggestions: DEFAULT_SUGGESTIONS,
            };
        }

        if (code) {
            const bookings = await lookupBookings({ bookingCode: code, userId });
            if (!bookings.length) {
                return { reply: 'Không tìm thấy đơn với mã này.', intent: INTENTS.LOOKUP, suggestions: DEFAULT_SUGGESTIONS };
            }
            await BookingService.cancelBooking(bookings[0]._id, userId);
            await this.resetSession(session);
            return {
                reply: `✅ Đã hủy đơn ${code} thành công.`,
                intent: INTENTS.CANCEL,
                suggestions: DEFAULT_SUGGESTIONS,
            };
        }

        return {
            reply: 'Vui lòng nhập mã đặt sân hoặc "đơn của tôi".',
            intent: INTENTS.CANCEL,
            suggestions: ['Đơn của tôi', 'Hủy'],
        };
    }

    async handleLookup(question, userId) {
        const phone = extractPhone(question);
        const code = extractBookingCode(question);
        const q = question.toLowerCase();

        let bookings = [];
        if (code) bookings = await lookupBookings({ bookingCode: code });
        else if (phone) bookings = await lookupBookings({ phone });
        else if (/của tôi|cua toi|đơn tôi|don toi/.test(q)) bookings = await lookupBookings({ userId });
        else {
            return {
                reply: 'Nhập mã đặt sân, SĐT hoặc gõ "đơn của tôi".',
                intent: INTENTS.LOOKUP,
                suggestions: ['Đơn của tôi', 'Đặt sân'],
            };
        }

        if (!bookings.length) {
            return { reply: 'Không tìm thấy đơn đặt sân phù hợp.', intent: INTENTS.LOOKUP, suggestions: DEFAULT_SUGGESTIONS };
        }

        const lines = bookings.map(
            (b) =>
                `• Mã: ${b.bookingId || b._id}\n  Sân: ${b.fieldId?.name}\n  Ngày: ${new Date(b.bookingDate).toLocaleDateString('vi-VN')} ${b.startTime}-${b.endTime}\n  Giá: ${b.price?.toLocaleString('vi-VN')}đ | ${b.status}`,
        );

        return {
            reply: `🔍 Kết quả tra cứu:\n\n${lines.join('\n\n')}`,
            intent: INTENTS.LOOKUP,
            suggestions: ['Hủy đơn', 'Đặt sân', 'Bảng giá'],
        };
    }

    async handleIntent(intent, question, userId, session) {
        const date = parseDateInput(question) || new Date();
        const type = extractFieldType(question);
        const area = extractArea(question);

        switch (intent) {
            case INTENTS.BOOKING:
            case 'booking':
                return this.handleBookingFlow(question, userId, session);

            case INTENTS.CANCEL:
            case 'cancel':
                return this.handleCancelFlow(question, userId, session);

            case INTENTS.RESCHEDULE:
            case 'reschedule':
                return {
                    reply: '🔄 Để đổi lịch: hủy đơn cũ rồi đặt lại.\nGõ "hủy đơn" hoặc "đặt sân" để tiếp tục.',
                    intent: INTENTS.RESCHEDULE,
                    suggestions: ['Hủy đơn', 'Đặt sân', 'Tra cứu đơn'],
                };

            case INTENTS.LOOKUP:
            case 'lookup':
                return this.handleLookup(question, userId);

            case INTENTS.AVAILABILITY:
            case 'availability': {
                const parsedDate = parseDateInput(question) || date;
                const parsedArea = extractArea(question) || area;

                if (parsedArea) {
                    const fieldsInArea = await getActiveFields({ type, area: parsedArea, limit: 20 });
                    if (!fieldsInArea.length) {
                        const supported = await getActiveFields({ limit: 6 });
                        return {
                            reply: `📍 Hiện chưa có sân tại ${parsedArea} trên hệ thống.\n\nAloBooking đang có sân tại:\n${supported.map((f) => `• ${f.name} - ${f.address}`).join('\n')}\n\nBạn có thể hỏi: "Xem sân trống ngày mai ở Quận 7" hoặc gõ "Đặt sân".`,
                            intent: INTENTS.AVAILABILITY,
                            suggestions: ['Xem sân trống', 'Đặt sân', 'Bảng giá'],
                        };
                    }
                }

                let summary = await getAvailabilitySummary({
                    date: parsedDate,
                    type,
                    area: parsedArea,
                });

                const timeFilter = extractTimeRange(question);
                if (timeFilter) {
                    summary = summary
                        .map((item) => ({
                            ...item,
                            slots: item.slots.filter(
                                (s) => s.startTime === timeFilter.startTime && s.endTime === timeFilter.endTime,
                            ),
                        }))
                        .filter((item) => item.slots.length > 0 || item.isFull);
                }

                if (!summary.length) {
                    return {
                        reply: `Không tìm thấy sân phù hợp${parsedArea ? ` tại ${parsedArea}` : ''} vào ${parsedDate.toLocaleDateString('vi-VN')}.`,
                        intent: INTENTS.AVAILABILITY,
                        suggestions: ['Đặt sân', 'Bảng giá', 'Liên hệ'],
                    };
                }

                return {
                    reply: this.formatAvailability(parsedDate, summary),
                    intent: INTENTS.AVAILABILITY,
                    suggestions: ['Đặt sân', 'Ngày mai', 'Bảng giá'],
                    contextData: JSON.stringify(summary),
                };
            }

            case INTENTS.PRICE:
            case 'price': {
                const timeRange = extractTimeRange(question);
                const priceDate = parseDateInput(question) || new Date();

                if (timeRange) {
                    const slotPrices = await getPriceByTimeSlot({
                        type,
                        area,
                        date: priceDate,
                        startTime: timeRange.startTime,
                        endTime: timeRange.endTime,
                    });
                    if (!slotPrices.length) {
                        return {
                            reply: `Không tìm thấy giá cho khung ${timeRange.startTime}-${timeRange.endTime}${area ? ` tại ${area}` : ''}.`,
                            intent: INTENTS.PRICE,
                            suggestions: ['Bảng giá', 'Xem sân trống', 'Đặt sân'],
                        };
                    }
                    const text = slotPrices
                        .map(
                            (s) =>
                                `🏟️ ${s.fieldName} (${s.type} người)\n   ${s.time}: ${s.price.toLocaleString('vi-VN')}đ ${s.available ? '🟢 Còn trống' : '🔴 Đã kín'}`,
                        )
                        .join('\n\n');
                    return {
                        reply: `💰 Giá khung ${timeRange.startTime}-${timeRange.endTime} ngày ${priceDate.toLocaleDateString('vi-VN')}:\n\n${text}`,
                        intent: INTENTS.PRICE,
                        suggestions: ['Đặt sân', 'Xem sân trống'],
                        contextData: text,
                    };
                }

                const table = await getPriceTable({ type });
                if (!table.length) {
                    return { reply: 'Chưa có bảng giá phù hợp.', intent: INTENTS.PRICE, suggestions: DEFAULT_SUGGESTIONS };
                }
                const text = table
                    .map(
                        (f) =>
                            `🏟️ ${f.fieldName} (${f.type} người)\n${f.slots.map((s) => `  ${s.time}: ${s.price.toLocaleString('vi-VN')}đ`).join('\n')}`,
                    )
                    .join('\n\n');
                return { reply: `💰 Bảng giá tham khảo:\n\n${text}`, intent: INTENTS.PRICE, suggestions: ['Đặt sân', 'Xem sân trống'], contextData: text };
            }

            case INTENTS.NEAREST:
            case 'nearest': {
                const nearestDate = parseDateInput(question);
                const slots = await getNearestAvailableSlots({
                    type,
                    area,
                    daysAhead: nearestDate ? 0 : 7,
                    limit: 6,
                });

                if (!slots.length) {
                    return {
                        reply: '⚠️ Không tìm thấy khung giờ trống trong 7 ngày tới. Thử đổi loại sân hoặc khu vực.',
                        intent: INTENTS.NEAREST,
                        suggestions: ['Đặt sân', 'Bảng giá', 'Liên hệ'],
                    };
                }

                const text = slots
                    .map(
                        (s, i) =>
                            `${i + 1}. ${s.fieldName} | ${new Date(s.date).toLocaleDateString('vi-VN')} ${s.startTime}-${s.endTime} | ${s.price.toLocaleString('vi-VN')}đ`,
                    )
                    .join('\n');

                return {
                    reply: `⏰ Khung giờ trống gần nhất:\n\n${text}\n\nGõ "Đặt sân" để đặt ngay!`,
                    intent: INTENTS.NEAREST,
                    suggestions: ['Đặt sân', 'Xem sân trống', 'Bảng giá'],
                    contextData: text,
                };
            }

            case INTENTS.SUGGEST:
            case 'suggest': {
                const maxMatch = question.match(/(\d[\d\.]*)\s*(k|nghìn|ngan|triệu|tr)?/i);
                let maxPrice = null;
                if (maxMatch) {
                    const num = Number(maxMatch[1].replace(/\./g, ''));
                    maxPrice = /triệu|tr/i.test(maxMatch[2] || '') ? num * 1000000 : num * (/k|nghìn|ngan/i.test(maxMatch[2] || '') ? 1000 : 1);
                }
                const items = await suggestFields({ type, maxPrice, area });
                if (!items.length) {
                    return { reply: 'Chưa tìm được sân phù hợp. Thử đổi khu vực hoặc loại sân.', intent: INTENTS.SUGGEST, suggestions: DEFAULT_SUGGESTIONS };
                }
                const text = items
                    .map(
                        (f, i) =>
                            `${i + 1}. ${f.name} (${f.type} người) - ${f.address}\n   ⭐${f.rating} | Từ ${f.minPrice?.toLocaleString('vi-VN') || '?'}đ`,
                    )
                    .join('\n');
                return { reply: `✨ Gợi ý sân phù hợp:\n\n${text}`, intent: INTENTS.SUGGEST, suggestions: ['Đặt sân', 'Xem sân trống'], contextData: text };
            }

            case INTENTS.PROMOTION:
            case 'promotion': {
                const discounts = await getActiveDiscounts();
                if (!discounts.length) {
                    return { reply: 'Hiện chưa có chương trình khuyến mãi.', intent: INTENTS.PROMOTION, suggestions: DEFAULT_SUGGESTIONS };
                }
                const text = discounts
                    .map((d) => {
                        const value = d.type === 'percentage' ? `${d.value}%` : `${d.value.toLocaleString('vi-VN')}đ`;
                        return `🎁 ${d.code}: ${d.name} - Giảm ${value}`;
                    })
                    .join('\n');
                return { reply: `🎉 Khuyến mãi đang áp dụng:\n\n${text}`, intent: INTENTS.PROMOTION, suggestions: ['Đặt sân', 'Bảng giá'], contextData: text };
            }

            case INTENTS.PAYMENT:
            case 'payment':
                return { reply: PAYMENT_FAQ, intent: INTENTS.PAYMENT, suggestions: ['Đặt sân', 'Liên hệ'] };

            case INTENTS.INFO:
            case 'info': {
                const fields = await getActiveFields({ area, limit: 5 });
                const list = fields.map((f) => `• ${f.name} (${f.type} người): ${f.address}`).join('\n');
                return {
                    reply: `${FIELD_INFO_FAQ}\n\n📍 Sân đang hoạt động:\n${list || 'Liên hệ hotline để biết thêm.'}`,
                    intent: INTENTS.INFO,
                    suggestions: ['Đặt sân', 'Xem sân trống'],
                };
            }

            case INTENTS.SUPPORT:
            case 'support':
                return {
                    reply: `🙋 ${SUPPORT_CONTACT}\n\nNhân viên sẽ hỗ trợ bạn trong giờ hành chính 8:00-22:00.`,
                    intent: INTENTS.SUPPORT,
                    suggestions: DEFAULT_SUGGESTIONS,
                    needsHuman: true,
                };

            case INTENTS.GREETING:
            case 'greeting':
                return {
                    reply: `⚽ Xin chào! Tôi là AloBookingBot.\n\nTôi có thể:\n• Tư vấn sân trống theo ngày/giờ/khu vực\n• Gợi ý sân 5/7/11 người\n• Đặt sân trực tiếp trong chat\n• Tra cứu / hủy đơn\n• Tư vấn giá, khuyến mãi, thanh toán\n\nGiờ mở cửa: ${OPEN_HOURS}`,
                    intent: INTENTS.GREETING,
                    suggestions: DEFAULT_SUGGESTIONS,
                };

            default:
                return {
                    reply: `Mình chưa hiểu rõ câu hỏi.\n\nBạn thử:\n• "Xem sân trống hôm nay"\n• "Đặt sân 5 người"\n• "Bảng giá sân 7 người"\n• "Tra cứu đơn của tôi"\n\nHoặc liên hệ nhân viên: 1900 1234`,
                    intent: INTENTS.UNKNOWN,
                    suggestions: DEFAULT_SUGGESTIONS,
                    needsHuman: true,
                };
        }
    }

    async processMessage(question, userId) {
        const session = await this.getSession(userId);
        const intent = detectIntent(question, session.flow === 'idle' ? null : session.flow);
        const result = await this.handleIntent(intent, question, userId, session);

        const polished = await polishReply({
            question,
            intent: result.intent,
            baseReply: result.reply,
            contextData: result.contextData || result.reply,
        });

        return {
            reply: polished,
            intent: result.intent,
            suggestions: result.suggestions || this.suggestionsForIntent(result.intent, result.needsHuman),
            needsHuman: Boolean(result.needsHuman),
            sessionActive: session.flow !== 'idle',
        };
    }
}

module.exports = new ChatbotService();
