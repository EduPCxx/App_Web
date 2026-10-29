const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const productRoutes = require('./routes/product.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const categoryRoutes = require('./routes/category.routes');
const brandRoutes = require('./routes/brand.routes');
const variantRoutes = require('./routes/variant.routes');
const imageRoutes = require('./routes/image.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Helmet (configuración por defecto; también elimina X-Powered-By) y logging HTTP: primeros middlewares
app.use(helmet());

const env = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  app.use(morgan(env === 'production' ? 'combined' : 'dev'));
}

// CORS: orígenes separados por comas en CORS_ORIGIN, o "*" para todos
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Productos de Fútbol',
    docs: '/api-docs',
    endpoints: ['/api/categories', '/api/brands', '/api/products', '/api/variants', '/api/images']
  });
});

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/images', imageRoutes);
// User and role routes remain unmounted until authentication and authorization are available.
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
