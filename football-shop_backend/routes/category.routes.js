const createCatalogRouter = require('./catalog.routes');

module.exports = createCatalogRouter('categories', ['admin', 'editor']);
