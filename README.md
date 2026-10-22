# ⚽ Football Shop — Fullstack App (API REST + Admin Dashboard)

Este repositorio contiene la solución fullstack para la gestión de un catálogo de productos de fútbol (camisetas, botas, balones, equipamiento y accesorios). Incluye una **API REST en Node.js/Express** y un **Panel de Administración en React**.

---

## 📐 Arquitectura General del Proyecto

```text
football-shop/
├── backend/          # API REST (Node.js, Express, MongoDB)
└── frontend/         # Admin Dashboard (React, Vite, Tailwind CSS, shadcn/ui)
```

---

## 🛠️ Tech Stack

### **Backend**
* **Entorno & Framework:** Node.js, Express
* **Base de Datos:** MongoDB, Mongoose
* **Validación & Seguridad:** Zod, Helmet, CORS
* **Documentación & Logs:** Swagger/OpenAPI, Morgan

### **Frontend**
* **Framework & Build:** React, Vite
* **Estilos & UI:** Tailwind CSS, shadcn/ui, React Icons
* **Gestión de Formulario & Peticiones:** React Hook Form, Zod, Axios
* **Enrutamiento & Utilidades:** React Router (Lazy loading), SweetAlert2

---

## ⚡ Requisitos Previos

* **Node.js**: v18 o superior
* **MongoDB**: En local (`mongodb://127.0.0.1:27017`) o URI de MongoDB Atlas

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITTORIO>
cd <NOMBRE_DEL_PROYECTO>
```

---

### 🟢 Backend (API REST)

1. **Navegar a la carpeta del backend e instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**  
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

   *Variables del `.env`:*
   | Variable | Descripción | Valor por defecto |
   |---|---|---|
   | `PORT` | Puerto del servidor backend | `3000` |
   | `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://127.0.0.1:27017/football_products` |
   | `CORS_ORIGIN` | Orígenes permitidos (separados por comas) o `*` | `*` |
   | `NODE_ENV` | `development` o `production` | `development` |

3. **Ejecutar migraciones y datos de prueba (Seed):**
   ```bash
   npm run migrate:slug # Inicializa/rellena los campos slug, deletedAt e isActive
   npm run seed         # (Opcional) Carga 15 productos de ejemplo
   ```

4. **Iniciar el backend:**
   ```bash
   npm run dev   # Modo desarrollo (con nodemon)
   # o
   npm start     # Modo producción
   ```

   * **API Base:** `http://localhost:3000/api/products`
   * **Swagger UI:** `http://localhost:3000/api-docs`
   * **Health Check:** `http://localhost:3000/health`

---

### 🔵 Frontend (Admin Dashboard)

1. **Navegar a la carpeta del frontend e instalar dependencias:**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configurar variables de entorno:**  
   Crea o verifica el archivo `.env` en la raíz de la carpeta `frontend`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Iniciar la aplicación:**
   ```bash
   npm run dev    # Servidor de desarrollo en http://localhost:4200
   # o
   npm run build  # Compilar para producción (salida en dist/)
   ```

---

## 📚 Documentación de la API

Flujo del Backend: `route → validate (Zod) → controller → service → repository → model (MongoDB)`.

### **Endpoints Principales**

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Estadísticas globales del catálogo |
| `GET` | `/api/products` | Listar productos (soporta filtros y paginación) |
| `POST` | `/api/products` | Crear un nuevo producto |
| `GET` | `/api/products/:id` | Obtener producto por ID |
| `PUT` | `/api/products/:id` | Actualizar producto por ID |
| `DELETE` | `/api/products/:id` | Eliminar producto de forma física |
| `GET` | `/api/products/slug/:slug` | Obtener producto por slug |
| `PUT` | `/api/products/slug/:slug` | Actualizar por slug (recalcula slug si cambia `name`) |
| `PATCH` | `/api/products/slug/:slug/is-active` | Activar / Desactivar producto (`{ "isActive": boolean }`) |
| `PATCH` | `/api/products/slug/:slug/soft-delete` | Borrado lógico del producto |

### **Parámetros de Búsqueda y Filtro (`GET /api/products`)**
`category`, `team`, `brand`, `search`, `minPrice`, `maxPrice`, `sortBy` (`name|price|stock|createdAt`), `order` (`asc|desc`), `page`, `limit` (máx. 100).

*Ejemplo:* `GET /api/products?category=Botas&brand=Nike&minPrice=100&sortBy=price&order=asc`

### **Estructura del Modelo de Producto**
* `name` (String, 2–150 caracteres, obligatorio)
* `category` (String: `Camisetas`, `Botas`, `Balones`, `Equipamiento`, `Accesorios`)
* `team` (String, obligatorio — `N/A` si no aplica)
* `price` (Number, $\ge 0$, obligatorio)
* `stock` (Integer, $\ge 0$, obligatorio)
* `brand` (String, obligatorio)
* `size` (String, obligatorio)
* `description` (String, máx. 1000 caracteres, obligatorio)

---

## 💻 Frontend: Vistas y Navegación

| Pantalla | Ruta | Operación API Vinculada |
|---|---|---|
| **Dashboard** | `/` | `GET /api/dashboard/stats` |
| **Listado de Productos** | `/products` | `GET /api/products?limit=100` |
| **Detalle de Producto** | `/products/:slug` | `GET /api/products/slug/:slug` |
| **Nuevo Producto** | `/products/new` | `POST /api/products` |
| **Editar Producto** | `/products/:slug/edit` | `PUT /api/products/slug/:slug` |
| **Estado (Activar/Desactivar)** | Tabla / Detalle | `PATCH /api/products/slug/:slug/is-active` |
| **Eliminado Lógico** | Tabla / Detalle | `PATCH /api/products/slug/:slug/soft-delete` |

---

## 🛡️ Manejo de Errores y Seguridad

* **Seguridad API:** Protegido con `helmet` y cabeceras preparadas para CORS.
* **Respuesta de Errores API:** Estructura JSON unificada con códigos como `VALIDATION_ERROR`, `NOT_FOUND`, `DUPLICATE_KEY` e `INTERNAL_ERROR`.
* **Frontend Error Handling:** Interceptor de Axios centralizado que transforma errores de red/API a `ApiError` y los presenta al usuario mediante SweetAlert2.

---

## 📄 Recursos Adicionales

* Consulta el archivo [`Postman.md`](./backend/Postman.md) en la carpeta backend para ver ejemplos completos de requests y responses.