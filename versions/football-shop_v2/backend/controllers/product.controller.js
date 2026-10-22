const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: 'Producto creado correctamente', data: product });
});

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await productService.listProducts(req.query);
  res.status(200).json({ success: true, data: items, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Producto actualizado correctamente', data: product });
});

const remove = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Producto eliminado correctamente', data: product });
});

module.exports = { create, list, getById, update, remove };
