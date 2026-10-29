const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'El ID debe ser un ObjectId válido');
const text = (max = 200) => z.string().trim().min(1).max(max);
const status = z.enum(['draft', 'active', 'archived']);
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

const makeBodySchemas = (fields) => ({
  create: z.object(fields),
  update: z.object(fields).partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar'
  })
});

const schemas = Object.fromEntries(
  Object.entries({
    categories: categoryFields,
    brands: brandFields,
    variants: variantFields,
    images: imageFields
  }).map(([type, fields]) => {
    const body = makeBodySchemas(fields);
    return [
      type,
      {
        create: z.object({ body: body.create }),
        update: z.object({ params: z.object({ id: objectId }), body: body.update }),
        get: z.object({ params: z.object({ id: objectId }) }),
        list: z.object({ query: z.object({}) }),
        remove: z.object({ params: z.object({ id: objectId }) })
      }
    ];
  })
);

module.exports = schemas;
