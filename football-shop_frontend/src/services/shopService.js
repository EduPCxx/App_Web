import { apiService } from '@/services/apiService';

export const shopService = {
  listCategories: async () =>
    (await apiService.get('/categories', { params: { page: 1, limit: 100 } })).data.data,
  listBrands: async () =>
    (await apiService.get('/brands', { params: { page: 1, limit: 100 } })).data.data,
  listProducts: async (params) =>
    (await apiService.get('/products', { params })).data,
  getProductBySlug: async (slug) =>
    (await apiService.get(`/products/slug/${slug}`)).data.data
};
