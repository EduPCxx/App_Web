import { z } from 'zod';
import { normalizeStatus } from '@/utils/status';

export const EMPTY_PRODUCT = {
  name: '',
  category_id: '',
  brand_id: '',
  description: '',
  status: 'pending',
  isActive: true,
  images: []
};

const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Selecciona ${label}.`);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(150, 'Máximo 150 caracteres.'),
  category_id: objectId('una categoría'),
  brand_id: objectId('una marca'),
  description: z.string().trim().max(1000, 'Máximo 1000 caracteres.'),
  status: z.enum(['pending', 'processing', 'published', 'finished', 'cancelled']),
  isActive: z.boolean()
});

export const toFormValues = (product) => {
  const images = (product.images || [])
    .map((image) => ({
      ...image,
      is_primary: Boolean(image.is_primary),
      sort_order: image.sort_order || 0
    }))
    .sort((left, right) => left.sort_order - right.sort_order);
  if (images.length && !images.some((image) => image.is_primary)) images[0].is_primary = true;

  return {
    name: product.name,
    category_id: product.category_id?._id || product.category_id || '',
    brand_id: product.brand_id?._id || product.brand_id || '',
    description: product.description || '',
    status: normalizeStatus(product.status),
    isActive: product.isActive !== false,
    images
  };
};
