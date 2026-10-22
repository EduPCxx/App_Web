const Product = require('../models/product.model');

const findAll = (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) =>
  Product.find(filter).sort(sort).skip(skip).limit(limit).lean();

const count = (filter = {}) => Product.countDocuments(filter);

const findById = (id) => Product.findById(id).lean();

const create = async (data) => {
  const product = await Product.create(data);
  return product.toObject();
};

const updateById = (id, data) =>
  Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

const deleteById = (id) => Product.findByIdAndDelete(id).lean();

module.exports = { findAll, count, findById, create, updateById, deleteById };
