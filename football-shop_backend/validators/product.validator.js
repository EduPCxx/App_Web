const { z } = require('zod');
const { SLUG_REGEX } = require('../utils/slugify');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'El ID debe ser un ObjectId válido');
const requiredText = (field) =>
  z.string({ required_error: `El campo "${field}" es obligatorio` }).trim().min(1, `El campo "${field}" es obligatorio`);
const status = z.enum(['draft', 'active', 'archived']);
const productFields = {
  name: requiredText('name').min(2).max(150),
  category_id: objectId,
  brand_id: objectId,
  description: z.string().trim().max(1000).optional(),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const createBody = z.object(productFields);
const updateBody = createBody.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un campo para actualizar'
});
const idParams = z.object({ id: objectId });
const slugParams = z.object({
  slug: z.string().max(160).regex(SLUG_REGEX, 'El slug solo puede contener letras minúsculas, números y guiones')
});
const emptyToUndefined = (schema) => z.preprocess((value) => (value === '' ? undefined : value), schema);

const createProductSchema = z.object({ body: createBody });
const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    category_id: emptyToUndefined(objectId.optional()),
    brand_id: emptyToUndefined(objectId.optional()),
    status: emptyToUndefined(status.optional()),
    isActive: emptyToUndefined(z.enum(['true', 'false']).transform((value) => value === 'true').optional()),
    search: z.string().trim().optional(),
    sortBy: emptyToUndefined(z.enum(['name', 'status', 'createdAt']).default('createdAt')),
    order: emptyToUndefined(
      z.preprocess((value) => (typeof value === 'string' ? value.toLowerCase() : value), z.enum(['asc', 'desc']).default('desc'))
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
  body: z.object({ isActive: z.boolean({ required_error: 'El campo "isActive" es obligatorio' }) })
});

module.exports = {
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
