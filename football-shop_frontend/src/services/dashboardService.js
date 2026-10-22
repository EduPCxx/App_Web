import { dashboardRepository } from '@/repositories/dashboardRepository';

export const dashboardService = {
  getStats: async () => (await dashboardRepository.getStats()).data
};
