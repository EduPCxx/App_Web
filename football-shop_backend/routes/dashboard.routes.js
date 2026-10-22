const express = require('express');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Estadísticas del catálogo para el dashboard
 *     description: Totales, activos, agotados, unidades, valor del inventario y productos por categoría (sin borrados lógicos).
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 15 }
 *                     active: { type: integer, example: 14 }
 *                     inactive: { type: integer, example: 1 }
 *                     outOfStock: { type: integer, example: 0 }
 *                     units: { type: integer, example: 600 }
 *                     inventoryValue: { type: number, example: 18250.5 }
 *                     byCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category: { type: string, example: Camisetas }
 *                           count: { type: integer, example: 4 }
 */
router.get('/stats', controller.getStats);

module.exports = router;
