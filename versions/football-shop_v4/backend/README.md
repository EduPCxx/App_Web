# ⚽ API REST de Productos de Fútbol

API REST para gestionar un catálogo de productos de fútbol (camisetas, botas, balones, equipamiento y accesorios).

**Stack:** Node.js · Express · MongoDB · Mongoose · Zod · Helmet · Morgan · Swagger/OpenAPI · CORS

## Arquitectura

```
football-products-api/
├── config/          # Conexión a MongoDB y configuración de Swagger
├── routes/          # Endpoints (+ anotaciones Swagger) y validate() por ruta
├── validators/      # Esquemas Zod por endpoint ({ body, params, query })
├── middlewares/     # validate.middleware y error.middleware (404 + errorHandler)
├── controllers/     # Entrada/salida HTTP
├── services/        # Validaciones, reglas de negocio y orquestación
├── repositories/    # Acceso a MongoDB
├── models/          # Esquemas Mongoose
├── utils/           # AppError, slugify y helpers
├── app.js           # Configuración de Express
├── server.js        # Arranque del servidor
├── seed.js          # Datos de ejemplo
├── .env.example
├── Postman.md
└── package.json
```

Flujo: `route → validate (Zod) → controller → service → repository → model (MongoDB)`.

## Requisitos

* Node.js 18 o superior
* MongoDB en local (`mongodb://127.0.0.1:27017`) o una URI de MongoDB Atlas

## Instalación

```bash
npm install
```

## Configuración

Se incluye un `.env` listo para desarrollo local. Si no existe, cópialo desde el ejemplo:

```bash
cp .env.example .env
```

| Variable      | Descripción                                             | Valor por defecto                              |
|---------------|---------------------------------------------------------|------------------------------------------------|
| `PORT`        | Puerto del servidor                                     | `3000`                                         |
| `MONGODB_URI` | URI de conexión a MongoDB                               | `mongodb://127.0.0.1:27017/football_products`  |
| `CORS_ORIGIN` | Orígenes permitidos (separados por comas) o `*`         | `*`                                            |
| `NODE_ENV`    | `development` o `production`                            | `development`                                  |

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo con recarga automática (nodemon)
```

* API: http://localhost:3000/api/products
* Swagger UI: http://localhost:3000/api-docs
* Especificación OpenAPI (JSON): http://localhost:3000/api-docs.json
* Health check: http://localhost:3000/health

## Seed (datos de ejemplo)

```bash
npm run seed
```

⚠️ Elimina todos los productos existentes e inserta 15 productos de ejemplo.

## Endpoints

| Método | Ruta                 | Descripción                       |
|--------|----------------------|-----------------------------------|
| POST   | `/api/products`      | Crear producto                    |
| GET    | `/api/products`      | Listar productos (filtros y paginación) |
| GET    | `/api/products/:id`  | Obtener producto por ID           |
| PUT    | `/api/products/:id`  | Actualizar producto (parcial)     |
| DELETE | `/api/products/:id`  | Eliminar producto (físico)        |
| GET    | `/api/products/slug/:slug` | Obtener producto por slug   |
| PUT    | `/api/products/slug/:slug` | Actualizar por slug (si cambia `name`, se regenera el slug) |
| PATCH  | `/api/products/slug/:slug/is-active` | Activar/desactivar. Body `{ "isActive": boolean }` |
| PATCH  | `/api/products/slug/:slug/soft-delete` | Borrado lógico (`deletedAt`) |
| GET    | `/api/dashboard/stats` | Estadísticas del catálogo (totales, agotados, valor del inventario, por categoría) |

Los productos con `deletedAt` no aparecen en listados ni consultas. El slug se genera desde `name` (`slug`, `slug-2`…) y `new` está reservado.

**Migración (BD existente):** `npm run migrate:slug` rellena `slug`, `deletedAt` e `isActive`; ejecútala antes de arrancar (se puede repetir sin problema). `GET /api/products` acepta `?isActive=true|false`.

### Modelo de producto

| Campo         | Tipo    | Reglas                                                             |
|---------------|---------|--------------------------------------------------------------------|
| `name`        | String  | Obligatorio, 2–150 caracteres                                      |
| `category`    | String  | `Camisetas`, `Botas`, `Balones`, `Equipamiento`, `Accesorios`      |
| `team`        | String  | Obligatorio (`N/A` si no aplica)                                   |
| `price`       | Number  | Obligatorio, ≥ 0                                                   |
| `stock`       | Integer | Obligatorio, ≥ 0                                                   |
| `brand`       | String  | Obligatorio                                                        |
| `size`        | String  | Obligatorio (`S`, `M`, `L`, `XL`, `Talla 5`, `42`...)              |
| `description` | String  | Obligatorio, máx. 1000 caracteres                                  |

### Parámetros de listado

`category`, `team`, `brand`, `search`, `minPrice`, `maxPrice`, `sortBy` (`name|price|stock|createdAt`), `order` (`asc|desc`), `page`, `limit` (máx. 100).

Ejemplo: `GET /api/products?category=Botas&brand=Nike&minPrice=100&sortBy=price&order=asc`

## Formato de errores

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada no válidos",
    "details": [{ "field": "body.price", "message": "El precio debe ser un número mayor o igual a 0" }]
  }
}
```

`details` solo aparece en errores de validación. Códigos: `VALIDATION_ERROR` (400) · `INVALID_JSON` (400) · `NOT_FOUND` (404) · `DUPLICATE_KEY` (409) · `INTERNAL_ERROR` / `DATABASE_ERROR` (500).
En `production` los 500 devuelven siempre "Error interno del servidor"; en `development` incluyen `stack`.

## Logging y seguridad

* `helmet()` con configuración por defecto (primer middleware).
* `morgan`: `dev` en development, `combined` en production, desactivado con `NODE_ENV=test`.

## Documentación de requests

Consulta [`Postman.md`](./Postman.md) para ejemplos de requests y responses.
