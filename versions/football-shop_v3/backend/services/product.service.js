const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

// La validación de tipos, rangos, IDs y query params vive en validators/product.validator.js
// (se aplica en las rutas con validate()). Aquí solo queda la lógica de negocio.

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.team) filter.team = new RegExp(`^${escapeRegex(query.team)}$`, 'i');
  if (query.brand) filter.brand = new RegExp(`^${escapeRegex(query.brand)}$`, 'i');
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  return filter;
};

const buildSort = (sortBy = 'createdAt', order = 'desc') => ({ [sortBy]: order === 'asc' ? 1 : -1 });

const createProduct = async (data) => {
  try {
    return await productRepository.create(data);
  } catch (error) {
    throw error;
  }
};

const listProducts = async (query = {}) => {
  try {
    const { page = 1, limit = 10 } = query;
    const filter = buildFilter(query);
    const sort = buildSort(query.sortBy, query.order);

    const [items, total] = await Promise.all([
      productRepository.findAll(filter, { skip: (page - 1) * limit, limit, sort }),
      productRepository.count(filter)
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
    };
  } catch (error) {
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (id, data) => {
  try {
    const product = await productRepository.updateById(id, data);
    if (!product) throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
    return product;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await productRepository.deleteById(id);
    if (!product) throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
    return product;
  } catch (error) {
    throw error;
  }
};

/*
 * Ejemplos de uso de utils/slugify.js (el modelo actual no tiene campo `slug`; ver notas de entrega):
 *
 *   const { generateSlug, generateUniqueSlug } = require('../utils/slugify');
 *
 *   // 1) Slug simple, síncrono
 *   const slug = generateSlug(data.name); // "Balón Oficial LaLiga" → "balon-oficial-laliga"
 *
 *   // 2) Slug único: añade -2, -3... si ya existe (existsFn puede ser async)
 *   const uniqueSlug = await generateUniqueSlug(data.name, async (candidate) =>
 *     Boolean(await productRepository.findBySlug(candidate)) // findBySlug: método a crear en el repository
 *   );
 */

module.exports = { createProduct, listProducts, getProductById, updateProduct, deleteProduct };
