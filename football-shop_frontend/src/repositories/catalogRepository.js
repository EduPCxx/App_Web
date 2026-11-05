import { apiService } from '@/services/apiService';

const endpoint = (resource) => `/${resource}`;

export const catalogRepository = {
  list: async (resource, params) => (await apiService.get(endpoint(resource), { params })).data,
  getById: async (resource, id) => (await apiService.get(`${endpoint(resource)}/${id}`)).data,
  create: async (resource, payload) => (await apiService.post(endpoint(resource), payload)).data,
  update: async (resource, id, payload) => (await apiService.put(`${endpoint(resource)}/${id}`, payload)).data,
  remove: async (resource, id) => (await apiService.delete(`${endpoint(resource)}/${id}`)).data
};
