# Postman — Football Shop API

**Base URL:** `http://localhost:3000`

## Flujo de catálogo

### 1. Crear categoría

`POST {{baseUrl}}/api/categories`

```json
{ "name": "Camisetas", "description": "Camisetas oficiales y de entrenamiento", "status": "active" }
```

Guarda `data._id` como `categoryId`.

### 2. Crear marca

`POST {{baseUrl}}/api/brands`

```json
{ "name": "Nike", "status": "active" }
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
  "status": "active"
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
- `GET {{baseUrl}}/api/brands`
- `GET {{baseUrl}}/api/variants`
- `GET {{baseUrl}}/api/images`
- `GET {{baseUrl}}/api/dashboard/stats`

Los endpoints de categorías, marcas, productos, variantes e imágenes soportan consulta por ID y, cuando corresponda, actualización con `PUT` y eliminación con `DELETE`. No se elimina una entidad si tiene recursos dependientes.
