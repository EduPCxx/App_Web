const express = require('express');
const controllerFor = require('../controllers/catalog.controller');
const authenticate = require('../middlewares/authentication');
const authorize = require('../middlewares/authorization');
const validate = require('../middlewares/validate.middleware');
const schemas = require('../validators/catalog.validator');

const createCatalogRouter = (type, allowedRoles = ['admin']) => {
  const router = express.Router();
  const manageCatalog = [authenticate, authorize(allowedRoles)];
  const publicReads = allowedRoles.includes('editor');
  const controller = controllerFor(type);
  const schema = schemas[type];
  const listHandlers = publicReads
    ? [validate(schema.list), controller.list]
    : [...manageCatalog, validate(schema.list), controller.list];
  const getHandlers = publicReads
    ? [validate(schema.get), controller.get]
    : [...manageCatalog, validate(schema.get), controller.get];
  router.route('/').get(...listHandlers).post(...manageCatalog, validate(schema.create), controller.create);
  if (schema.getBySlug) {
    const getBySlugHandlers = publicReads
      ? [validate(schema.getBySlug), controller.getBySlug]
      : [...manageCatalog, validate(schema.getBySlug), controller.getBySlug];
    router.get('/slug/:slug', ...getBySlugHandlers);
  }
  router
    .route('/:id')
    .get(...getHandlers)
    .put(...manageCatalog, validate(schema.update), controller.update)
    .delete(...manageCatalog, validate(schema.remove), controller.remove);
  router.patch('/:id/soft-delete', ...manageCatalog, validate(schema.softDelete), controller.softDelete);
  router.patch('/:id/restore', ...manageCatalog, validate(schema.restore), controller.restore);
  router.patch('/:id/is-active', ...manageCatalog, validate(schema.setActive), controller.setActive);
  router.patch('/:id/status', ...manageCatalog, validate(schema.setStatus), controller.setStatus);
  return router;
};

module.exports = createCatalogRouter;
