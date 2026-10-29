const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const id = { type: 'string', example: '66b1f0c2a4d3e5f6a7b8c9d0' };
const resourcePath = (resource) => ({
  get: {
    tags: [resource],
    summary: `Listar ${resource.toLowerCase()}`,
    responses: { 200: { description: 'Lista de recursos' } }
  },
  post: {
    tags: [resource],
    summary: `Crear ${resource.toLowerCase()}`,
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } }
    },
    responses: { 201: { description: 'Recurso creado' }, 400: { description: 'Datos inválidos' } }
  }
});
const resourceByIdPath = (resource) => ({
  get: {
    tags: [resource],
    summary: `Obtener ${resource.toLowerCase()}`,
    parameters: [{ in: 'path', name: 'id', required: true, schema: id }],
    responses: { 200: { description: 'Recurso encontrado' }, 404: { description: 'No encontrado' } }
  },
  put: {
    tags: [resource],
    summary: `Actualizar ${resource.toLowerCase()}`,
    parameters: [{ in: 'path', name: 'id', required: true, schema: id }],
    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } },
    responses: { 200: { description: 'Recurso actualizado' }, 400: { description: 'Datos inválidos' } }
  },
  delete: {
    tags: [resource],
    summary: `Eliminar ${resource.toLowerCase()}`,
    parameters: [{ in: 'path', name: 'id', required: true, schema: id }],
    responses: { 200: { description: 'Recurso eliminado' }, 409: { description: 'Tiene recursos relacionados' } }
  }
});

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Football Shop',
      version: '2.0.0',
      description: 'API de catálogo con productos, categorías, marcas, variantes e imágenes.'
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Servidor local' }],
    tags: [
      { name: 'Productos' },
      { name: 'Categories' },
      { name: 'Brands' },
      { name: 'Variants' },
      { name: 'Images' }
    ],
    paths: {
      '/api/products': {
        get: { tags: ['Productos'], summary: 'Listar productos con sus referencias', responses: { 200: { description: 'Productos y paginación' } } },
        post: {
          tags: ['Productos'],
          summary: 'Crear producto',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'category_id', 'brand_id'],
                  properties: {
                    name: { type: 'string' },
                    category_id: id,
                    brand_id: id,
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['draft', 'active', 'archived'] }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Producto creado' }, 404: { description: 'Categoría o marca inexistente' } }
        }
      },
      '/api/products/{id}': resourceByIdPath('Productos'),
      '/api/products/slug/{slug}': {
        get: {
          tags: ['Productos'],
          summary: 'Obtener producto por slug',
          parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Producto encontrado' }, 404: { description: 'No encontrado' } }
        },
        put: {
          tags: ['Productos'],
          summary: 'Actualizar producto por slug',
          parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Producto actualizado' }, 404: { description: 'No encontrado' } }
        }
      },
      '/api/products/slug/{slug}/soft-delete': {
        patch: {
          tags: ['Productos'],
          summary: 'Borrado lógico de producto',
          parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Producto borrado' }, 404: { description: 'No encontrado' } }
        }
      },
      '/api/products/slug/{slug}/is-active': {
        patch: {
          tags: ['Productos'],
          summary: 'Cambiar visibilidad del producto',
          parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } } } } }
          },
          responses: { 200: { description: 'Visibilidad actualizada' }, 404: { description: 'No encontrado' } }
        }
      },
      '/api/categories': resourcePath('Categories'),
      '/api/categories/{id}': resourceByIdPath('Categories'),
      '/api/brands': resourcePath('Brands'),
      '/api/brands/{id}': resourceByIdPath('Brands'),
      '/api/variants': resourcePath('Variants'),
      '/api/variants/{id}': resourceByIdPath('Variants'),
      '/api/images': resourcePath('Images'),
      '/api/images/{id}': resourceByIdPath('Images'),
      '/api/dashboard/stats': {
        get: { tags: ['Productos'], summary: 'Estadísticas del catálogo', responses: { 200: { description: 'Totales y unidades en inventario' } } }
      }
    }
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJsdoc(options);
