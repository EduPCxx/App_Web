# Football Shop — Admin Dashboard (React)

Panel de administración para la API REST de productos (Express + MongoDB), con la estructura del dashboard de
referencia: **sidebar + navbar**, vista general con estadísticas, listados y formularios.
Stack: React + Vite, shadcn/ui + Tailwind, Axios, React Hook Form + Zod, SweetAlert2, React Router (lazy) y React Icons.

## Requisitos

- Node.js 18+
- Backend en `http://localhost:3000` con las migraciones de catálogo y ciclo de vida aplicadas

## Uso

```bash
npm install
npm run dev      # http://localhost:4200
npm run build    # build de producción en dist/
```

`.env`: `VITE_API_URL=http://localhost:3000/api`

## Pantallas y API

| Pantalla            | Ruta                    | API                                          |
|---------------------|-------------------------|----------------------------------------------|
| Dashboard           | `/`                     | `GET /api/dashboard/stats`                   |
| Listado (tabla)     | `/products`             | `GET /api/products?limit=100`                |
| Crear               | `/products/new`         | `POST /api/products`                         |
| Editar              | `/products/:id/edit`    | `PUT /api/products/:id`                      |
| Activar/Desactivar  | tabla                   | `PATCH /api/products/:id/is-active`          |
| Eliminar (soft)     | tabla                   | `PATCH /api/products/:id/soft-delete`        |

## Gestión del catálogo

El panel también permite gestionar categorías (`/categories`), marcas (`/brands`), variantes (`/variants`), roles (`/roles`) y usuarios (`/users`) desde tablas y formularios normales. Las imágenes se gestionan desde los formularios de producto pegando URLs; se pueden previsualizar, reordenar, marcar la principal y quitar antes de guardar. El panel no muestra una sección de imágenes en el menú lateral.

El precio, stock y SKU del producto se derivan de sus variantes. Categorías y variantes muestran sus campos descriptivos y de inventario en las tablas.

## Arquitectura

```text
src/
  components/ui/       # shadcn/ui: button, card, input, select, textarea, label, badge, skeleton
  components/layout/   # AdminSidebar, Navbar
  components/common/   # DataTable, StatCard, PageHeader, ActiveBadge, Skeletons, ErrorState, ErrorBoundary
  features/products/   # productSchema (Zod) y ProductForm
  features/catalog/    # Esquemas, formularios y listados compartidos para los modelos del catálogo
  layouts/             # MainLayout (sidebar + navbar + Suspense + ErrorBoundary, menú móvil)
  pages/               # dashboard/, products/, categories/, brands/, variants/, images/, roles/, users/
  routes/              # AppRoutes con React.lazy (code splitting)
  config/              # navigation.js (menú y títulos), env.js
  context/             # AppContext (catálogo global, carga única)
  hooks/               # Hooks de productos, catálogo, dashboard y contexto
  services/            # apiService (Axios), servicios por modelo y dashboardService
  repositories/        # productRepository, dashboardRepository (solo HTTP)
  utils/               # cn, format, ApiError, alerts (SweetAlert2)
```

Flujo: `page → hook → context → service → repository → apiService → API`.

- **Añadir una sección** (p. ej. otra entidad): una entrada en `config/navigation.js`, su ruta en `AppRoutes` y sus páginas/servicios.
- **Errores:** el interceptor de Axios normaliza red, timeout, HTTP y validación en un `ApiError`; el contexto los captura y los muestra con SweetAlert2 (texto escapado).
- **Tema:** gris oscuro como fondo, blanco para texto y acciones principales, y dorado reservado para acentos en navegación, gráficos y foco.
