import { apiService } from '@/services/apiService';

export const dashboardRepository = {
  getStats: async () => (await apiService.get('/dashboard/stats')).data
};
