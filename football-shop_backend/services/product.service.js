const productRepository = require('../repositories/product.repository');
const catalogRepository = require('../repositories/catalog.repository');
const AppError = require('../utils/AppError');
const { generateUniqueSlug } = require('../utils/slugify');

const RESERVED_SLUGS = ['new'];
const MAX_SLUG_RETRIES = 3;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query) => {
  const filter = {};
  if (query.category_id) filter.category_id = query.category_id;
  if (query.brand_id) filter.brand_id = query.brand_id;
  if (query.status) filter.status = query.status;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  return filter;
};

const buildSort = (sortBy = 'createdAt', order = 'desc') => ({ [sortBy]: order === 'asc' ? 1 : -1 });
const notFound = () => new AppError('Producto no encontrado', 404, 'NOT_FOUND');
const relationNotFound = (relation) => new AppError(`${relation} no encontrada`, 404, 'RELATED_RESOURCE_NOT_FOUND');
const slugTaken = (excludeId) => async (candidate) =>
  RESERVED_SLUGS.includes(candidate) || productRepository.slugExists(candidate, excludeId);
const isSlugCollision = (error) => error && error.code === 11000 && error.keyPattern && error.keyPattern.slug;

const withSlugRetry = async (fn) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isSlugCollision(error) || attempt >= MAX_SLUG_RETRIES) throw error;
    }
  }
};

const assertRelations = async (data) => {
  if (data.category_id && !(await catalogRepository.exists('categories', data.category_id))) {
    throw relationNotFound('La categoría');
  }
  if (data.brand_id && !(await catalogRepository.exists('brands', data.brand_id))) {
    throw relationNotFound('La marca');
  }
};

const buildUpdatePayload = async (current, data) => {
  const payload = { ...data };
  if (data.name && data.name !== current.name) {
    payload.slug = await generateUniqueSlug(data.name, slugTaken(current._id));
  }
  return payload;
};

const createProduct = async (data) => {
  await assertRelations(data);
  return withSlugRetry(async () =>
    productRepository.create({ ...data, slug: await generateUniqueSlug(data.name, slugTaken()) })
  );
};

const listProducts = async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const filter = buildFilter(query);
  const sort = buildSort(query.sortBy, query.order);
  const [items, total] = await Promise.all([
    productRepository.findAll(filter, { skip: (page - 1) * limit, limit, sort }),
    productRepository.count(filter)
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getProductById = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw notFound();
  return product;
};

const getProductBySlug = async (slug) => {
  const product = await productRepository.findBySlug(slug);
  if (!product) throw notFound();
  return product;
};

const updateExisting = async (current, data) => {
  await assertRelations(data);
  return withSlugRetry(async () => {
    const updated = await productRepository.updateById(current._id, await buildUpdatePayload(current, data));
    if (!updated) throw notFound();
    return updated;
  });
};

const updateProduct = async (id, data) => updateExisting(await getProductById(id), data);
const updateProductBySlug = async (slug, data) => updateExisting(await getProductBySlug(slug), data);

const softDeleteProductBySlug = async (slug) => {
  const product = await productRepository.softDeleteBySlug(slug);
  if (!product) throw notFound();
  return product;
};

const setProductActiveBySlug = async (slug, isActive) => {
  const product = await productRepository.setActiveBySlug(slug, isActive);
  if (!product) throw notFound();
  return product;
};

const deleteProduct = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw notFound();
  if (product.variants.length || product.images.length) {
    throw new AppError('No se puede eliminar un producto con variantes o imágenes asociadas', 409, 'RELATED_RESOURCES_EXIST');
  }
  return productRepository.deleteById(id);
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
