# Football Shop — Admin Dashboard (React)

Panel de administración para la API REST de productos (Express + MongoDB), con la estructura del dashboard de
referencia: **sidebar + navbar**, vista general con estadísticas, listados y formularios.
Stack: React + Vite, shadcn/ui + Tailwind, Axios, React Hook Form + Zod, SweetAlert2, React Router (lazy) y React Icons.

## Requisitos

- Node.js 18+
- Backend en `http://localhost:3000` con la migración aplicada: `npm run migrate:slug`

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

El panel también permite gestionar categorías (`/categories`), marcas (`/brands`), variantes (`/variants`) e imágenes (`/images`) mediante listados y formularios conectados a sus endpoints CRUD. Los formularios de productos seleccionan categoría y marca; el precio y el stock se muestran a partir de las variantes asociadas.

Los modelos Role y User tienen sus servicios, hooks y configuración de formularios preparados, pero sus páginas muestran que la gestión está deshabilitada: el backend todavía no monta esas rutas hasta disponer de autenticación y autorización.

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
