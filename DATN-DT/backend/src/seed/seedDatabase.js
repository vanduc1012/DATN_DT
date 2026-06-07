const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/users.model');
const Field = require('../models/field.model');
const FieldPrice = require('../models/fieldPrice.model');
const Booking = require('../models/booking.model');
const Discount = require('../models/discount.model');
const Review = require('../models/review.model');
const Blog = require('../models/blog.model');
const Notification = require('../models/notification.model');
const MessageChatbot = require('../models/messageChatbot.model');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123456';

const hashPassword = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_ROUNDS));

const FIELD_IMAGE =
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800';

const TIME_SLOTS = [
    { start: '06:00', end: '08:00', baseMultiplier: 0.8 },
    { start: '08:00', end: '10:00', baseMultiplier: 0.9 },
    { start: '10:00', end: '12:00', baseMultiplier: 1 },
    { start: '12:00', end: '14:00', baseMultiplier: 1 },
    { start: '14:00', end: '16:00', baseMultiplier: 1 },
    { start: '16:00', end: '18:00', baseMultiplier: 1.1 },
    { start: '18:00', end: '20:00', baseMultiplier: 1.3 },
    { start: '20:00', end: '22:00', baseMultiplier: 1.2 },
];

const BASE_PRICE_BY_TYPE = { 5: 200000, 7: 350000, 11: 600000 };

const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    return date;
};

const generateFieldPrices = (fieldId, fieldType) => {
    const basePrice = BASE_PRICE_BY_TYPE[fieldType];
    const prices = [];

    for (let day = 0; day <= 6; day += 1) {
        const isWeekend = day === 0 || day === 6;
        const dayMultiplier = isWeekend ? 1.15 : 1;

        TIME_SLOTS.forEach((slot) => {
            prices.push({
                fieldId,
                dayOfWeek: day,
                startTime: slot.start,
                endTime: slot.end,
                price: Math.round(basePrice * slot.baseMultiplier * dayMultiplier / 10000) * 10000,
            });
        });
    }

    return prices;
};

const clearCollections = async () => {
    await Promise.all([
        User.deleteMany({}),
        Field.deleteMany({}),
        FieldPrice.deleteMany({}),
        Booking.deleteMany({}),
        Discount.deleteMany({}),
        Review.deleteMany({}),
        Blog.deleteMany({}),
        Notification.deleteMany({}),
        MessageChatbot.deleteMany({}),
    ]);
};

const seedUsers = async () => {
    const users = await User.insertMany([
        {
            fullName: 'Admin AloBooking',
            email: 'admin@alobooking.com',
            password: hashPassword(DEFAULT_PASSWORD),
            isAdmin: true,
            phone: '0901000001',
            address: 'Quận 1, TP.HCM',
            typeLogin: 'email',
        },
        {
            fullName: 'Trần Văn Đức',
            email: 'duc30072004@gmail.com',
            password: hashPassword(DEFAULT_PASSWORD),
            isAdmin: true,
            phone: '0902000002',
            address: 'Quận 7, TP.HCM',
            birthDay: new Date('2004-07-30'),
            typeLogin: 'email',
        },
        {
            fullName: 'Trần Minh Tuấn',
            email: 'tuan.user@gmail.com',
            password: hashPassword(DEFAULT_PASSWORD),
            phone: '0903000003',
            address: 'Thủ Đức, TP.HCM',
            typeLogin: 'email',
        },
        {
            fullName: 'Lê Hoàng Nam',
            email: 'nam.user@gmail.com',
            password: hashPassword(DEFAULT_PASSWORD),
            phone: '0904000004',
            address: 'Bình Thạnh, TP.HCM',
            typeLogin: 'email',
        },
    ]);

    return {
        admin: users[0],
        duc: users[1],
        tuan: users[2],
        nam: users[3],
    };
};

const seedFields = async () => {
    return Field.insertMany([
        {
            name: 'Sân Bóng 5 Người Quận 1',
            type: '5',
            description: 'Sân cỏ nhân tạo chất lượng cao, có đèn chiếu sáng, phù hợp đá giao hữu và giải nội bộ.',
            images: [FIELD_IMAGE],
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            status: 'active',
        },
        {
            name: 'Sân Bóng 7 Người Thủ Đức',
            type: '7',
            description: 'Sân rộng rãi, bãi xe miễn phí, có phòng thay đồ và khu vực nghỉ ngơi.',
            images: [FIELD_IMAGE],
            address: '45 Võ Văn Ngân, Thủ Đức, TP.HCM',
            status: 'active',
        },
        {
            name: 'Sân Bóng 11 Người Bình Thạnh',
            type: '11',
            description: 'Sân tiêu chuẩn 11 người, cỏ tự nhiên, phù hợp tổ chức giải đấu chuyên nghiệp.',
            images: [FIELD_IMAGE],
            address: '88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
            status: 'active',
        },
        {
            name: 'Sân Bóng 5 Người Quận 7',
            type: '5',
            description: 'Sân mới khai trương, hệ thống đèn LED hiện đại, wifi miễn phí.',
            images: [FIELD_IMAGE],
            address: '12 Nguyễn Thị Thập, Quận 7, TP.HCM',
            status: 'active',
        },
        {
            name: 'Sân Bóng 7 Người Tân Bình',
            type: '7',
            description: 'Vị trí trung tâm, dễ di chuyển, có quầy nước uống và dụng cụ thể thao.',
            images: [FIELD_IMAGE],
            address: '200 Cộng Hòa, Tân Bình, TP.HCM',
            status: 'maintenance',
        },
        {
            name: 'Sân Bóng 5 Người Gò Vấp',
            type: '5',
            description: 'Giá cả phải chăng, phù hợp sinh viên và nhóm bạn đá buổi tối.',
            images: [FIELD_IMAGE],
            address: '55 Quang Trung, Gò Vấp, TP.HCM',
            status: 'active',
        },
    ]);
};

const seedDiscounts = async (fields) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 3);

    return Discount.insertMany([
        {
            code: 'WELCOME10',
            name: 'Giảm 10% cho khách mới',
            description: 'Áp dụng cho đơn đặt sân đầu tiên',
            type: 'percentage',
            value: 10,
            minOrderValue: 100000,
            maxDiscountValue: 100000,
            usageLimit: 100,
            usageLimitPerUser: 1,
            startDate,
            endDate,
            isActive: true,
            appliesTo: 'all',
        },
        {
            code: 'GIAM50K',
            name: 'Giảm 50.000đ',
            description: 'Giảm cố định cho đơn từ 300.000đ',
            type: 'fixed',
            value: 50000,
            minOrderValue: 300000,
            usageLimit: 50,
            usageLimitPerUser: 2,
            startDate,
            endDate,
            isActive: true,
            appliesTo: 'all',
        },
        {
            code: 'SAN5VIP',
            name: 'Ưu đãi sân 5 người',
            description: 'Giảm 15% khi đặt sân 5 người',
            type: 'percentage',
            value: 15,
            minOrderValue: 150000,
            maxDiscountValue: 80000,
            usageLimit: null,
            usageLimitPerUser: 3,
            startDate,
            endDate,
            isActive: true,
            appliesTo: 'specific_fields',
            specificFields: [fields[0]._id, fields[3]._id, fields[5]._id],
        },
        {
            code: 'SUMMER20',
            name: 'Hè sôi động -20%',
            description: 'Ưu đãi mùa hè cho tất cả sân',
            type: 'percentage',
            value: 20,
            minOrderValue: 200000,
            maxDiscountValue: 150000,
            usageLimit: 200,
            usedCount: 12,
            usageLimitPerUser: 2,
            startDate,
            endDate,
            isActive: true,
            appliesTo: 'all',
        },
    ]);
};

const seedBookings = async (users, fields) => {
    const bookingGroup1 = uuidv4();
    const bookingGroup2 = uuidv4();
    const bookingGroup3 = uuidv4();

    const bookings = await Booking.insertMany([
        {
            userId: users.duc._id,
            bookingId: bookingGroup1,
            fieldId: fields[0]._id,
            bookingDate: addDays(-5),
            startTime: '18:00',
            endTime: '20:00',
            price: 260000,
            originalPrice: 260000,
            status: 'completed',
            typePayment: 'momo',
        },
        {
            userId: users.tuan._id,
            bookingId: bookingGroup2,
            fieldId: fields[1]._id,
            bookingDate: addDays(-2),
            startTime: '16:00',
            endTime: '18:00',
            price: 385000,
            originalPrice: 385000,
            status: 'paid',
            typePayment: 'vnpay',
        },
        {
            userId: users.nam._id,
            bookingId: bookingGroup3,
            fieldId: fields[2]._id,
            bookingDate: addDays(-1),
            startTime: '18:00',
            endTime: '20:00',
            price: 780000,
            originalPrice: 780000,
            discountCode: 'GIAM50K',
            discountAmount: 50000,
            status: 'confirmed',
            typePayment: 'cash',
            note: 'Đặt sân cho giải công ty',
        },
        {
            userId: users.duc._id,
            bookingId: uuidv4(),
            fieldId: fields[3]._id,
            bookingDate: addDays(1),
            startTime: '20:00',
            endTime: '22:00',
            price: 230000,
            originalPrice: 230000,
            status: 'pending',
            typePayment: 'cash',
        },
        {
            userId: users.tuan._id,
            bookingId: uuidv4(),
            fieldId: fields[0]._id,
            bookingDate: addDays(2),
            startTime: '06:00',
            endTime: '08:00',
            price: 160000,
            originalPrice: 160000,
            status: 'confirmed',
            typePayment: 'momo',
        },
        {
            userId: users.nam._id,
            bookingId: uuidv4(),
            fieldId: fields[5]._id,
            bookingDate: addDays(-7),
            startTime: '18:00',
            endTime: '20:00',
            price: 260000,
            originalPrice: 260000,
            status: 'cancelled',
            typePayment: 'failed',
        },
        {
            userId: users.duc._id,
            bookingId: uuidv4(),
            fieldId: fields[1]._id,
            bookingDate: addDays(3),
            startTime: '18:00',
            endTime: '20:00',
            price: 455000,
            originalPrice: 455000,
            status: 'in_progress',
            typePayment: 'vnpay',
        },
        {
            userId: users.tuan._id,
            bookingId: uuidv4(),
            fieldId: fields[2]._id,
            bookingDate: addDays(-3),
            startTime: '10:00',
            endTime: '12:00',
            price: 600000,
            originalPrice: 600000,
            status: 'completed',
            typePayment: 'cash',
        },
    ]);

    return { bookings, bookingGroup1, bookingGroup2, bookingGroup3 };
};

const seedReviews = async (users, fields, bookingGroups) => {
    const reviews = await Review.insertMany([
        {
            userId: users.duc._id,
            fieldId: fields[0]._id,
            bookingId: bookingGroups.bookingGroup1,
            rating: 5,
            comment: 'Sân đẹp, cỏ êm, nhân viên nhiệt tình. Sẽ quay lại!',
            isVisible: true,
            reply: {
                content: 'Cảm ơn bạn đã sử dụng dịch vụ của AloBooking!',
                repliedAt: new Date(),
            },
        },
        {
            userId: users.tuan._id,
            fieldId: fields[1]._id,
            bookingId: bookingGroups.bookingGroup2,
            rating: 4,
            comment: 'Sân tốt, chỗ để xe hơi chật vào cuối tuần.',
            isVisible: true,
        },
        {
            userId: users.tuan._id,
            fieldId: fields[2]._id,
            bookingId: bookingGroups.bookings[7].bookingId,
            rating: 5,
            comment: 'Sân 11 người rất chất lượng, đá giải rất ok.',
            isVisible: true,
        },
    ]);

    for (const fieldId of [fields[0]._id, fields[1]._id, fields[2]._id]) {
        const stats = await Review.aggregate([
            { $match: { fieldId, isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const avgRating = stats[0]?.averageRating || 0;
        const totalReviews = stats[0]?.totalReviews || 0;

        await Field.findByIdAndUpdate(fieldId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews,
        });
    }

    return reviews;
};

const BLOG_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    'https://images.unsplash.com/photo-1551958219-2f47e28f9f0e?w=800&q=80',
];

const seedBlogs = async () => {
    return Blog.insertMany([
        {
            title: '5 Lợi Ích Của Việc Chơi Bóng Đá Thường Xuyên',
            content:
                'Bóng đá không chỉ là môn thể thao giải trí mà còn giúp cải thiện sức khỏe tim mạch, tăng cường sức bền và phát triển tinh thần đồng đội. Hãy đặt sân và ra sân ít nhất 2 lần mỗi tuần để duy trì thể lực tốt nhất.',
            image: BLOG_IMAGES[0],
        },
        {
            title: 'Hướng Dẫn Đặt Sân Online Trên AloBooking',
            content:
                'Chỉ với 4 bước đơn giản: chọn sân, chọn khung giờ, áp dụng mã giảm giá và thanh toán. Bạn có thể đặt sân mọi lúc mọi nơi trên website hoặc ứng dụng AloBooking.',
            image: BLOG_IMAGES[1],
        },
        {
            title: 'Top 3 Sân Bóng Được Yêu Thích Nhất Tại TP.HCM',
            content:
                'Khám phá các sân bóng được đánh giá cao về chất lượng mặt sân, tiện ích và giá cả hợp lý. Danh sách được cập nhật theo đánh giá thực tế từ người dùng AloBooking.',
            image: BLOG_IMAGES[2],
        },
        {
            title: 'Mẹo Tổ Chức Giải Bóng Đá Mini Thành Công',
            content:
                'Lên kế hoạch số đội tham gia, chọn sân phù hợp, chuẩn bị trọng tài và giải thưởng. Đặt sân trước ít nhất 1 tuần để đảm bảo khung giờ đẹp cho toàn bộ giải đấu.',
            image: BLOG_IMAGES[3],
        },
    ]);
};

const seedNotifications = async (users, fields, bookingGroups) => {
    return Notification.insertMany([
        {
            userId: users.duc._id,
            type: 'system',
            title: '🎉 Chào mừng bạn đến với AloBooking!',
            message: 'Cảm ơn bạn đã tham gia. Khám phá sân bóng và đặt sân ngay hôm nay!',
            data: { type: 'welcome' },
            isRead: true,
        },
        {
            userId: users.duc._id,
            type: 'booking_confirmed',
            title: '✅ Đặt sân thành công',
            message: `Bạn đã đặt ${fields[0].name} lúc 18:00 - 20:00 thành công.`,
            data: { bookingId: bookingGroups.bookingGroup1, fieldId: fields[0]._id },
            isRead: false,
        },
        {
            userId: users.tuan._id,
            type: 'promotion',
            title: '🔥 Mã giảm giá SUMMER20',
            message: 'Giảm 20% cho mọi đơn đặt sân trong tháng này. Nhanh tay đặt sân!',
            data: { discountCode: 'SUMMER20' },
            isRead: false,
        },
        {
            userId: users.nam._id,
            type: 'booking_reminder',
            title: '⏰ Nhắc nhở lịch đặt sân',
            message: `Bạn có lịch đá tại ${fields[2].name} vào ngày mai lúc 18:00.`,
            data: { fieldId: fields[2]._id },
            isRead: false,
        },
        {
            userId: users.tuan._id,
            type: 'booking_cancelled',
            title: '❌ Đơn đặt sân đã hủy',
            message: 'Đơn đặt sân của bạn đã được hủy theo yêu cầu.',
            data: { type: 'cancelled' },
            isRead: true,
        },
        {
            userId: users.nam._id,
            type: 'system',
            title: '📢 Cập nhật hệ thống',
            message: 'AloBooking đã hỗ trợ thanh toán MoMo và VNPay. Trải nghiệm ngay!',
            data: { type: 'system_update' },
            isRead: false,
        },
    ]);
};

const seedChatbotMessages = async (users) => {
    return MessageChatbot.insertMany([
        {
            userId: users.duc._id,
            sender: 'user',
            content: 'Xin chào, tôi muốn đặt sân bóng 5 người ở Quận 1',
            timestamp: new Date(Date.now() - 3600000),
        },
        {
            userId: users.duc._id,
            sender: 'bot',
            content:
                'Chào bạn! AloBooking có sân bóng 5 người tại Quận 1 và Quận 7. Bạn muốn xem khung giờ trống ngày nào?',
            timestamp: new Date(Date.now() - 3500000),
        },
        {
            userId: users.duc._id,
            sender: 'user',
            content: 'Tối nay khoảng 18h đến 20h',
            timestamp: new Date(Date.now() - 3400000),
        },
        {
            userId: users.duc._id,
            sender: 'bot',
            content:
                'Sân Bóng 5 Người Quận 1 còn trống 18:00-20:00 tối nay với giá 260.000đ. Bạn có muốn đặt không?',
            timestamp: new Date(Date.now() - 3300000),
        },
        {
            userId: users.tuan._id,
            sender: 'user',
            content: 'Có mã giảm giá nào không?',
            timestamp: new Date(Date.now() - 7200000),
        },
        {
            userId: users.tuan._id,
            sender: 'bot',
            content: 'Hiện có mã WELCOME10 (giảm 10%) và SUMMER20 (giảm 20%) cho đơn đặt sân.',
            timestamp: new Date(Date.now() - 7100000),
        },
    ]);
};

const seedDatabase = async () => {
    const mongoUri = process.env.CONNECT_DB;

    if (!mongoUri) {
        throw new Error('CONNECT_DB chưa được cấu hình trong backend/.env');
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 20000 });
    console.log('✅ Đã kết nối MongoDB');

    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await clearCollections();

    console.log('👤 Đang tạo users...');
    const users = await seedUsers();

    console.log('⚽ Đang tạo sân bóng...');
    const fields = await seedFields();

    console.log('💰 Đang tạo bảng giá...');
    const allPrices = fields.flatMap((field) => generateFieldPrices(field._id, field.type));
    await FieldPrice.insertMany(allPrices);

    console.log('🏷️  Đang tạo mã giảm giá...');
    await seedDiscounts(fields);

    console.log('📅 Đang tạo đơn đặt sân...');
    const bookingGroups = await seedBookings(users, fields);

    console.log('⭐ Đang tạo đánh giá...');
    await seedReviews(users, fields, bookingGroups);

    console.log('📰 Đang tạo bài viết blog...');
    await seedBlogs();

    console.log('🔔 Đang tạo thông báo...');
    await seedNotifications(users, fields, bookingGroups);

    console.log('🤖 Đang tạo lịch sử chatbot...');
    await seedChatbotMessages(users);

    console.log('\n🎉 Seed database thành công!\n');
    console.log('Tài khoản đăng nhập:');
    console.log('  Admin : admin@alobooking.com / 123456');
    console.log('  User  : duc30072004@gmail.com / 123456');
    console.log('  User  : tuan.user@gmail.com / 123456');
    console.log('  User  : nam.user@gmail.com / 123456');
    console.log('\nCollections đã seed:');
    console.log('  users, fields, fieldprices, bookings, discounts,');
    console.log('  reviews, blogs, notifications, messagechatbots');
};

seedDatabase()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('❌ Seed thất bại:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    });
