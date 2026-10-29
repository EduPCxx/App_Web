# Football Shop Backend

API REST para el catálogo de una tienda de fútbol. Usa Node.js, Express, MongoDB y Mongoose con arquitectura route → middleware → controller → service → repository → model.

## Requisitos e instalación

- Node.js 18 o superior
- MongoDB local o MongoDB Atlas

```bash
npm install
```

Configura `MONGODB_URI` en `.env` (por defecto, `mongodb://127.0.0.1:27017/football_products`) y arranca la API:

```bash
npm start
npm run dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

## Migración desde el modelo anterior

La estructura de productos cambió de forma incompatible: `category` y `brand` ahora son referencias, y `price`, `stock`, `team` y `size` se guardan en variantes.

Haz una copia de seguridad de MongoDB y ejecuta la migración **antes** de desplegar esta versión:

```bash
npm run migrate:catalog
```

La migración crea las categorías y marcas a partir de los datos existentes, convierte cada producto en una referencia relacional y crea una variante inicial con su precio, stock, talla y equipo. Es repetible para registros ya convertidos. Si la base de datos aún no tiene `slug`, ejecuta también `npm run migrate:slug` antes de la migración de catálogo.

## Esquema

- **Category**: nombre, slug, descripción, estado y visibilidad.
- **Brand**: nombre, slug, estado y visibilidad.
- **Product**: `category_id` y `brand_id` (`ObjectId`), nombre, slug, descripción, estado y visibilidad.
- **Variant**: `product_id`, SKU único, precio decimal, stock entero, atributos y variante predeterminada.
- **Image**: URL, metadatos y asociación polimórfica a producto, variante, marca o categoría.
- **Role / User**: roles y usuarios; `role_id` referencia a `Role` y `password_hash` nunca se devuelve en las respuestas.

Las lecturas de repositorio cargan las relaciones con `populate()`. Los servicios verifican las referencias antes de guardar y evitan borrar registros que todavía tienen dependencias.

## Endpoints

| Método | Ruta | Uso |
|---|---|---|
| `GET`, `POST` | `/api/categories` | Listar y crear categorías |
| `GET`, `PUT`, `DELETE` | `/api/categories/:id` | Consultar y gestionar una categoría |
| `GET`, `POST` | `/api/brands` | Listar y crear marcas |
| `GET`, `PUT`, `DELETE` | `/api/brands/:id` | Consultar y gestionar una marca |
| `GET`, `POST` | `/api/products` | Listar y crear productos |
| `GET`, `PUT`, `DELETE` | `/api/products/:id` | Consultar y gestionar un producto |
| `GET`, `PUT` | `/api/products/slug/:slug` | Consultar o actualizar por slug |
| `PATCH` | `/api/products/slug/:slug/soft-delete` | Borrado lógico |
| `PATCH` | `/api/products/slug/:slug/is-active` | Cambiar visibilidad |
| `GET`, `POST` | `/api/variants` | Listar y crear variantes |
| `GET`, `PUT`, `DELETE` | `/api/variants/:id` | Consultar y gestionar una variante |
| `GET`, `POST` | `/api/images` | Listar y asociar imágenes |
| `GET`, `PUT`, `DELETE` | `/api/images/:id` | Consultar y gestionar una imagen |
| `GET` | `/api/dashboard/stats` | Estadísticas del catálogo |

Los IDs de relación se validan como `ObjectId` y la entidad asociada debe existir. Por ejemplo, para crear un producto:

```json
{
  "name": "Camiseta FC Barcelona",
  "category_id": "66b1f0c2a4d3e5f6a7b8c9d0",
  "brand_id": "66b1f0c2a4d3e5f6a7b8c9d1",
  "description": "Camiseta oficial de local.",
  "status": "active"
}
```

Después crea su variante en `POST /api/variants`:

```json
{
  "product_id": "66b1f0c2a4d3e5f6a7b8c9d2",
  "name": "Talla M",
  "sku": "FCB-HOME-M",
  "price": 99.95,
  "stock": 25,
  "attributes": { "size": "M", "team": "FC Barcelona" },
  "is_default": true
}
```

Los precios se almacenan como `Decimal128` y se devuelven como texto decimal para conservar su precisión. El seed inicial es idempotente y no borra datos:

```bash
npm run seed
```

## Pruebas y errores

```bash
npm test
```

Las respuestas de error siguen `{ "success": false, "error": { "code": "...", "message": "..." } }`. Las relaciones inexistentes responden `404`; los registros relacionados que impiden borrar responden `409`; los datos inválidos responden `400`.

Cada modelo tiene capas de repository, service y route propias; las capas de categorías, marcas, variantes e imágenes delegan en la implementación común del catálogo para conservar sus validaciones y reglas de relaciones. Las rutas de `Role` y `User` están definidas, pero no se montan en `app.js`: no se debe habilitar su gestión HTTP hasta incorporar autenticación y autorización.
