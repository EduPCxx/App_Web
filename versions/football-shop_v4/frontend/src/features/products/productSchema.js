import { z } from 'zod';

export const CATEGORIES = ['Camisetas', 'Botas', 'Balones', 'Equipamiento', 'Accesorios'];

export const EMPTY_PRODUCT = {
  name: '',
  category: '',
  team: 'N/A',
  price: '',
  stock: '',
  brand: '',
  size: '',
  description: '',
  isActive: true
};

// Los inputs HTML devuelven strings: se validan como texto y productService los convierte a número.
// Mismas reglas que el backend (validators/product.validator.js) para dar feedback inmediato.
const requiredText = (message) => z.string().trim().min(1, message);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(150, 'Máximo 150 caracteres.'),
  category: z.string().refine((value) => CATEGORIES.includes(value), 'Selecciona una categoría.'),
  team: requiredText('El equipo es obligatorio (usa N/A si no aplica).'),
  brand: requiredText('La marca es obligatoria.'),
  size: requiredText('La talla/tamaño es obligatoria.'),
  price: requiredText('Indica un precio.').refine(
    (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
    'Indica un precio válido (0 o superior).'
  ),
  stock: requiredText('Indica el stock.').refine(
    (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
    'El stock debe ser un entero (0 o superior).'
  ),
  description: requiredText('La descripción es obligatoria.').max(1000, 'Máximo 1000 caracteres.'),
  isActive: z.boolean()
});

// Producto de la API → valores del formulario
export const toFormValues = (product) => ({
  name: product.name,
  category: product.category,
  team: product.team,
  price: String(product.price),
  stock: String(product.stock),
  brand: product.brand,
  size: product.size,
  description: product.description,
  isActive: product.isActive !== false
});
