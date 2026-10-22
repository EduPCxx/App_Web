# ⚽ Football Products — Frontend React

Frontend React + Vite para la API REST de productos de fútbol (Express + MongoDB).

## Requisitos

- Node.js 18+
- La API del backend ejecutándose en `http://localhost:3000`

## Instalación y uso

```bash
npm install
cp .env.example .env   # opcional: ya se incluye un .env listo para usar
npm run dev
```

La aplicación queda disponible en `http://localhost:4200`.

> Si en el backend restringes `CORS_ORIGIN`, añade `http://localhost:4200`.

## Configuración

`.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Cámbialo si la API está en otro host o puerto.

## Scripts

| Comando           | Descripción                           |
|-------------------|---------------------------------------|
| `npm run dev`     | Servidor de desarrollo (puerto 4200)  |
| `npm run build`   | Build de producción en `dist/`        |
| `npm run preview` | Sirve el build de producción          |

## Funcionalidades

- Listado paginado con búsqueda por texto y filtro por categoría (`GET /api/products`)
- Detalle (`GET /api/products/:id`)
- Crear (`POST /api/products`)
- Editar (`PUT /api/products/:id`)
- Eliminar (`DELETE /api/products/:id`)
- Validación del formulario con las mismas reglas que el backend
- Estados de carga y manejo de errores de la API

## Arquitectura

La estructura del backend se adapta al cliente, manteniendo la misma separación de responsabilidades:

```text
src/
  routes/          # AppRoutes.jsx → definición de rutas (equivale a routes/ del backend)
  pages/           # Pantallas (equivale a controllers/): gestionan estado y eventos
  components/      # Piezas de UI reutilizables
  hooks/           # useProduct: carga de un producto por ID
  services/        # productService.js → validaciones, normalización y reglas
  repositories/    # httpClient.js y productRepository.js → acceso a la API
  models/          # product.js → categorías y producto vacío
  utils/           # ApiError y formateo de precios/fechas
  App.jsx
  main.jsx
  styles.css
```

Flujo: `page → service → repository → httpClient → API`.

## Rutas

| Ruta                  | Pantalla          |
|-----------------------|-------------------|
| `/products`           | Listado           |
| `/products/new`       | Crear producto    |
| `/products/:id`       | Detalle           |
| `/products/:id/edit`  | Editar producto   |
