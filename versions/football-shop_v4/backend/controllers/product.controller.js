const productService = require('../services/product.service');

const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Producto creado correctamente', data: product });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const { items, pagination } = await productService.listProducts(req.query);
    res.status(200).json({ success: true, data: items, pagination });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Producto actualizado correctamente', data: product });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Producto eliminado correctamente', data: product });
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateBySlug = async (req, res, next) => {
  try {
    const product = await productService.updateProductBySlug(req.params.slug, req.body);
    res.status(200).json({ success: true, message: 'Producto actualizado correctamente', data: product });
  } catch (error) {
    next(error);
  }
};

const softDeleteBySlug = async (req, res, next) => {
  try {
    const product = await productService.softDeleteProductBySlug(req.params.slug);
    res.status(200).json({ success: true, message: 'Producto eliminado correctamente', data: product });
  } catch (error) {
    next(error);
  }
};

const setActiveBySlug = async (req, res, next) => {
  try {
    const product = await productService.setProductActiveBySlug(req.params.slug, req.body.isActive);
    const message = product.isActive ? 'Producto activado correctamente' : 'Producto desactivado correctamente';
    res.status(200).json({ success: true, message, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, getById, update, remove, getBySlug, updateBySlug, softDeleteBySlug, setActiveBySlug };
