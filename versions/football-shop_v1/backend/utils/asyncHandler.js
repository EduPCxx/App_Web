// Envuelve controllers async para delegar cualquier error al middleware centralizado
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
