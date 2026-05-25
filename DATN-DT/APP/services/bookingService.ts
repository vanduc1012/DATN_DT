import apiService from './api';
import { ENDPOINTS } from '@/constants/api';
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  BookingStatus,
  PaymentMethod,
} from '@/types';

interface BookingListParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  date?: string;
}

interface BookingListResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const bookingService = {
  getMy: async (): Promise<Booking[]> => {
    const response = await apiService.get<{ data: Booking[] }>(
      ENDPOINTS.BOOKINGS.MY
    );
    return response.data;
  },

  getAll: async (params?: BookingListParams): Promise<BookingListResponse> => {
    const response = await apiService.get<BookingListResponse>(
      ENDPOINTS.BOOKINGS.LIST,
      params
    );
    return response;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiService.get<{ data: Booking }>(
      ENDPOINTS.BOOKINGS.DETAIL(id)
    );
    return response.data;
  },

  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiService.post<{ data: Booking }>(
      ENDPOINTS.BOOKINGS.CREATE,
      data
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: BookingStatus
  ): Promise<Booking> => {
    const response = await apiService.patch<{ data: Booking }>(
      ENDPOINTS.BOOKINGS.UPDATE_STATUS(id),
      { status }
    );
    return response.data;
  },

  cancel: async (id: string): Promise<Booking> => {
    return this.updateStatus(id, 'cancelled');
  },

  pay: async (
    id: string,
    paymentMethod: PaymentMethod
  ): Promise<Booking> => {
    const response = await apiService.patch<{ data: Booking }>(
      ENDPOINTS.BOOKINGS.PAY(id),
      { paymentMethod }
    );
    return response.data;
  },
};
