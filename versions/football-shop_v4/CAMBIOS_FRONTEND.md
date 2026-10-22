# v5 — Frontend rehecho como dashboard (referencia: 2_dashboard)

## Qué cambió
**Frontend:** pasa de tienda a **panel de administración** con la estructura del dashboard de referencia:
sidebar (menú móvil con drawer) + navbar con título por ruta, vista general con tarjetas de estadísticas y desglose por categoría,
`DataTable` reutilizable (ver / editar / activar-desactivar / eliminar), detalle, formularios (React Hook Form + Zod),
`AuthContext` preparado sin login, y la misma paleta (crema + azul petróleo, Space Grotesk, tarjetas redondeadas).
Se mantiene lo de v4: Axios con interceptores, SweetAlert2, `AppContext` con carga única, lazy + Suspense, skeletons, ErrorBoundary y páginas 404/error. Todo por `slug`.

**Backend** (dos cosas nuevas que el dashboard necesita):
- `isActive` en el modelo + `PATCH /api/products/slug/:slug/is-active`; `GET /api/products?isActive=`; el formulario de crear/editar acepta `isActive`.
- `GET /api/dashboard/stats` (agregación en MongoDB: totales, activos, agotados, unidades, valor del inventario, por categoría).
- Tests ampliados (`npm test`): activar/desactivar y transformación de estadísticas.

## Cómo arrancar
```bash
cd backend  && npm install && npm run migrate:slug   # o npm run seed
cd backend  && npm run dev
cd frontend && npm install && npm run dev            # http://localhost:4200
```
**Vuelve a ejecutar `npm run migrate:slug`** aunque ya la corriste: ahora también rellena `isActive`. Es idempotente.

## Supuestos y puntos a revisar
1. **No he podido ejecutar el frontend** (sin red, no hay `npm install` ni `vite build`). Comprobé que los 49 archivos compilan con esbuild, que todos los imports resuelven y que los iconos existen; no he visto la interfaz en un navegador. Prueba el listado, crear, editar, activar/desactivar y eliminar.
2. **Diseño:** tomé la paleta y el layout del dashboard, pero **sin el degradado de fondo ni el desenfoque “glass”**, para mantener la línea minimalista que pediste antes. Si quieres el fondo con degradados, es un `background-image` en `index.css`.
3. **Una sola entidad:** football-shop solo tiene productos, así que el menú tiene Dashboard y Productos. Las categorías son una lista fija, no una entidad (no hay CRUD de categorías, variantes, usuarios…).
4. **Cambio de comportamiento:** la tienda pública con tarjetas desaparece; ahora el listado es una tabla de administración. Las estadísticas se piden cada vez que abres el Dashboard.
5. **Un producto sin `isActive`** (datos anteriores a la migración) se muestra como activo en el frontend; la migración lo deja explícito en la base de datos.
6. **Slug nuevo al renombrar** un producto (la app navega a la URL nueva), `new` reservado, catálogo limitado a 100 productos en el listado (límite de la API).
7. **Sin autenticación**, como en la referencia: cualquiera con acceso a la API puede editar. `AuthContext` y el token `Bearer` están listos para cuando la añadas.
8. Versiones de dependencias de tu 2_dashboard, salvo `tailwind-merge ^2.6` (la v3 es para Tailwind 4 y el proyecto usa Tailwind 3).
