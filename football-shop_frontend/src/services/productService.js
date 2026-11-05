import { productRepository } from '@/repositories/productRepository';

// Máximo que permite la API por petición
const MAX_ITEMS = 100;

// Convierte los valores de formulario al modelo relacional del backend.
const normalize = (form) => ({
  name: form.name.trim(),
  category_id: form.category_id,
  brand_id: form.brand_id,
  description: form.description.trim(),
  status: form.status,
  isActive: Boolean(form.isActive)
});

// Lógica de negocio del cliente. Los errores se propagan como ApiError (ver apiService).
export const productService = {
  list: async () => (await productRepository.list({ limit: MAX_ITEMS })).data,
  getById: async (id) => (await productRepository.getById(id)).data,
  create: async (form) => (await productRepository.create(normalize(form))).data,
  update: async (id, form) => (await productRepository.updateById(id, normalize(form))).data,
  setActive: async (id, isActive) => (await productRepository.setActiveById(id, isActive)).data,
  remove: async (id) => (await productRepository.softDeleteById(id)).data
};
