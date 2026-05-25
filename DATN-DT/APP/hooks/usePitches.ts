import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchService } from '@/services';
import type { Pitch } from '@/types';

interface PitchListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export function usePitches(params?: PitchListParams) {
  return useQuery({
    queryKey: ['pitches', params],
    queryFn: () => pitchService.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePitch(id: string) {
  return useQuery({
    queryKey: ['pitch', id],
    queryFn: () => pitchService.getById(id),
    enabled: !!id,
  });
}

export function useMyPitches() {
  return useQuery({
    queryKey: ['my-pitches'],
    queryFn: () => pitchService.getMy(),
  });
}

export function useAvailableSlots(pitchId: string, date: string) {
  return useQuery({
    queryKey: ['available-slots', pitchId, date],
    queryFn: () => pitchService.getAvailableSlots(pitchId, date),
    enabled: !!pitchId && !!date,
  });
}

export function useCreatePitch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pitch>) => pitchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['my-pitches'] });
    },
  });
}

export function useUpdatePitch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pitch> }) =>
      pitchService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['pitch', id] });
      queryClient.invalidateQueries({ queryKey: ['my-pitches'] });
    },
  });
}

export function useDeletePitch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pitchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['my-pitches'] });
    },
  });
}
