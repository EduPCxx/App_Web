const express = require('express');
const controller = require('../controllers/product.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createProductSchema,
  listProductsSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  getProductBySlugSchema,
  updateProductBySlugSchema,
  softDeleteProductBySlugSchema,
  setProductActiveBySlugSchema
} = require('../validators/product.validator');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos
 *     description: Devuelve una lista paginada de productos, con filtros y ordenación opcionales.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [Camisetas, Botas, Balones, Equipamiento, Accesorios] }
 *         description: Filtrar por categoría
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *         description: Filtrar por equipo (ej. "Real Madrid")
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: Filtrar por marca (ej. "Nike")
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por texto en nombre y descripción
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         description: Filtrar por activos / inactivos (sin valor: todos)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, price, stock, createdAt], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     total: { type: integer, example: 14 }
 *                     totalPages: { type: integer, example: 2 }
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Producto creado correctamente }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router
  .route('/')
  .get(validate(listProductsSchema), controller.list)
  .post(validate(createProductSchema), controller.create);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Obtener un producto por slug
 *     description: No devuelve productos eliminados lógicamente (404).
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
 *         example: camiseta-oficial-1a-equipacion
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Slug inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   put:
 *     summary: Actualizar un producto por slug
 *     description: Si cambia `name`, el slug se regenera (la respuesta trae el slug nuevo).
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
 *         example: camiseta-oficial-1a-equipacion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Datos o slug inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router
  .route('/slug/:slug')
  .get(validate(getProductBySlugSchema), controller.getBySlug)
  .put(validate(updateProductBySlugSchema), controller.updateBySlug);

/**
 * @swagger
 * /api/products/slug/{slug}/soft-delete:
 *   patch:
 *     summary: Eliminar lógicamente un producto por slug
 *     description: Establece `deletedAt`. El producto deja de aparecer en listados y consultas.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
 *         example: camiseta-oficial-1a-equipacion
 *     responses:
 *       200:
 *         description: Producto eliminado lógicamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Slug inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado o ya eliminado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/slug/:slug/soft-delete', validate(softDeleteProductBySlugSchema), controller.softDeleteBySlug);

/**
 * @swagger
 * /api/products/slug/{slug}/is-active:
 *   patch:
 *     summary: Activar o desactivar un producto por slug
 *     description: Independiente del borrado lógico. Idempotente.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
 *         example: camiseta-oficial-1a-equipacion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Slug o body inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado o eliminado lógicamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch('/slug/:slug/is-active', validate(setProductActiveBySlugSchema), controller.setActiveBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del producto (ObjectId de MongoDB)
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   put:
 *     summary: Actualizar un producto
 *     description: Actualiza los campos enviados. No es necesario enviar el producto completo.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category: { type: string, enum: [Camisetas, Botas, Balones, Equipamiento, Accesorios] }
 *               team: { type: string }
 *               price: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               brand: { type: string }
 *               size: { type: string }
 *               description: { type: string }
 *             example:
 *               price: 89.95
 *               stock: 40
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Producto actualizado correctamente }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Error de validación o ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Producto eliminado correctamente }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router
  .route('/:id')
  .get(validate(getProductSchema), controller.getById)
  .put(validate(updateProductSchema), controller.update)
  .delete(validate(deleteProductSchema), controller.remove);

module.exports = router;
