import { FiHome, FiPackage } from 'react-icons/fi';

// Para añadir una sección al panel basta con añadir un elemento aquí y su ruta en AppRoutes
export const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [{ to: '/', label: 'Dashboard', icon: FiHome, end: true }]
  },
  {
    section: 'Gestión',
    items: [{ to: '/products', label: 'Productos', icon: FiPackage, end: false }]
  }
];

// Títulos del navbar (el orden importa: las rutas fijas antes que las dinámicas)
export const ROUTE_TITLES = [
  { path: '/', title: 'Dashboard' },
  { path: '/products', title: 'Productos' },
  { path: '/products/new', title: 'Crear producto' },
  { path: '/products/:slug', title: 'Detalle del producto' },
  { path: '/products/:slug/edit', title: 'Editar producto' }
];
