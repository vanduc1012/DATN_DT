require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/features/users/user.model');
const Pitch = require('./src/features/pitches/pitch.model');
const { PITCH_STATUS, PITCH_TYPES, ROLES } = require('./src/utils/constants');
const logger = require('./src/utils/logger');

const pitchesData = [
  {
    name: 'Sân bóng mini Thành Phát',
    description: 'Sân cỏ nhân tạo chất lượng cao, cỏ mềm mại chống chấn thương. Hệ thống thoát nước cực tốt đảm bảo chơi thoải mái ngay cả sau mưa lớn. Đầy đủ bãi giữ xe rộng rãi và căng tin phục vụ nước uống đồ ăn nhẹ.',
    address: 'Số 104 Đường Số 7, Phường Tân Phong',
    district: 'Quận 7',
    city: 'Hồ Chí Minh',
    type: PITCH_TYPES.FIVE,
    pricePerHour: 250000,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe miễn phí', 'Wifi', 'Nước uống miễn phí', 'Căng tin'],
    openTime: '06:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân vận động Hữu Bằng',
    description: 'Sân bóng 7 người kích thước chuẩn quốc tế, trang bị cỏ nhân tạo nhập khẩu từ FIFA. Thích hợp cho các trận thi đấu phong trào và giao lưu doanh nghiệp. Không gian thoáng đãng, view cực đẹp.',
    address: 'Khu công nghiệp Hữu Bằng',
    district: 'Huyện Thạch Thất',
    city: 'Hà Nội',
    type: PITCH_TYPES.SEVEN,
    pricePerHour: 400000,
    images: ['https://images.unsplash.com/photo-1540747737956-37872404a821?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Vòi tắm hoa sen', 'Căng tin', 'Trọng tài'],
    openTime: '05:30',
    closeTime: '23:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân bóng đá chuyên nghiệp Tuyên Sơn',
    description: 'Sân bóng 11 người mặt cỏ tự nhiên được chăm sóc tỉ mỉ hàng ngày. Hệ thống đèn LED công suất lớn chiếu sáng cực kỳ tốt vào ban đêm. Có khán đài có mái che cho khán giả cổ vũ đông đảo.',
    address: 'Số 22 Đường 2 Tháng 9, Hòa Cường Bắc',
    district: 'Quận Hải Châu',
    city: 'Đà Nẵng',
    type: PITCH_TYPES.ELEVEN,
    pricePerHour: 1200000,
    images: ['https://images.unsplash.com/photo-1431324155629-1a6edd1d141e?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Khán đài', 'Phòng thay đồ', 'Vòi tắm hoa sen', 'Bóng thi đấu', 'Trọng tài'],
    openTime: '06:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân cỏ nhân tạo Dịch Vọng',
    description: 'Tổ hợp gồm nhiều sân 7 người nằm tại vị trí trung tâm Cầu Giấy, thuận tiện đi lại. Sân mới được nâng cấp mặt cỏ, hệ thống lưới chắn bóng cực cao an toàn và giảm thiểu bóng bay ra ngoài.',
    address: 'Số 3 Ngõ 233 Xuân Thủy',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    type: PITCH_TYPES.SEVEN,
    pricePerHour: 350000,
    images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe có thu phí', 'Căng tin', 'Wifi miễn phí'],
    openTime: '06:00',
    closeTime: '22:30',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân bóng đá mini Nhân Mỹ',
    description: 'Phù hợp cho các hội nhóm học sinh sinh viên thi đấu giải trí lành mạnh. Giá thuê cực rẻ và nhiều chương trình ưu đãi giảm giá theo tháng. Nhân viên sân nhiệt tình chu đáo.',
    address: 'Đường Lê Đức Thọ, Mỹ Đình',
    district: 'Quận Nam Từ Liêm',
    city: 'Hà Nội',
    type: PITCH_TYPES.FIVE,
    pricePerHour: 180000,
    images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe miễn phí', 'Thuê giày đá bóng', 'Căng tin'],
    openTime: '06:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân cỏ nhân tạo Hoa Lư Quận 1',
    description: 'Vị trí đắc địa ngay trung tâm Quận 1. Sân có kích thước tiêu chuẩn, độ đàn hồi của sân cao đem lại trải nghiệm chạy bóng mượt mà. Phục vụ chuyên nghiệp từ chủ sân.',
    address: 'Số 2 Đinh Tiên Hoàng, Đa Kao',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    type: PITCH_TYPES.SEVEN,
    pricePerHour: 550000,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe có thu phí', 'Wifi miễn phí', 'Tắm nước nóng', 'Thuê áo bib'],
    openTime: '05:00',
    closeTime: '23:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân vận động Thống Nhất (Sân 11)',
    description: 'Sân vận động bóng đá lịch sử chuẩn thi đấu chuyên nghiệp của giải vô địch quốc gia. Thích hợp tổ chức các sự kiện thể thao lớn, giải đấu quy mô công ty lớn hoặc cúp vô địch.',
    address: '138 Đào Duy Từ, Phường 6',
    district: 'Quận 10',
    city: 'Hồ Chí Minh',
    type: PITCH_TYPES.ELEVEN,
    pricePerHour: 1500000,
    images: ['https://images.unsplash.com/photo-1431324155629-1a6edd1d141e?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Khán đài lớn', 'Hầm thay đồ', 'Đèn chiếu sáng công suất lớn', 'Hệ thống âm thanh', 'Phòng y tế'],
    openTime: '07:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân bóng Cánh Buồm Hồng',
    description: 'Không gian lộng gió sát bờ biển Sơn Trà, sân 5 cỏ nhân tạo mới đét 100%. Lý tưởng cho các trận đấu thể lực kết hợp ngắm hoàng hôn biển tuyệt đẹp.',
    address: 'Đường Võ Nguyên Giáp',
    district: 'Quận Sơn Trà',
    city: 'Đà Nẵng',
    type: PITCH_TYPES.FIVE,
    pricePerHour: 220000,
    images: ['https://images.unsplash.com/photo-1624887007627-613d5260f85f?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe miễn phí', 'Wifi miễn phí', 'Nước uống', 'Căng tin sát biển'],
    openTime: '06:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân cỏ nhân tạo Hòa Xuân',
    description: 'Sân bóng 7 người hiện đại nằm tại khu đô thị sinh thái Hòa Xuân. Mặt sân bằng phẳng, hệ thống thoát nước ngầm giúp mặt sân khô ráo nhanh chóng sau những cơn mưa dông miền Trung.',
    address: 'Đường Trần Nam Trung',
    district: 'Quận Cẩm Lệ',
    city: 'Đà Nẵng',
    type: PITCH_TYPES.SEVEN,
    pricePerHour: 300000,
    images: ['https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Giữ xe rộng rãi', 'Căng tin giải khát', 'Thuê áo tập'],
    openTime: '05:30',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  },
  {
    name: 'Sân bóng đá Lâm Viên',
    description: 'Thưởng thức không khí mát lạnh tuyệt vời của Đà Lạt khi rê bóng trên mặt sân cỏ mini trong sương mờ. Sân nằm giữa đồi thông thơ mộng mang đến cảm giác cực kỳ thư giãn.',
    address: 'Số 4 Đường Hùng Vương',
    district: 'Thành phố Đà Lạt',
    city: 'Lâm Đồng',
    type: PITCH_TYPES.FIVE,
    pricePerHour: 200000,
    images: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600&auto=format&fit=crop'],
    amenities: ['Đèn chiếu sáng', 'Nước trà gừng nóng miễn phí', 'Giữ xe miễn phí', 'Wifi'],
    openTime: '06:00',
    closeTime: '22:00',
    status: PITCH_STATUS.ACTIVE
  }
];

async function seed() {
  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('🔌 Kết nối database thành công để thực hiện seeding!');

    // 2. Tìm hoặc tạo user để làm chủ sân (owner)
    let owner = await User.findOne({ role: { $in: [ROLES.OWNER, ROLES.ADMIN] } });
    if (!owner) {
      logger.info('⚠️ Chưa tìm thấy tài khoản admin hoặc owner. Đang tiến hành khởi tạo tài khoản owner mặc định...');
      owner = new User({
        name: 'Nguyễn Văn Đức',
        email: 'owner@soccer.com',
        password: 'password123',
        role: ROLES.OWNER,
        phone: '0987654321',
        isActive: true
      });
      await owner.save();
      logger.info(`✅ Đã tạo tài khoản owner mặc định thành công: Email: ${owner.email} | Mật khẩu: password123`);
    } else {
      logger.info(`👤 Đã tìm thấy tài khoản owner sẵn có để gán bản quyền sân: ${owner.email} (${owner.name})`);
    }

    // Gán owner id cho tất cả pitches dữ liệu mẫu
    const populatedPitches = pitchesData.map(pitch => ({
      ...pitch,
      owner: owner._id
    }));

    // 3. Tiến hành thêm dữ liệu
    logger.info(`⏳ Đang tiến hành chèn ${populatedPitches.length} sân bóng vào database...`);
    const inserted = await Pitch.insertMany(populatedPitches);
    logger.info(`✅ Đã chèn thành công ${inserted.length} sân bóng mới vào hệ thống!`);
    
    // In danh sách ra màn hình
    inserted.forEach((pitch, i) => {
      logger.info(`   [${i + 1}] ${pitch.name} - ${pitch.address}, ${pitch.district}, ${pitch.city} (${pitch.type})`);
    });

  } catch (error) {
    logger.error(`❌ Xảy ra lỗi trong quá trình seed dữ liệu: ${error.stack || error.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 Đã ngắt kết nối database an toàn.');
  }
}

seed();
