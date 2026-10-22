const Product = require('../models/product.model');
const wrapDbError = require('../utils/wrapDbError');

// Borrado lógico centralizado: toda lectura/escritura normal pasa por scoped().
// En Mongo `deletedAt: null` también casa con documentos que aún no tienen el campo.
const scoped = (filter = {}) => ({ ...filter, deletedAt: null });

const findAll = async (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
  try {
    return await Product.find(scoped(filter)).sort(sort).skip(skip).limit(limit).lean();
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
    return await Product.findOne(scoped({ _id: id })).lean();
  } catch (error) {
    throw wrapDbError(error, 'obtener el producto');
  }
};

const findBySlug = async (slug) => {
  try {
    return await Product.findOne(scoped({ slug })).lean();
  } catch (error) {
    throw wrapDbError(error, 'obtener el producto por slug');
  }
};

const create = async (data) => {
  try {
    const product = await Product.create(data);
    return product.toObject();
  } catch (error) {
    throw wrapDbError(error, 'crear el producto');
  }
};

const updateById = async (id, data) => {
  try {
    return await Product.findOneAndUpdate(scoped({ _id: id }), data, { new: true, runValidators: true }).lean();
  } catch (error) {
    throw wrapDbError(error, 'actualizar el producto');
  }
};

const softDeleteBySlug = async (slug) => {
  try {
    return await Product.findOneAndUpdate(scoped({ slug }), { deletedAt: new Date() }, { new: true }).lean();
  } catch (error) {
    throw wrapDbError(error, 'eliminar lógicamente el producto');
  }
};

const setActiveBySlug = async (slug, isActive) => {
  try {
    return await Product.findOneAndUpdate(scoped({ slug }), { isActive }, { new: true }).lean();
  } catch (error) {
    throw wrapDbError(error, 'cambiar la visibilidad del producto');
  }
};

// Agregación para el dashboard (productos no borrados). Un producto sin `isActive` cuenta como activo.
const getStatsRaw = async () => {
  try {
    const [result] = await Product.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $ne: ['$isActive', false] }, 1, 0] } },
                outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
                units: { $sum: '$stock' },
                inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } }
              }
            }
          ],
          byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]
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

// El slug es único entre TODOS los registros, también los borrados lógicamente
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
