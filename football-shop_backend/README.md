# Football Shop Backend

API REST para el catálogo de una tienda de fútbol. Usa Node.js, Express, MongoDB y Mongoose con arquitectura route → middleware → controller → service → repository → model.

## Requisitos e instalación

- Node.js 18 o superior
- MongoDB local o MongoDB Atlas

```bash
npm install
```

Configura `MONGODB_URI` en `.env` (por defecto, MongoDB usa `mongodb://127.0.0.1:27017/football_products`). Arranca la API:

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
npm run migrate:lifecycle
```

La migración crea las categorías y marcas a partir de los datos existentes, convierte cada producto en una referencia relacional y crea una variante inicial con su precio, stock, talla y equipo. Es repetible para registros ya convertidos. Si la base de datos aún no tiene `slug`, ejecuta también `npm run migrate:slug` antes de la migración de catálogo.
Ejecuta `migrate:lifecycle` después para completar estados, visibilidad, borrado lógico y slugs de categorías/marcas anteriores.

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
| `PATCH` | `/api/products/:id/soft-delete` | Borrado lógico por ID |
| `PATCH` | `/api/products/:id/restore` | Restaurar un producto eliminado |
| `PATCH` | `/api/products/:id/is-active` | Cambiar visibilidad por ID |
| `PATCH` | `/api/products/:id/status` | Avanzar estado del producto |
| `GET`, `PUT`, `PATCH` | `/api/products/slug/:slug...` | Endpoints antiguos compatibles por slug |
| `GET`, `POST` | `/api/variants` | Listar y crear variantes |
| `GET`, `PUT`, `DELETE` | `/api/variants/:id` | Consultar y gestionar una variante |
| `GET`, `POST` | `/api/images` | Listar y asociar imágenes |
| `GET`, `PUT`, `DELETE` | `/api/images/:id` | Consultar y gestionar una imagen |
| `GET`, `POST` | `/api/roles` | Listar y crear roles (requiere clave de administración) |
| `GET`, `PUT`, `DELETE` | `/api/roles/:id` | Consultar y gestionar roles |
| `GET`, `POST` | `/api/users` | Listar y crear usuarios (requiere clave de administración) |
| `GET`, `PUT`, `DELETE` | `/api/users/:id` | Consultar y gestionar usuarios |
| `GET` | `/api/dashboard/stats` | Estadísticas del catálogo |

Categorías, marcas, variantes, imágenes, roles y usuarios también admiten `PATCH /:id/soft-delete`, `PATCH /:id/restore`, `PATCH /:id/is-active` y `PATCH /:id/status`. El cambio de estado sigue las transiciones `pending → processing → published → finished`, permitiendo cancelar desde `pending`, `processing` o `published`; `finished` y `cancelled` son finales. Una transición inválida devuelve `422`.

Los IDs de relación se validan como `ObjectId` y la entidad asociada debe existir. Por ejemplo, para crear un producto:

```json
{
  "name": "Camiseta FC Barcelona",
  "category_id": "66b1f0c2a4d3e5f6a7b8c9d0",
  "brand_id": "66b1f0c2a4d3e5f6a7b8c9d1",
  "description": "Camiseta oficial de local.",
  "status": "pending"
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

Roles y Usuarios se gestionan desde sus tablas y formularios como el resto del catálogo. Para crear usuarios se envía `password`; el backend guarda un hash scrypt y nunca devuelve ni acepta `password_hash`. El seed crea `cliente@example.test` con una contraseña aleatoria si no se define `SEED_USER_PASSWORD`.

El formulario de producto permite añadir imágenes pegando sus URLs, muestra una previsualización, avisa si una imagen no carga y permite ordenarlas, elegir la principal o eliminarlas antes de guardar. Las imágenes quedan asociadas mediante `entity_type` y `entity_id`. No se muestra una sección independiente de imágenes en el menú lateral.

## Pruebas y errores

```bash
npm test
```

Las respuestas de error siguen `{ "success": false, "error": { "code": "...", "message": "..." } }`. Las relaciones inexistentes responden `404`; los registros relacionados que impiden borrar responden `409`; los datos inválidos responden `400`.

Cada modelo tiene capas de repository, service y route propias; las capas de categorías, marcas, variantes, imágenes, roles y usuarios delegan en la implementación común del catálogo para conservar sus validaciones y reglas de relaciones.
