import { z } from 'zod';

const requiredText = (message) => z.string().trim().min(1, message);
const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `${label} debe ser un ID válido.`);
const statuses = ['pending', 'processing', 'published', 'finished', 'cancelled'];
const status = {
  name: 'status',
  label: 'Estado',
  type: 'select',
  required: true,
  options: [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'En proceso' },
    { value: 'published', label: 'Publicado' },
    { value: 'finished', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' }
  ]
};
const active = { name: 'isActive', label: 'Activo', type: 'checkbox' };

export const catalogEntities = {
  categories: {
    label: 'Categorías',
    singular: 'categoría',
    hook: 'categories',
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea' },
      status,
      active
    ],
    schema: z.object({
      name: requiredText('El nombre es obligatorio.').max(100),
      description: z.string().max(500).optional(),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: { name: '', description: '', status: 'pending', isActive: true }
  },
  brands: {
    label: 'Marcas',
    singular: 'marca',
    hook: 'brands',
    fields: [{ name: 'name', label: 'Nombre', required: true }, status, active],
    schema: z.object({
      name: requiredText('El nombre es obligatorio.').max(100),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: { name: '', status: 'pending', isActive: true }
  },
  variants: {
    label: 'Variantes',
    singular: 'variante',
    hook: 'variants',
    fields: [
      { name: 'product_id', label: 'Producto', type: 'relation', required: true, resource: 'products' },
      { name: 'name', label: 'Nombre', required: true },
      { name: 'sku', label: 'SKU', required: true },
      { name: 'price', label: 'Precio', type: 'number', required: true },
      { name: 'stock', label: 'Stock', type: 'number', required: true },
      { name: 'compare_at_price', label: 'Precio anterior', type: 'number' },
      { name: 'attributes', label: 'Atributos (JSON)', type: 'textarea' },
      { name: 'is_default', label: 'Variante predeterminada', type: 'checkbox' },
      status,
      active
    ],
    schema: z.object({
      product_id: objectId('El producto'),
      name: requiredText('El nombre es obligatorio.').max(150),
      sku: requiredText('El SKU es obligatorio.').max(100),
      compare_at_price: z.preprocess(
        (value) => (value === '' || value === null ? null : value),
        z.union([z.null(), z.coerce.number().finite().min(0)])
      ),
      price: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().finite().min(0)),
      stock: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().int().min(0)),
      attributes: z.string().refine((value) => {
        try {
          return value === '' || (JSON.parse(value) !== null && typeof JSON.parse(value) === 'object' && !Array.isArray(JSON.parse(value)));
        } catch {
          return false;
        }
      }, 'Los atributos deben ser un objeto JSON válido.'),
      is_default: z.boolean(),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: {
      product_id: '',
      name: '',
      sku: '',
      price: '',
      stock: 0,
      compare_at_price: '',
      attributes: '{}',
      is_default: false,
      status: 'pending',
      isActive: true
    }
  },
  images: {
    label: 'Imágenes',
    singular: 'imagen',
    hook: 'images',
    fields: [
      { name: 'entity_type', label: 'Tipo de entidad', type: 'select', required: true, options: ['product', 'variant', 'brand', 'category'] },
      { name: 'entity_id', label: 'Entidad asociada', type: 'relation', required: true, resourceFrom: 'entity_type' },
      { name: 'url', label: 'URL', type: 'url', required: true },
      { name: 'alt_text', label: 'Texto alternativo' },
      { name: 'title', label: 'Título' },
      { name: 'sort_order', label: 'Orden', type: 'number' },
      { name: 'is_primary', label: 'Imagen principal', type: 'checkbox' },
      status,
      active
    ],
    schema: z.object({
      entity_type: z.enum(['product', 'variant', 'brand', 'category']),
      entity_id: objectId('La entidad asociada'),
      url: z.string().url('Indica una URL válida.'),
      alt_text: z.string().max(250).optional(),
      title: z.string().max(250).optional(),
      sort_order: z.coerce.number().int().min(0),
      is_primary: z.boolean(),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: {
      entity_type: 'product',
      entity_id: '',
      url: '',
      alt_text: '',
      title: '',
      sort_order: 0,
      is_primary: false,
      status: 'pending',
      isActive: true
    }
  },
  roles: {
    label: 'Roles',
    singular: 'rol',
    hook: 'roles',
    fields: [{ name: 'name', label: 'Nombre', required: true }, { name: 'description', label: 'Descripción', type: 'textarea' }, status, active],
    schema: z.object({
      name: requiredText('El nombre es obligatorio.').max(100),
      description: z.string().max(500).optional(),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: { name: '', description: '', status: 'pending', isActive: true },
    protected: true
  },
  users: {
    label: 'Usuarios',
    singular: 'usuario',
    hook: 'users',
    fields: [
      { name: 'role_id', label: 'Rol', type: 'relation', required: true, resource: 'roles' },
      { name: 'name', label: 'Nombre', required: true },
      { name: 'email', label: 'Correo', type: 'email', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', required: true },
      status,
      active
    ],
    schema: z.object({
      role_id: objectId('El rol'),
      name: requiredText('El nombre es obligatorio.').max(150),
      email: z.string().email('Indica un correo válido.'),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    updateSchema: z.object({
      role_id: objectId('El rol'),
      name: requiredText('El nombre es obligatorio.').max(150),
      email: z.string().email('Indica un correo válido.'),
      password: z.union([z.literal(''), z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.')]).optional(),
      status: z.enum(statuses),
      isActive: z.boolean()
    }),
    initialValues: { role_id: '', name: '', email: '', password: '', status: 'pending', isActive: true },
    protected: true
  }
};
