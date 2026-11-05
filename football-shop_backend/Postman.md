# Postman — Football Shop API

**Base URL:** `http://localhost:3000`

## Flujo de catálogo

### 1. Crear categoría

`POST {{baseUrl}}/api/categories`

```json
{ "name": "Camisetas", "description": "Camisetas oficiales y de entrenamiento", "status": "pending" }
```

Guarda `data._id` como `categoryId`.

### 2. Crear marca

`POST {{baseUrl}}/api/brands`

```json
{ "name": "Nike", "status": "pending" }
```

Guarda `data._id` como `brandId`.

### 3. Crear producto

`POST {{baseUrl}}/api/products`

```json
{
  "name": "Camiseta FC Barcelona",
  "category_id": "{{categoryId}}",
  "brand_id": "{{brandId}}",
  "description": "Camiseta oficial de local.",
  "status": "pending"
}
```

La respuesta incluye la categoría y la marca cargadas. Guarda `data._id` como `productId`.

### 4. Crear variante

`POST {{baseUrl}}/api/variants`

```json
{
  "product_id": "{{productId}}",
  "name": "Talla M",
  "sku": "FCB-HOME-M",
  "price": 99.95,
  "stock": 25,
  "attributes": { "size": "M", "team": "FC Barcelona" },
  "is_default": true
}
```

El SKU debe ser único. Un producto solo puede tener una variante predeterminada.

### 5. Asociar imagen

`POST {{baseUrl}}/api/images`

```json
{
  "entity_type": "product",
  "entity_id": "{{productId}}",
  "url": "https://example.com/images/camiseta-fcb.jpg",
  "alt_text": "Camiseta de local del FC Barcelona",
  "is_primary": true
}
```

`entity_type` acepta `product`, `variant`, `brand` o `category`; la entidad referenciada debe existir. Solo puede haber una imagen principal por entidad.

## Consultas

- `GET {{baseUrl}}/api/products?category_id={{categoryId}}`
- `GET {{baseUrl}}/api/products/{{productId}}`
- `GET {{baseUrl}}/api/products/slug/camiseta-fc-barcelona`
- `GET {{baseUrl}}/api/categories`
- `GET {{baseUrl}}/api/categories/slug/camisetas`
- `GET {{baseUrl}}/api/brands`
- `GET {{baseUrl}}/api/brands/slug/nike`
- `GET {{baseUrl}}/api/variants`
- `GET {{baseUrl}}/api/images`
- `GET {{baseUrl}}/api/dashboard/stats`

Los listados aceptan `page` (por defecto `1`) y `limit` (por defecto `10`, máximo `100`).

Los endpoints de categorías, marcas, productos, variantes e imágenes soportan consulta por ID y, cuando corresponda, actualización con `PUT` y eliminación con `DELETE`. No se elimina una entidad si tiene recursos dependientes.

Todos los recursos admiten borrado lógico y restauración (`PATCH /:id/soft-delete` y `PATCH /:id/restore`), cambio de visibilidad (`PATCH /:id/is-active`, cuerpo `{ "isActive": false }`) y transición de estado (`PATCH /:id/status`, cuerpo `{ "status": "processing" }`). Los estados avanzan `pending → processing → published → finished`; `cancelled` también puede alcanzarse desde `pending`, `processing` o `published`. `finished` y `cancelled` son finales.

## Gestión de imágenes desde el formulario de producto

El formulario acepta una URL pública por cada imagen. Después de crear el producto, crea la relación polimórfica:

```json
{
  "entity_type": "product",
  "entity_id": "{{productId}}",
  "url": "{{imageUrl}}",
  "alt_text": "Camiseta azul y granate",
  "sort_order": 0,
  "is_primary": true
}
```

El formulario permite pegar varias URLs, previsualizarlas, cambiar el orden, elegir una imagen principal y eliminar imágenes antes de guardar.

## Roles y usuarios

### Crear rol

`POST {{baseUrl}}/api/roles`

```json
{ "name": "Administrador", "description": "Gestiona el catálogo", "status": "pending", "isActive": true }
```

### Crear usuario

`POST {{baseUrl}}/api/users`

```json
{
  "role_id": "{{roleId}}",
  "name": "Alex García",
  "email": "alex@example.com",
  "password": "cambia-esta-clave",
  "status": "pending",
  "isActive": true
}
```

La respuesta omite la contraseña y su hash. Para actualizar la contraseña envía un nuevo campo `password`; al omitirlo se conserva la existente. Roles y usuarios admiten `GET` colección/ID, `PUT /:id` y `DELETE /:id`.
