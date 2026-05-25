import apiService from './api';
import { ENDPOINTS } from '@/constants/api';
import type { StatsOverview, RevenueStats, PitchStats } from '@/types';

interface RevenueParams {
  startDate?: string;
  endDate?: string;
  type?: 'daily' | 'monthly' | 'yearly';
}

export const statsService = {
  getOverview: async (): Promise<StatsOverview> => {
    const response = await apiService.get<{ data: StatsOverview }>(
      ENDPOINTS.STATS.OVERVIEW
    );
    return response.data;
  },

  getRevenue: async (params?: RevenueParams): Promise<RevenueStats[]> => {
    const response = await apiService.get<{ data: RevenueStats[] }>(
      ENDPOINTS.STATS.REVENUE,
      params
    );
    return response.data;
  },

  getTopPitches: async (): Promise<PitchStats[]> => {
    const response = await apiService.get<{ data: PitchStats[] }>(
      ENDPOINTS.STATS.TOP_PITCHES
    );
    return response.data;
  },
};
