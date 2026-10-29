const crypto = require('crypto');
const catalogRepository = require('../repositories/catalog.repository');
const AppError = require('../utils/AppError');
const { generateUniqueSlug } = require('../utils/slugify');

const entityModels = {
  product: ['Product', 'products'],
  variant: ['Variant', 'variants'],
  brand: ['Brand', 'brands'],
  category: ['Category', 'categories']
};
const notFound = (type) => new AppError(`${type} no encontrado`, 404, 'NOT_FOUND');
const invalidRelation = (label) => new AppError(`${label} no existe o no está activo`, 404, 'RELATED_RESOURCE_NOT_FOUND');
const conflict = (message) => new AppError(message, 409, 'RELATED_RESOURCES_EXIST');
const sluggedTypes = ['categories', 'brands'];
const decimalNumber = (value) => Number(value && typeof value.toString === 'function' ? value.toString() : value);

const assertRelations = async (type, data) => {
  if (type === 'variants' && data.product_id && !(await catalogRepository.exists('products', data.product_id))) {
    throw invalidRelation('El producto');
  }
  if (type === 'images' && data.entity_type && data.entity_id) {
    const mapped = entityModels[data.entity_type];
    if (!mapped || !(await catalogRepository.exists(mapped[1], data.entity_id))) throw invalidRelation('La entidad asociada');
    data.entity_model = mapped[0];
  } else if (type === 'images' && data.entity_type) {
    data.entity_model = entityModels[data.entity_type][0];
  }
  if (type === 'users' && data.role_id && !(await catalogRepository.exists('roles', data.role_id))) {
    throw invalidRelation('El rol');
  }
};

const assertUniqueFlags = async (type, data, excludeId) => {
  if (
    type === 'variants' &&
    data.compare_at_price !== undefined &&
    data.compare_at_price !== null &&
    data.price !== undefined &&
    data.compare_at_price < data.price
  ) {
    throw new AppError('El precio anterior debe ser igual o superior al precio actual', 400, 'VALIDATION_ERROR');
  }
  if (type === 'variants' && data.is_default) {
    const duplicate = await catalogRepository.findDuplicateFlag('variants', { product_id: data.product_id, is_default: true }, excludeId);
    if (duplicate) throw conflict('El producto ya tiene una variante predeterminada');
  }
  if (type === 'images' && data.is_primary) {
    const duplicate = await catalogRepository.findDuplicateFlag(
      'images',
      { entity_type: data.entity_type, entity_id: data.entity_id, is_primary: true },
      excludeId
    );
    if (duplicate) throw conflict('La entidad ya tiene una imagen principal');
  }
};

const withSlug = async (type, data, excludeId) => {
  if (!sluggedTypes.includes(type) || !data.name) return data;
  const candidate = await generateUniqueSlug(data.name, (slug) => catalogRepository.existsBySlug(type, slug, excludeId));
  return { ...data, slug: candidate };
};

const list = (type, options) => catalogRepository.findAll(type, options);
const getById = async (type, id) => {
  const document = await catalogRepository.findById(type, id);
  if (!document) throw notFound(type);
  return document;
};

const create = async (type, data) => {
  const payload = { ...data };
  await assertRelations(type, payload);
  await assertUniqueFlags(type, payload);
  if (type === 'users' && payload.password) {
    payload.password_hash = await hashPassword(payload.password);
    delete payload.password;
  }
  return catalogRepository.create(type, await withSlug(type, payload));
};

const update = async (type, id, data) => {
  const current = await getById(type, id);
  const payload = { ...data };
  if (type === 'images') {
    if (!payload.entity_type) payload.entity_type = current.entity_type;
    if (!payload.entity_id) payload.entity_id = current.entity_id._id || current.entity_id;
  }
  await assertRelations(type, payload);
  if (type === 'variants' && payload.is_default === true && !payload.product_id) {
    payload.product_id = current.product_id._id || current.product_id;
  }
  if (type === 'variants' && payload.compare_at_price !== undefined && payload.price === undefined) {
    payload.price = decimalNumber(current.price);
  }
  if (type === 'variants' && payload.price !== undefined && payload.compare_at_price === undefined) {
    payload.compare_at_price = current.compare_at_price === null ? null : decimalNumber(current.compare_at_price);
  }
  if (type === 'images') {
    payload.entity_model = entityModels[payload.entity_type][0];
  }
  await assertUniqueFlags(type, payload, id);
  if (type === 'users' && payload.password) {
    payload.password_hash = await hashPassword(payload.password);
    delete payload.password;
  }
  if (sluggedTypes.includes(type) && payload.name && payload.name !== current.name) {
    const renamed = await withSlug(type, payload, id);
    Object.assign(payload, renamed);
  }
  const document = await catalogRepository.updateById(type, id, payload);
  if (!document) throw notFound(type);
  return document;
};

const remove = async (type, id) => {
  const current = await getById(type, id);
  if (await catalogRepository.hasReferences(type, id)) {
    throw conflict(`No se puede eliminar ${type}: existen registros relacionados`);
  }
  return catalogRepository.deleteById(type, current._id);
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key)));
  });
  return `scrypt$${salt}$${derived.toString('hex')}`;
};

module.exports = { list, getById, create, update, remove, hashPassword };
