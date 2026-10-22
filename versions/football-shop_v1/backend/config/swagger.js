const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const { CATEGORIES } = require('../models/product.model');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Productos de Fútbol',
      version: '1.0.0',
      description:
        'API REST para gestionar el catálogo de productos de fútbol: camisetas, botas, balones, equipamiento y accesorios.'
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Servidor local' }],
    tags: [{ name: 'Productos', description: 'Operaciones CRUD sobre productos de fútbol' }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66b1f0c2a4d3e5f6a7b8c9d0' },
            name: { type: 'string', example: 'Camiseta Oficial 1ª Equipación' },
            category: { type: 'string', enum: CATEGORIES, example: 'Camisetas' },
            team: { type: 'string', example: 'FC Barcelona' },
            price: { type: 'number', example: 99.95 },
            stock: { type: 'integer', example: 25 },
            brand: { type: 'string', example: 'Nike' },
            size: { type: 'string', example: 'M' },
            description: { type: 'string', example: 'Camiseta oficial de la temporada 2024/25.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'category', 'team', 'price', 'stock', 'brand', 'size', 'description'],
          properties: {
            name: { type: 'string', example: 'Camiseta Oficial 1ª Equipación' },
            category: { type: 'string', enum: CATEGORIES, example: 'Camisetas' },
            team: { type: 'string', example: 'FC Barcelona', description: 'Usa "N/A" si no aplica' },
            price: { type: 'number', minimum: 0, example: 99.95 },
            stock: { type: 'integer', minimum: 0, example: 25 },
            brand: { type: 'string', example: 'Nike' },
            size: { type: 'string', example: 'M', description: 'S, M, L, XL, "Talla 5", "42"...' },
            description: { type: 'string', example: 'Camiseta oficial de la temporada 2024/25.' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Producto no encontrado' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJsdoc(options);
