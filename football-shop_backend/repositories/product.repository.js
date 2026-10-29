const Product = require('../models/product.model');
const wrapDbError = require('../utils/wrapDbError');

const scoped = (filter = {}) => ({ ...filter, deletedAt: null });
const normalizeDecimals = (value) => {
  if (Array.isArray(value)) return value.map(normalizeDecimals);
  if (!value || typeof value !== 'object') return value;
  if (value._bsontype === 'Decimal128') return value.toString();
  if (value._bsontype) return value;
  delete value.entity_model;
  for (const key of Object.keys(value)) value[key] = normalizeDecimals(value[key]);
  return value;
};
const populateProduct = (query) =>
  query
    .populate('category_id')
    .populate('brand_id')
    .populate('variants')
    .populate({ path: 'images', populate: 'entity_id' });

const findAll = async (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
  try {
    return normalizeDecimals(await populateProduct(Product.find(scoped(filter)).sort(sort).skip(skip).limit(limit)).lean());
  } catch (error) {
    throw wrapDbError(error, 'listar los productos');
  }
};

const count = async (filter = {}) => {
  try {
    return await Product.countDocuments(scoped(filter));
  } catch (error) {
    throw wrapDbError(error, 'contar los productos');
  }
};

const findById = async (id) => {
  try {
    return normalizeDecimals(await populateProduct(Product.findOne(scoped({ _id: id }))).lean());
  } catch (error) {
    throw wrapDbError(error, 'obtener el producto');
  }
};

const findBySlug = async (slug) => {
  try {
    return await populateProduct(Product.findOne(scoped({ slug }))).lean();
  } catch (error) {
    throw wrapDbError(error, 'obtener el producto por slug');
  }
};

const create = async (data) => {
  try {
    const product = await Product.create(data);
    return findById(product._id);
  } catch (error) {
    throw wrapDbError(error, 'crear el producto');
  }
};

const updateById = async (id, data) => {
  try {
    const product = await Product.findOneAndUpdate(scoped({ _id: id }), data, {
      new: true,
      runValidators: true
    });
    return product ? findById(product._id) : null;
  } catch (error) {
    throw wrapDbError(error, 'actualizar el producto');
  }
};

const softDeleteBySlug = async (slug) => {
  try {
    const product = await Product.findOneAndUpdate(scoped({ slug }), { deletedAt: new Date() }, { new: true });
    return product ? findByIdIncludingDeleted(product._id) : null;
  } catch (error) {
    throw wrapDbError(error, 'eliminar lógicamente el producto');
  }
};

const findByIdIncludingDeleted = async (id) => normalizeDecimals(await populateProduct(Product.findById(id)).lean());

const setActiveBySlug = async (slug, isActive) => {
  try {
    const product = await Product.findOneAndUpdate(scoped({ slug }), { isActive }, { new: true });
    return product ? findById(product._id) : null;
  } catch (error) {
    throw wrapDbError(error, 'cambiar la visibilidad del producto');
  }
};

const getStatsRaw = async () => {
  try {
    const [result] = await Product.aggregate([
      { $match: { deletedAt: null } },
      { $lookup: { from: 'variants', localField: '_id', foreignField: 'product_id', as: 'variants' } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: ['$isActive', 1, 0] } },
                outOfStock: {
                  $sum: { $cond: [{ $eq: [{ $sum: '$variants.stock' }, 0] }, 1, 0] }
                },
                units: { $sum: { $sum: '$variants.stock' } },
                inventoryValue: {
                  $sum: {
                    $reduce: {
                      input: '$variants',
                      initialValue: 0,
                      in: { $add: ['$$value', { $multiply: [{ $toDouble: '$$this.price' }, '$$this.stock'] }] }
                    }
                  }
                }
              }
            }
          ],
          byCategory: [
            { $group: { _id: '$category_id', count: { $sum: 1 } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            { $project: { _id: { $ifNull: ['$category.name', 'Sin categoría'] }, count: 1 } },
            { $sort: { count: -1, _id: 1 } }
          ]
        }
      }
    ]);
    return result;
  } catch (error) {
    throw wrapDbError(error, 'calcular las estadísticas');
  }
};

const deleteById = async (id) => {
  try {
    return await Product.findOneAndDelete(scoped({ _id: id })).lean();
  } catch (error) {
    throw wrapDbError(error, 'eliminar el producto');
  }
};

const slugExists = async (slug, excludeId = null) => {
  try {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await Product.exists(filter));
  } catch (error) {
    throw wrapDbError(error, 'comprobar el slug');
  }
};

module.exports = {
  findAll,
  count,
  findById,
  findBySlug,
  create,
  updateById,
  softDeleteBySlug,
  setActiveBySlug,
  getStatsRaw,
  deleteById,
  slugExists
};
