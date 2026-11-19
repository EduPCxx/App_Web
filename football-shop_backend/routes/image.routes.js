const createCatalogRouter = require('./catalog.routes');

module.exports = createCatalogRouter('images', ['admin', 'editor']);
