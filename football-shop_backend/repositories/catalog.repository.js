const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Product = require('../models/product.model');
const Variant = require('../models/variant.model');
const Image = require('../models/image.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const wrapDbError = require('../utils/wrapDbError');

const models = { categories: Category, brands: Brand, products: Product, variants: Variant, images: Image, roles: Role, users: User };
const populatePaths = {
  categories: [
    { path: 'products', populate: [{ path: 'brand_id' }, { path: 'variants' }] },
    { path: 'images', populate: 'entity_id' }
  ],
  brands: [
    { path: 'products', populate: [{ path: 'category_id' }, { path: 'variants' }] },
    { path: 'images', populate: 'entity_id' }
  ],
  products: ['category_id', 'brand_id', 'variants', { path: 'images', populate: 'entity_id' }],
  variants: [
    { path: 'product_id', populate: [{ path: 'category_id' }, { path: 'brand_id' }] },
    { path: 'images', populate: 'entity_id' }
  ],
  images: ['entity_id'],
  roles: ['users'],
  users: ['role_id']
};
const normalizeDecimals = (value) => {
  if (Array.isArray(value)) return value.map(normalizeDecimals);
  if (!value || typeof value !== 'object') return value;
  if (value._bsontype === 'Decimal128') return value.toString();
  if (value._bsontype) return value;
  delete value.entity_model;
  for (const key of Object.keys(value)) value[key] = normalizeDecimals(value[key]);
  return value;
};

const findAll = async (type, { skip = 0, limit = 100, sort = { createdAt: -1 } } = {}) => {
  try {
    let query = models[type].find({ deletedAt: null }).sort(sort).skip(skip).limit(limit);
    for (const path of populatePaths[type] || []) query = query.populate(path);
    return normalizeDecimals(await query.lean());
  } catch (error) {
    throw wrapDbError(error, `listar ${type}`);
  }
};

const findById = async (type, id) => {
  try {
    let query = models[type].findOne({ _id: id, deletedAt: null });
    for (const path of populatePaths[type] || []) query = query.populate(path);
    return normalizeDecimals(await query.lean());
  } catch (error) {
    throw wrapDbError(error, `obtener ${type}`);
  }
};

const create = async (type, data) => {
  try {
    const document = await models[type].create(data);
    return findById(type, document._id);
  } catch (error) {
    throw wrapDbError(error, `crear ${type}`);
  }
};

const updateById = async (type, id, data) => {
  try {
    const document = await models[type].findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    );
    return document ? findById(type, document._id) : null;
  } catch (error) {
    throw wrapDbError(error, `actualizar ${type}`);
  }
};

const deleteById = async (type, id) => {
  try {
    return await models[type].findOneAndDelete({ _id: id, deletedAt: null }).lean();
  } catch (error) {
    throw wrapDbError(error, `eliminar ${type}`);
  }
};

const exists = async (type, id) => {
  try {
    return Boolean(await models[type].exists({ _id: id, deletedAt: null }));
  } catch (error) {
    throw wrapDbError(error, `comprobar ${type}`);
  }
};

const existsBySlug = async (type, slug, excludeId) => {
  try {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await models[type].exists(filter));
  } catch (error) {
    throw wrapDbError(error, `comprobar slug de ${type}`);
  }
};

const hasReferences = async (type, id) => {
  const checks = {
    categories: async () =>
      (await Product.exists({ category_id: id })) || (await Image.exists({ entity_type: 'category', entity_id: id })),
    brands: async () =>
      (await Product.exists({ brand_id: id })) || (await Image.exists({ entity_type: 'brand', entity_id: id })),
    products: async () => (await Variant.exists({ product_id: id })) || (await Image.exists({ entity_type: 'product', entity_id: id })),
    variants: () => Image.exists({ entity_type: 'variant', entity_id: id }),
    roles: () => User.exists({ role_id: id }),
    images: async () => false
  };
  try {
    return checks[type] ? Boolean(await checks[type]()) : false;
  } catch (error) {
    throw wrapDbError(error, `comprobar relaciones de ${type}`);
  }
};

const findDuplicateFlag = async (type, filter, excludeId) => {
  try {
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await models[type].exists(filter));
  } catch (error) {
    throw wrapDbError(error, `comprobar restricciones de ${type}`);
  }
};

module.exports = { models, findAll, findById, create, updateById, deleteById, exists, existsBySlug, hasReferences, findDuplicateFlag };
