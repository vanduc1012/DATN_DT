export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Pitch {
  id: string;
  name: string;
  address: string;
  description: string;
  pricePerHour: number;
  images: string[];
  type: PitchType;
  status: PitchStatus;
  rating: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PitchType = '5v5' | '7v7' | '11v11';

export type PitchStatus = 'available' | 'maintenance';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
  date?: string;
}

export interface Booking {
  id: string;
  pitchId: string;
  pitch?: Pitch;
  userId: string;
  user?: User;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'cash' | 'banking' | 'momo' | 'zalopay';

export interface Review {
  id: string;
  pitchId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  pitchId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsOverview {
  totalPitches: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingBookings: number;
}

export interface RevenueStats {
  date: string;
  revenue: number;
  bookings: number;
}

export interface PitchStats {
  pitchId: string;
  pitchName: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
}
