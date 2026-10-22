const mongoose = require('mongoose');
const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');
const { CATEGORIES } = require('../models/product.model');

const FIELDS = ['name', 'category', 'team', 'price', 'stock', 'brand', 'size', 'description'];
const STRING_FIELDS = ['name', 'team', 'brand', 'size', 'description'];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`El ID "${id}" no es válido`, 400);
  }
};

// Filtra campos permitidos y valida reglas de negocio.
// partial=true → solo valida los campos presentes (actualización).
const validateAndPick = (data = {}, { partial = false } = {}) => {
  const errors = [];
  const clean = {};

  FIELDS.forEach((field) => {
    if (data[field] !== undefined) clean[field] = data[field];
  });

  if (!partial) {
    FIELDS.forEach((field) => {
      if (clean[field] === undefined || clean[field] === null || clean[field] === '') {
        errors.push({ field, message: `El campo "${field}" es obligatorio` });
      }
    });
  } else if (Object.keys(clean).length === 0) {
    throw new AppError('Debes enviar al menos un campo para actualizar', 400);
  }

  STRING_FIELDS.forEach((field) => {
    if (clean[field] !== undefined) {
      if (typeof clean[field] !== 'string' || clean[field].trim() === '') {
        errors.push({ field, message: `El campo "${field}" debe ser un texto no vacío` });
      } else {
        clean[field] = clean[field].trim();
      }
    }
  });

  if (clean.category !== undefined && !CATEGORIES.includes(clean.category)) {
    errors.push({ field: 'category', message: `La categoría debe ser una de: ${CATEGORIES.join(', ')}` });
  }

  if (clean.price !== undefined) {
    if (typeof clean.price !== 'number' || Number.isNaN(clean.price) || clean.price < 0) {
      errors.push({ field: 'price', message: 'El precio debe ser un número mayor o igual a 0' });
    } else {
      clean.price = Math.round(clean.price * 100) / 100;
    }
  }

  if (clean.stock !== undefined) {
    if (!Number.isInteger(clean.stock) || clean.stock < 0) {
      errors.push({ field: 'stock', message: 'El stock debe ser un entero mayor o igual a 0' });
    }
  }

  if (errors.length) throw new AppError('Error de validación', 400, errors);
  return clean;
};

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.team) filter.team = new RegExp(`^${escapeRegex(query.team)}$`, 'i');
  if (query.brand) filter.brand = new RegExp(`^${escapeRegex(query.brand)}$`, 'i');
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) {
      const min = Number(query.minPrice);
      if (Number.isNaN(min)) throw new AppError('minPrice debe ser numérico', 400);
      filter.price.$gte = min;
    }
    if (query.maxPrice !== undefined) {
      const max = Number(query.maxPrice);
      if (Number.isNaN(max)) throw new AppError('maxPrice debe ser numérico', 400);
      filter.price.$lte = max;
    }
  }
  return filter;
};

const SORTABLE = ['name', 'price', 'stock', 'createdAt'];

const buildSort = (sortBy = 'createdAt', order = 'desc') => {
  if (!SORTABLE.includes(sortBy)) {
    throw new AppError(`sortBy debe ser uno de: ${SORTABLE.join(', ')}`, 400);
  }
  return { [sortBy]: String(order).toLowerCase() === 'asc' ? 1 : -1 };
};

const createProduct = async (data) => productRepository.create(validateAndPick(data));

const listProducts = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
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
};

const getProductById = async (id) => {
  assertValidId(id);
  const product = await productRepository.findById(id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

const updateProduct = async (id, data) => {
  assertValidId(id);
  const clean = validateAndPick(data, { partial: true });
  const product = await productRepository.updateById(id, clean);
  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

const deleteProduct = async (id) => {
  assertValidId(id);
  const product = await productRepository.deleteById(id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

module.exports = { createProduct, listProducts, getProductById, updateProduct, deleteProduct };
