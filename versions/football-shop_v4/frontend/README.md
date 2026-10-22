# Football Shop — Admin Dashboard (React)

Panel de administración para la API REST de productos (Express + MongoDB), con la estructura del dashboard de
referencia: **sidebar + navbar**, vista general con estadísticas, tabla reutilizable, detalle y formularios.
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

## Pantallas y API (todo por `slug`)

| Pantalla            | Ruta                    | API                                          |
|---------------------|-------------------------|----------------------------------------------|
| Dashboard           | `/`                     | `GET /api/dashboard/stats`                   |
| Listado (tabla)     | `/products`             | `GET /api/products?limit=100`                |
| Detalle             | `/products/:slug`       | `GET /api/products/slug/:slug`               |
| Crear               | `/products/new`         | `POST /api/products`                         |
| Editar              | `/products/:slug/edit`  | `PUT /api/products/slug/:slug`               |
| Activar/Desactivar  | tabla y detalle         | `PATCH /api/products/slug/:slug/is-active`   |
| Eliminar (soft)     | tabla y detalle         | `PATCH /api/products/slug/:slug/soft-delete` |

## Arquitectura

```text
src/
  components/ui/       # shadcn/ui: button, card, input, select, textarea, label, badge, skeleton
  components/layout/   # AdminSidebar, Navbar
  components/common/   # DataTable, StatCard, PageHeader, ActiveBadge, Skeletons, ErrorState, ErrorBoundary
  features/products/   # productSchema (Zod) y ProductForm
  layouts/             # MainLayout (sidebar + navbar + Suspense + ErrorBoundary, menú móvil)
  pages/               # dashboard/, products/ (lista, detalle, crear, editar), 404 y error
  routes/              # AppRoutes con React.lazy (code splitting)
  config/              # navigation.js (menú y títulos), env.js
  context/             # AppContext (catálogo global, carga única) y AuthContext (preparado, sin login)
  hooks/               # useProducts, useProduct, useDashboardStats, useAuth, useAppContext
  services/            # apiService (Axios), productService, dashboardService
  repositories/        # productRepository, dashboardRepository (solo HTTP)
  utils/               # cn, format, ApiError, alerts (SweetAlert2)
```

Flujo: `page → hook → context → service → repository → apiService → API`.

- **Añadir una sección** (p. ej. otra entidad): una entrada en `config/navigation.js`, su ruta en `AppRoutes` y sus páginas/servicios.
- **Auth preparada:** `AuthContext.login({ token, profile })` guarda el token en `apiService`, que lo envía como `Bearer` en cada petición.
- **Errores:** el interceptor de Axios normaliza red, timeout, HTTP y validación en un `ApiError`; el contexto los captura y los muestra con SweetAlert2 (texto escapado).
- **Tema:** colores en las variables CSS de `src/index.css` (paleta del dashboard de referencia).
