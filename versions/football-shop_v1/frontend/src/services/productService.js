import { productRepository } from '../repositories/productRepository';
import { CATEGORIES } from '../models/product';

const PAGE_SIZE = 8;

// Devuelve un objeto { campo: mensaje }. Vacío si el formulario es válido.
// Replica las reglas del backend para dar feedback inmediato.
function validate(form) {
  const errors = {};
  const text = (field) => String(form[field] ?? '').trim();

  if (text('name').length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.';
  else if (text('name').length > 150) errors.name = 'Máximo 150 caracteres.';

  if (!CATEGORIES.includes(form.category)) errors.category = 'Selecciona una categoría.';
  if (!text('team')) errors.team = 'El equipo es obligatorio (usa N/A si no aplica).';
  if (!text('brand')) errors.brand = 'La marca es obligatoria.';
  if (!text('size')) errors.size = 'La talla/tamaño es obligatoria.';

  const price = Number(form.price);
  if (text('price') === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Indica un precio válido (0 o superior).';
  }

  const stock = Number(form.stock);
  if (text('stock') === '' || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'El stock debe ser un entero (0 o superior).';
  }

  if (!text('description')) errors.description = 'La descripción es obligatoria.';
  else if (text('description').length > 1000) errors.description = 'Máximo 1000 caracteres.';

  return errors;
}

// Convierte el formulario (strings) al payload que espera la API.
function normalize(form) {
  return {
    name: form.name.trim(),
    category: form.category,
    team: form.team.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    brand: form.brand.trim(),
    size: form.size.trim(),
    description: form.description.trim()
  };
}

export const productService = {
  validate,

  async list({ search, category, page }) {
    const query = { page, limit: PAGE_SIZE };
    if (search) query.search = search;
    if (category) query.category = category;
    const { data, pagination } = await productRepository.list(query);
    return { items: data, pagination };
  },

  async get(id) {
    return (await productRepository.get(id)).data;
  },

  async create(form) {
    return (await productRepository.create(normalize(form))).data;
  },

  async update(id, form) {
    return (await productRepository.update(id, normalize(form))).data;
  },

  remove: (id) => productRepository.remove(id)
};
