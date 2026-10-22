Crea un proyecto completo de una API REST para gestionar productos de fútbol.

### Stack

* Node.js + Express
* MongoDB + Mongoose
* Swagger/OpenAPI
* CORS

### Arquitectura

Organiza el proyecto por capas:

* `routes/` → endpoints
* `controllers/` → gestión de entrada/salida HTTP
* `services/` → validaciones, reglas y orquestación entre controllers y repositories
* `repositories/` → acceso a MongoDB
* `models/` → esquemas Mongoose
* `utils/` → manejo centralizado de errores y utilidades

### Funcionalidad

Implementa CRUD completo de productos de fútbol:

* Crear producto
* Listar productos
* Obtener producto por ID
* Actualizar producto
* Eliminar producto

Cada producto debe incluir, como mínimo:

* nombre (ej. *"Camiseta Oficial 1ª Equipación"*)
* categoría (ej. *Camisetas, Botas, Balones, Equipamiento, Accesorios*)
* equipo (ej. *FC Barcelona, Real Madrid, Selección Española, N/A*)
* precio
* stock
* marca (ej. *Nike, Adidas, Puma*)
* talla/tamaño (ej. *S, M, L, XL* o *Talla 5* para balones)
* descripción

### Extras obligatorios

* `seed.js` con datos de ejemplo de productos de fútbol (camisetas, botas, balones, etc.).
* Manejo centralizado de errores.
* Variables de entorno mediante `.env`.
* CORS configurado.
* Swagger con documentación de todos los endpoints.
* `README.md` con instalación, configuración, ejecución y seed.
* `Postman.md` documentando los endpoints y ejemplos de requests/responses.
* `package.json` con todos los scripts y dependencias necesarios.
* Código limpio, modular y listo para ejecutar.

### Entrega

Genera TODOS los archivos necesarios del proyecto, respetando la arquitectura indicada.

Finalmente, empaqueta el proyecto completo en un archivo `.zip`, listo para descargar y ejecutar.