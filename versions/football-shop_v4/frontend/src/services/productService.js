import { productRepository } from '@/repositories/productRepository';

// Máximo que permite la API por petición
const MAX_ITEMS = 100;

// Convierte el formulario (strings + checkbox) al payload que espera la API.
const normalize = (form) => ({
  name: form.name.trim(),
  category: form.category,
  team: form.team.trim(),
  price: Number(form.price),
  stock: Number(form.stock),
  brand: form.brand.trim(),
  size: form.size.trim(),
  description: form.description.trim(),
  isActive: Boolean(form.isActive)
});

// Lógica de negocio del cliente. Los errores se propagan como ApiError (ver apiService).
export const productService = {
  list: async () => (await productRepository.list({ limit: MAX_ITEMS })).data,
  getBySlug: async (slug) => (await productRepository.getBySlug(slug)).data,
  create: async (form) => (await productRepository.create(normalize(form))).data,
  update: async (slug, form) => (await productRepository.updateBySlug(slug, normalize(form))).data,
  setActive: async (slug, isActive) => (await productRepository.setActiveBySlug(slug, isActive)).data,
  remove: async (slug) => (await productRepository.softDeleteBySlug(slug)).data
};
