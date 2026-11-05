import { z } from 'zod';

export const EMPTY_PRODUCT = {
  name: '',
  category_id: '',
  brand_id: '',
  description: '',
  status: 'draft',
  isActive: true
};

const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Selecciona ${label}.`);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(150, 'Máximo 150 caracteres.'),
  category_id: objectId('una categoría'),
  brand_id: objectId('una marca'),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres.'),
  status: z.enum(['draft', 'active', 'archived']),
  isActive: z.boolean()
});

export const toFormValues = (product) => ({
  name: product.name,
  category_id: product.category_id?._id || product.category_id || '',
  brand_id: product.brand_id?._id || product.brand_id || '',
  description: product.description || '',
  status: product.status || 'draft',
  isActive: product.isActive !== false
});
