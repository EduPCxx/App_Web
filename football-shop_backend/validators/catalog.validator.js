const { z } = require('zod');
const { STATUSES } = require('../utils/lifecycle');
const { SLUG_REGEX } = require('../utils/slugify');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'El ID debe ser un ObjectId válido');
const text = (max = 200) => z.string().trim().min(1).max(max);
const status = z.enum(STATUSES);
const categoryFields = {
  name: text(100),
  description: z.string().trim().max(500).optional(),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const brandFields = {
  name: text(100),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const variantFields = {
  product_id: objectId,
  name: text(150),
  sku: text(100),
  price: z.number().finite().min(0),
  stock: z.number().int().min(0).optional(),
  compare_at_price: z.number().finite().min(0).nullable().optional(),
  attributes: z.record(z.unknown()).optional(),
  is_default: z.boolean().optional(),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const imageFields = {
  entity_type: z.enum(['product', 'variant', 'brand', 'category']),
  entity_id: objectId,
  url: z.string().url(),
  alt_text: z.string().trim().max(250).optional(),
  title: z.string().trim().max(250).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_primary: z.boolean().optional(),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const roleFields = {
  name: text(100),
  description: z.string().trim().max(500).optional(),
  status: status.optional(),
  isActive: z.boolean().optional()
};
const userFields = {
  role_id: objectId,
  name: text(150),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  isActive: z.boolean().optional(),
  status: status.optional()
};

const makeBodySchemas = (fields, updateFields = fields) => ({
  create: z.object(fields),
  update: z.object(updateFields).partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar'
  })
});
const statusAction = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ status })
});
const activeAction = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ isActive: z.boolean() })
});
const idAction = z.object({ params: z.object({ id: objectId }) });
const slugAction = z.object({
  params: z.object({
    slug: z.string().max(160).regex(SLUG_REGEX, 'El slug solo puede contener letras minúsculas, números y guiones')
  })
});
const sluggedTypes = new Set(['categories', 'brands']);

const schemas = Object.fromEntries(
  Object.entries({
    categories: categoryFields,
    brands: brandFields,
    variants: variantFields,
    images: imageFields,
    roles: roleFields,
    users: userFields
  }).map(([type, fields]) => {
    const body = makeBodySchemas(fields, type === 'users' ? { ...userFields, password: z.string().min(8).max(128).optional() } : fields);
    return [
      type,
      {
        create: z.object({ body: body.create }),
        update: z.object({ params: z.object({ id: objectId }), body: body.update }),
        get: z.object({ params: z.object({ id: objectId }) }),
        ...(sluggedTypes.has(type) ? { getBySlug: slugAction } : {}),
        list: z.object({
          query: z.object({
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(100).default(10)
          })
        }),
        remove: idAction,
        softDelete: idAction,
        restore: idAction,
        setActive: activeAction,
        setStatus: statusAction
      }
    ];
  })
);

module.exports = schemas;
