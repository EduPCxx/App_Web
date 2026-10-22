const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');
const { generateUniqueSlug } = require('../utils/slugify');

// El frontend usa /products/new para el formulario de alta: ningún producto puede tener ese slug
const RESERVED_SLUGS = ['new'];
const MAX_SLUG_RETRIES = 3;

// La validación de tipos, rangos, IDs y query params vive en validators/product.validator.js
// (se aplica en las rutas con validate()). Aquí solo queda la lógica de negocio.

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
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

const notFound = () => new AppError('Producto no encontrado', 404, 'NOT_FOUND');

const slugTaken = (excludeId) => async (candidate) =>
  RESERVED_SLUGS.includes(candidate) || productRepository.slugExists(candidate, excludeId);

const isSlugCollision = (error) => error && error.code === 11000 && error.keyPattern && error.keyPattern.slug;

// Dos peticiones simultáneas pueden generar el mismo slug: el índice único lo detecta y se reintenta
const withSlugRetry = async (fn) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isSlugCollision(error) || attempt >= MAX_SLUG_RETRIES) throw error;
    }
  }
};

// El slug solo se regenera si cambia `name` (mantiene su valor si el nombre no cambia)
const buildUpdatePayload = async (current, data) => {
  if (data.name === undefined || data.name === current.name) return data;
  return { ...data, slug: await generateUniqueSlug(data.name, slugTaken(current._id)) };
};

const updateExisting = async (current, data) =>
  withSlugRetry(async () => {
    const product = await productRepository.updateById(current._id, await buildUpdatePayload(current, data));
    if (!product) throw notFound();
    return product;
  });

const createProduct = async (data) => {
  try {
    return await withSlugRetry(async () =>
      productRepository.create({ ...data, slug: await generateUniqueSlug(data.name, slugTaken()) })
    );
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
    if (!product) throw notFound();
    return product;
  } catch (error) {
    throw error;
  }
};

const getProductBySlug = async (slug) => {
  try {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw notFound();
    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (id, data) => {
  try {
    const current = await getProductById(id);
    return await updateExisting(current, data);
  } catch (error) {
    throw error;
  }
};

const updateProductBySlug = async (slug, data) => {
  try {
    const current = await getProductBySlug(slug);
    return await updateExisting(current, data);
  } catch (error) {
    throw error;
  }
};

const softDeleteProductBySlug = async (slug) => {
  try {
    const product = await productRepository.softDeleteBySlug(slug);
    if (!product) throw notFound();
    return product;
  } catch (error) {
    throw error;
  }
};

const setProductActiveBySlug = async (slug, isActive) => {
  try {
    const product = await productRepository.setActiveBySlug(slug, isActive);
    if (!product) throw notFound();
    return product;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await productRepository.deleteById(id);
    if (!product) throw notFound();
    return product;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateProductBySlug,
  deleteProduct,
  softDeleteProductBySlug,
  setProductActiveBySlug
};
