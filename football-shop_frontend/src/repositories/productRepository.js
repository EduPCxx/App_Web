import { apiService } from '@/services/apiService';

// Capa de datos: solo HTTP. Todas las rutas de producto usan el slug.
const bySlug = (slug) => `/products/slug/${encodeURIComponent(slug)}`;

export const productRepository = {
  list: async (params) => (await apiService.get('/products', { params })).data,
  getBySlug: async (slug) => (await apiService.get(bySlug(slug))).data,
  create: async (payload) => (await apiService.post('/products', payload)).data,
  updateBySlug: async (slug, payload) => (await apiService.put(bySlug(slug), payload)).data,
  setActiveBySlug: async (slug, isActive) => (await apiService.patch(`${bySlug(slug)}/is-active`, { isActive })).data,
  softDeleteBySlug: async (slug) => (await apiService.patch(`${bySlug(slug)}/soft-delete`)).data
};
