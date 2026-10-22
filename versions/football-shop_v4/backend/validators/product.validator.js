const { z } = require('zod');
const { CATEGORIES } = require('../models/product.model');
const { SLUG_REGEX } = require('../utils/slugify');

const SORTABLE = ['name', 'price', 'stock', 'createdAt'];

// ---------- helpers ----------
const requiredText = (field) =>
  z
    .string({
      required_error: `El campo "${field}" es obligatorio`,
      invalid_type_error: `El campo "${field}" debe ser un texto no vacío`
    })
    .trim()
    .min(1, `El campo "${field}" debe ser un texto no vacío`);

// '' en la query se trata como "no enviado" (igual que hacía el servicio antes)
const emptyToUndefined = (schema) => z.preprocess((value) => (value === '' ? undefined : value), schema);

const queryNumber = (field) => z.coerce.number({ invalid_type_error: `${field} debe ser numérico` });

const objectId = z
  .string({ required_error: 'El ID es obligatorio', invalid_type_error: 'El ID no es válido' })
  .regex(/^[0-9a-fA-F]{24}$/, 'El ID no es válido (debe ser un ObjectId de 24 caracteres hexadecimales)');

const idParams = z.object({ id: objectId });

const slugParams = z.object({
  slug: z
    .string({ required_error: 'El slug es obligatorio', invalid_type_error: 'El slug no es válido' })
    .max(160, 'El slug no puede superar los 160 caracteres')
    .regex(SLUG_REGEX, 'El slug no es válido (solo a-z, 0-9 y guiones)')
});

// ---------- campos del producto ----------
const productFields = {
  name: requiredText('name')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: `La categoría debe ser una de: ${CATEGORIES.join(', ')}` })
  }),
  team: requiredText('team'),
  price: z
    .number({
      required_error: 'El campo "price" es obligatorio',
      invalid_type_error: 'El precio debe ser un número mayor o igual a 0'
    })
    .finite('El precio debe ser un número mayor o igual a 0')
    .min(0, 'El precio debe ser un número mayor o igual a 0')
    .transform((value) => Math.round(value * 100) / 100),
  stock: z
    .number({
      required_error: 'El campo "stock" es obligatorio',
      invalid_type_error: 'El stock debe ser un entero mayor o igual a 0'
    })
    .int('El stock debe ser un entero mayor o igual a 0')
    .min(0, 'El stock debe ser un entero mayor o igual a 0'),
  brand: requiredText('brand'),
  size: requiredText('size'),
  description: requiredText('description').max(1000, 'La descripción no puede superar los 1000 caracteres')
};

// .strip() (por defecto) descarta los campos desconocidos sin rechazar la petición, como hacía el servicio
const createBody = z.object({
  ...productFields,
  isActive: z.boolean({ invalid_type_error: 'isActive debe ser true o false' }).optional()
});
const updateBody = createBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' });

// ---------- esquemas por endpoint ----------
const createProductSchema = z.object({ body: createBody });

const listProductsSchema = z.object({
  query: z.object({
    page: queryNumber('page').int('page debe ser un entero').min(1, 'page debe ser mayor o igual a 1').default(1),
    limit: queryNumber('limit')
      .int('limit debe ser un entero')
      .min(1, 'limit debe ser mayor o igual a 1')
      .max(100, 'limit no puede ser mayor que 100')
      .default(10),
    category: emptyToUndefined(productFields.category.optional()),
    isActive: emptyToUndefined(
      z.enum(['true', 'false'], { errorMap: () => ({ message: 'isActive debe ser true o false' }) })
        .transform((value) => value === 'true')
        .optional()
    ),
    team: z.string({ invalid_type_error: 'team debe ser un texto' }).trim().optional(),
    brand: z.string({ invalid_type_error: 'brand debe ser un texto' }).trim().optional(),
    search: z.string({ invalid_type_error: 'search debe ser un texto' }).trim().optional(),
    minPrice: queryNumber('minPrice').optional(),
    maxPrice: queryNumber('maxPrice').optional(),
    sortBy: emptyToUndefined(
      z
        .enum(SORTABLE, { errorMap: () => ({ message: `sortBy debe ser uno de: ${SORTABLE.join(', ')}` }) })
        .default('createdAt')
    ),
    order: emptyToUndefined(
      z.preprocess(
        (value) => (typeof value === 'string' ? value.toLowerCase() : value),
        z.enum(['asc', 'desc'], { errorMap: () => ({ message: 'order debe ser asc o desc' }) }).default('desc')
      )
    )
  })
});

const getProductSchema = z.object({ params: idParams });

const updateProductSchema = z.object({ params: idParams, body: updateBody });

const deleteProductSchema = z.object({ params: idParams });

const getProductBySlugSchema = z.object({ params: slugParams });

const updateProductBySlugSchema = z.object({ params: slugParams, body: updateBody });

const softDeleteProductBySlugSchema = z.object({ params: slugParams });

const setProductActiveBySlugSchema = z.object({
  params: slugParams,
  body: z.object({
    isActive: z.boolean({
      required_error: 'El campo "isActive" es obligatorio',
      invalid_type_error: 'isActive debe ser true o false'
    })
  })
});

module.exports = {
  SORTABLE,
  createProductSchema,
  listProductsSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  getProductBySlugSchema,
  updateProductBySlugSchema,
  softDeleteProductBySlugSchema,
  setProductActiveBySlugSchema
};
