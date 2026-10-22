# Postman – API de Productos de Fútbol

**Base URL:** `http://localhost:3000`
**Headers en POST/PUT:** `Content-Type: application/json`

> Tip: en Postman, crea una variable de entorno `baseUrl = http://localhost:3000` y una `productId` con el `_id` de un producto.

---

## 1. Crear producto

`POST {{baseUrl}}/api/products`

**Body (raw → JSON):**
```json
{
  "name": "Camiseta Oficial 1ª Equipación",
  "category": "Camisetas",
  "team": "FC Barcelona",
  "price": 99.95,
  "stock": 25,
  "brand": "Nike",
  "size": "M",
  "description": "Camiseta oficial de la temporada 2024/25."
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Producto creado correctamente",
  "data": {
    "_id": "66b1f0c2a4d3e5f6a7b8c9d0",
    "name": "Camiseta Oficial 1ª Equipación",
    "category": "Camisetas",
    "team": "FC Barcelona",
    "price": 99.95,
    "stock": 25,
    "brand": "Nike",
    "size": "M",
    "description": "Camiseta oficial de la temporada 2024/25.",
    "createdAt": "2024-08-06T10:15:30.000Z",
    "updatedAt": "2024-08-06T10:15:30.000Z"
  }
}
```

**Response `400 Bad Request`** (body inválido):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada no válidos",
    "details": [
      { "field": "body.category", "message": "La categoría debe ser una de: Camisetas, Botas, Balones, Equipamiento, Accesorios" },
      { "field": "body.price", "message": "El precio debe ser un número mayor o igual a 0" }
    ]
  }
}
```

---

## 2. Listar productos

`GET {{baseUrl}}/api/products`

**Query params opcionales:**

| Param      | Ejemplo        | Descripción                                   |
|------------|----------------|-----------------------------------------------|
| `category` | `Botas`        | Filtra por categoría                          |
| `team`     | `Real Madrid`  | Filtra por equipo                             |
| `brand`    | `Nike`         | Filtra por marca                              |
| `search`   | `oficial`      | Texto en nombre o descripción                 |
| `minPrice` | `50`           | Precio mínimo                                 |
| `maxPrice` | `150`          | Precio máximo                                 |
| `sortBy`   | `price`        | `name`, `price`, `stock`, `createdAt`         |
| `order`    | `asc`          | `asc` o `desc`                                |
| `page`     | `1`            | Página                                        |
| `limit`    | `10`           | Elementos por página (máx. 100)               |

Ejemplo: `GET {{baseUrl}}/api/products?category=Balones&sortBy=price&order=asc&limit=2`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66b1f0c2a4d3e5f6a7b8c9d1",
      "name": "Balón de Entrenamiento Club",
      "category": "Balones",
      "team": "FC Barcelona",
      "price": 24.99,
      "stock": 60,
      "brand": "Nike",
      "size": "Talla 4",
      "description": "Balón de entrenamiento resistente para césped natural y artificial.",
      "createdAt": "2024-08-06T10:00:00.000Z",
      "updatedAt": "2024-08-06T10:00:00.000Z"
    },
    {
      "_id": "66b1f0c2a4d3e5f6a7b8c9d2",
      "name": "Balón Oficial LaLiga Accelerate",
      "category": "Balones",
      "team": "N/A",
      "price": 149.99,
      "stock": 35,
      "brand": "Puma",
      "size": "Talla 5",
      "description": "Balón oficial de partido con tecnología FIFA Quality Pro.",
      "createdAt": "2024-08-06T10:00:00.000Z",
      "updatedAt": "2024-08-06T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 2, "total": 3, "totalPages": 2 }
}
```

---

## 3. Obtener producto por ID

`GET {{baseUrl}}/api/products/{{productId}}`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "66b1f0c2a4d3e5f6a7b8c9d0",
    "name": "Camiseta Oficial 1ª Equipación",
    "category": "Camisetas",
    "team": "FC Barcelona",
    "price": 99.95,
    "stock": 25,
    "brand": "Nike",
    "size": "M",
    "description": "Camiseta oficial de la temporada 2024/25.",
    "createdAt": "2024-08-06T10:15:30.000Z",
    "updatedAt": "2024-08-06T10:15:30.000Z"
  }
}
```

**Response `404 Not Found`:**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Producto no encontrado" } }
```

**Response `400 Bad Request`** (ID mal formado, ej. `/api/products/abc`):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada no válidos",
    "details": [{ "field": "params.id", "message": "El ID no es válido (debe ser un ObjectId de 24 caracteres hexadecimales)" }]
  }
}
```

---

## 4. Actualizar producto

`PUT {{baseUrl}}/api/products/{{productId}}`

Solo hace falta enviar los campos a modificar.

**Body (raw → JSON):**
```json
{
  "price": 89.95,
  "stock": 40
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Producto actualizado correctamente",
  "data": {
    "_id": "66b1f0c2a4d3e5f6a7b8c9d0",
    "name": "Camiseta Oficial 1ª Equipación",
    "category": "Camisetas",
    "team": "FC Barcelona",
    "price": 89.95,
    "stock": 40,
    "brand": "Nike",
    "size": "M",
    "description": "Camiseta oficial de la temporada 2024/25.",
    "createdAt": "2024-08-06T10:15:30.000Z",
    "updatedAt": "2024-08-06T11:02:10.000Z"
  }
}
```

**Response `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada no válidos",
    "details": [
      { "field": "body.stock", "message": "El stock debe ser un entero mayor o igual a 0" }
    ]
  }
}
```

**Response `404 Not Found`:**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Producto no encontrado" } }
```

---

## 5. Eliminar producto

`DELETE {{baseUrl}}/api/products/{{productId}}`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Producto eliminado correctamente",
  "data": {
    "_id": "66b1f0c2a4d3e5f6a7b8c9d0",
    "name": "Camiseta Oficial 1ª Equipación",
    "category": "Camisetas",
    "team": "FC Barcelona",
    "price": 89.95,
    "stock": 40,
    "brand": "Nike",
    "size": "M",
    "description": "Camiseta oficial de la temporada 2024/25.",
    "createdAt": "2024-08-06T10:15:30.000Z",
    "updatedAt": "2024-08-06T11:02:10.000Z"
  }
}
```

**Response `404 Not Found`:**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Producto no encontrado" } }
```

---

## Ruta inexistente

`GET {{baseUrl}}/api/unknown` → `404`
```json
{ "success": false, "message": "Ruta no encontrada: GET /api/unknown" }
```

---

## Importar en Postman

Puedes importar la especificación OpenAPI directamente: **Import → Link →** `http://localhost:3000/api-docs.json`
