import { apiService } from '@/services/apiService';

// Capa de datos: solo HTTP. Las operaciones de producto se identifican por ID.
const byId = (id) => `/products/${encodeURIComponent(id)}`;

export const productRepository = {
  list: async (params) => (await apiService.get('/products', { params })).data,
  getById: async (id) => (await apiService.get(byId(id))).data,
  create: async (payload) => (await apiService.post('/products', payload)).data,
  updateById: async (id, payload) => (await apiService.put(byId(id), payload)).data,
  setActiveById: async (id, isActive) => (await apiService.patch(`${byId(id)}/is-active`, { isActive })).data,
  softDeleteById: async (id) => (await apiService.patch(`${byId(id)}/soft-delete`)).data
};
