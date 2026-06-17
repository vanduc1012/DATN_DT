import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services';
import type { Booking, CreateBookingRequest, BookingStatus } from '@/types';

interface BookingListParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  date?: string;
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMy(),
  });
}

export function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.getAll(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function usePayBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      bookingService.pay(id, paymentMethod as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
