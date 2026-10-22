# v3 — Seguridad, logging, Zod y errores centralizados

## Instalación
```bash
npm install helmet morgan zod@3 slugify
```
(`package.json` ya las incluye; el comando actualiza `package-lock.json`.) Sin `rotating-file-stream`.

## Archivos
Nuevos: `middlewares/validate.middleware.js`, `middlewares/error.middleware.js`, `validators/product.validator.js`, `utils/slugify.js`, `utils/zodError.js`, `utils/wrapDbError.js`, `tests/middlewares.test.js`.
Modificados: `app.js`, `routes/product.routes.js`, `controllers/`, `services/`, `repositories/`, `utils/AppError.js`, `config/swagger.js`, `package.json`, `README.md`, `Postman.md`.
Eliminados: `utils/errorHandler.js` (movido a `middlewares/error.middleware.js`) y `utils/asyncHandler.js` (los controllers usan try/catch + next).

## Ejemplos de error
```jsonc
// 400 validación  (POST /api/products con price negativo)
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Datos de entrada no válidos",
  "details": [ { "field": "body.price", "message": "El precio debe ser un número mayor o igual a 0" } ] } }
// 404  (GET /api/nada, o producto inexistente → "Producto no encontrado")
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Ruta no encontrada: GET /api/nada" } }
// 500 en production
{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Error interno del servidor" } }
// 500 en development: igual pero con el mensaje real y "stack"
```

## Supuestos y puntos a revisar
1. **Sin `src/`**: el proyecto no tiene esa carpeta, así que `middlewares/` y `validators/` están en la raíz junto a `routes/`, `services/`... (respeto tu estructura).
2. **Placeholders sin rellenar** en el prompt: Zod → elegí 3.x (los mensajes usan `required_error`/`invalid_type_error`, que en 4.x pasan a `error`); IDs → ObjectId de 24 hex; logging en producción → consola (sin archivo).
3. **El formato de error cambia** para todos los endpoints: ahora solo `{success, error:{code,message,details?}}`. Antes había `message` y `errors` en la raíz, así que los clientes que lean `response.message` dejarán de funcionar.
4. **Cambios de comportamiento por la validación Zod**: `limit > 100` o `page=abc` ahora dan 400 (antes se ajustaban en silencio); un ID debe tener 24 hex exactos (antes `mongoose.isValid` aceptaba también strings de 12 caracteres); `order` sigue siendo insensible a mayúsculas; los campos desconocidos se siguen ignorando (`.strip()`), no se rechazan.
5. **Validación movida, no duplicada**: eliminé `validateAndPick`, `assertValidId`, `buildSort`-validación y las comprobaciones numéricas del servicio, porque ahora las hacen los esquemas. El redondeo del precio a 2 decimales se conserva (`transform`).
6. **Conservé la normalización de errores de Mongoose** (ValidationError, CastError, duplicado 11000) y de JSON mal formado: con la regla "cualquier otro error → 500" se habrían convertido en 500.
7. **Los `catch` de los services solo relanzan** (lo pedías). Funciona, pero ESLint (`no-useless-catch`) los marcará; si usas ESLint, quítalos o desactiva la regla.
8. **Repositories**: envuelven en `AppError(500, DATABASE_ERROR)` los fallos inesperados y relanzan tal cual los que el middleware sabe traducir. En producción el cliente nunca ve el mensaje original.
9. **Slug**: el modelo de esta versión no tiene campo `slug`, así que los 2 ejemplos de uso están como comentario en `product.service.js` (necesitarías añadir el campo y un `findBySlug`). `generateSlug`/`generateUniqueSlug` están listos. Esta carpeta es tu zip original: **no incluye** los cambios de ciclo de vida (borrado lógico, status, slug) de la entrega anterior.
10. **Helmet** con valores por defecto, sin ajustes. Posible problema que no he podido probar: Swagger UI sobre `http://` en Safari puede fallar por la directiva `upgrade-insecure-requests`; si pasa, usa `helmet({ contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': null } } })` solo fuera de producción. Helmet ya quita `X-Powered-By`.
11. Añadí `express.urlencoded({ extended: false })` porque el orden pedido lo incluye; la API sigue siendo JSON.
12. **No pude ejecutar nada con las dependencias reales** (sin red aquí): comprobé sintaxis de todos los archivos y 13 tests de AppError, error.middleware, validate.middleware, wrapDbError y slugify con fakes de `zod`/`slugify`. **Los esquemas Zod en sí no se han ejecutado**: tras `npm install`, prueba un POST válido, uno inválido, `?limit=101` y un ID malformado.
