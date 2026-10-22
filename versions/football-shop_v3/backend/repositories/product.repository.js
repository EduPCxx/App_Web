const Product = require('../models/product.model');
const wrapDbError = require('../utils/wrapDbError');

const findAll = async (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
  try {
    return await Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
  } catch (error) {
    throw wrapDbError(error, 'listar los productos');
  }
};

const count = async (filter = {}) => {
  try {
    return await Product.countDocuments(filter);
  } catch (error) {
    throw wrapDbError(error, 'contar los productos');
  }
};

const findById = async (id) => {
  try {
    return await Product.findById(id).lean();
  } catch (error) {
    throw wrapDbError(error, 'obtener el producto');
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
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  } catch (error) {
    throw wrapDbError(error, 'actualizar el producto');
  }
};

const deleteById = async (id) => {
  try {
    return await Product.findByIdAndDelete(id).lean();
  } catch (error) {
    throw wrapDbError(error, 'eliminar el producto');
  }
};

module.exports = { findAll, count, findById, create, updateById, deleteById };
