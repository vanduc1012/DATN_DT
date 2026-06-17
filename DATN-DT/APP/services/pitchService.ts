import apiService from './api';
import { ENDPOINTS } from '@/constants/api';
import type { Pitch, AvailableSlotsResponse, PitchStats } from '@/types';

interface PitchListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

interface PitchListResponse {
  data: Pitch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const pitchService = {
  getAll: async (params?: PitchListParams): Promise<PitchListResponse> => {
    const response = await apiService.get<PitchListResponse>(
      ENDPOINTS.PITCHES.LIST,
      params
    );
    return response;
  },

  getById: async (id: string): Promise<Pitch> => {
    const response = await apiService.get<{ data: Pitch }>(
      ENDPOINTS.PITCHES.DETAIL(id)
    );
    return response.data;
  },

  getMy: async (): Promise<Pitch[]> => {
    const response = await apiService.get<{ data: Pitch[] }>(
      ENDPOINTS.PITCHES.MY
    );
    return response.data;
  },

  create: async (data: Partial<Pitch>): Promise<Pitch> => {
    const response = await apiService.post<{ data: Pitch }>(
      ENDPOINTS.PITCHES.LIST,
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<Pitch>): Promise<Pitch> => {
    const response = await apiService.put<{ data: Pitch }>(
      ENDPOINTS.PITCHES.DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.PITCHES.DETAIL(id));
  },

  getAvailableSlots: async (
    pitchId: string,
    date: string
  ): Promise<AvailableSlotsResponse> => {
    const response = await apiService.get<AvailableSlotsResponse>(
      ENDPOINTS.PITCHES.AVAILABLE_SLOTS(pitchId),
      { date }
    );
    return response;
  },

  uploadImages: async (
    pitchId: string,
    images: FormData
  ): Promise<string[]> => {
    const response = await apiService.uploadFormData<{ data: string[] }>(
      `${ENDPOINTS.PITCHES.DETAIL(pitchId)}/images`,
      images
    );
    return response.data;
  },
};
