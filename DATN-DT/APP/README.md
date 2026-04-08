# QuanLySanBong - Ứng dụng Quản lý Sân Bóng Đá

Ứng dụng mobile quản lý sân bóng đá được xây dựng bằng React Native với Expo.

## Công nghệ sử dụng

- **React Native** + **Expo** (SDK 52)
- **TypeScript**
- **Expo Router** cho navigation
- **TanStack Query** (React Query) cho quản lý state server
- **Zustand** cho quản lý global state
- **NativeWind** (TailwindCSS) cho styling
- **Axios** cho gọi API

## Cấu trúc thư mục

```
QuanLySanBong/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Nhóm màn hình Auth
│   ├── (tabs)/            # Nhóm màn hình chính (Tab navigation)
│   │   └── (admin)/       # Nhóm màn hình Admin
│   ├── pitch/             # Chi tiết sân & Đặt sân
│   └── booking/           # Chi tiết đặt sân
├── components/            # React components
│   ├── ui/                # UI components cơ bản (Button, Input, Card...)
│   ├── pitch/             # Pitch components
│   └── booking/           # Booking components
├── hooks/                 # Custom React hooks
├── services/              # API services (axios)
├── stores/                # Zustand stores
├── types/                 # TypeScript interfaces
├── constants/             # Constants (API config, theme)
└── utils/                 # Utility functions
```

## Tính năng

### Người dùng
- Đăng nhập / Đăng ký / Quên mật khẩu
- Xem danh sách sân bóng
- Tìm kiếm và lọc sân
- Xem chi tiết sân bóng
- Đặt sân theo ngày và khung giờ
- Xem lịch sử đặt sân
- Quản lý tài khoản

### Quản trị viên (Admin)
- Dashboard với thống kê
- Quản lý sân bóng (CRUD)
- Quản lý lịch đặt (xác nhận/từ chối)
- Quản lý người dùng

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios
```

## Cấu hình API

Cập nhật `BASE_URL` trong file `constants/api.ts` để kết nối với backend:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP:PORT/api',
  TIMEOUT: 10000,
};
```

## Lưu ý

- Backend cần hỗ trợ JWT Authentication
- API endpoints được định nghĩa trong `constants/api.ts`
- Đảm bảo backend đang chạy trước khi sử dụng app

## License

MIT
