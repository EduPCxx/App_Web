import { FiHome, FiPackage, FiTag, FiLayers, FiShield, FiUsers } from 'react-icons/fi';

// Para añadir una sección al panel basta con añadir un elemento aquí y su ruta en AppRoutes
export const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [{ to: '/', label: 'Dashboard', icon: FiHome, end: true }]
  },
  {
    section: 'Gestión',
    items: [
      { to: '/products', label: 'Productos', icon: FiPackage, end: false },
      { to: '/categories', label: 'Categorías', icon: FiLayers, end: false },
      { to: '/brands', label: 'Marcas', icon: FiTag, end: false },
      { to: '/variants', label: 'Variantes', icon: FiPackage, end: false }
    ]
  },
  {
    section: 'Seguridad',
    items: [
      { to: '/roles', label: 'Roles', icon: FiShield, end: false },
      { to: '/users', label: 'Usuarios', icon: FiUsers, end: false }
    ]
  }
];

// Títulos del navbar (el orden importa: las rutas fijas antes que las dinámicas)
export const ROUTE_TITLES = [
  { path: '/', title: 'Dashboard' },
  { path: '/products', title: 'Productos' },
  { path: '/products/new', title: 'Crear producto' },
  { path: '/products/:id/edit', title: 'Editar producto' },
  { path: '/categories', title: 'Categorías' },
  { path: '/categories/new', title: 'Crear categoría' },
  { path: '/categories/:id/edit', title: 'Editar categoría' },
  { path: '/brands', title: 'Marcas' },
  { path: '/brands/new', title: 'Crear marca' },
  { path: '/brands/:id/edit', title: 'Editar marca' },
  { path: '/variants', title: 'Variantes' },
  { path: '/variants/new', title: 'Crear variante' },
  { path: '/variants/:id/edit', title: 'Editar variante' },
  { path: '/images', title: 'Imágenes' },
  { path: '/images/new', title: 'Crear imagen' },
  { path: '/images/:id/edit', title: 'Editar imagen' },
  { path: '/roles', title: 'Roles' },
  { path: '/users', title: 'Usuarios' }
];
