const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const productRoutes = require('./routes/product.routes');
const { notFoundHandler, errorHandler } = require('./utils/errorHandler');

const app = express();

// CORS: orígenes separados por comas en CORS_ORIGIN, o "*" para todos
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Productos de Fútbol',
    docs: '/api-docs',
    endpoints: '/api/products'
  });
});

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
