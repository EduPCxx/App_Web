const express = require('express');
const controllerFor = require('../controllers/catalog.controller');
const validate = require('../middlewares/validate.middleware');
const schemas = require('../validators/catalog.validator');

const createCatalogRouter = (type) => {
  const router = express.Router();
  const controller = controllerFor(type);
  const schema = schemas[type];
  router.route('/').get(validate(schema.list), controller.list).post(validate(schema.create), controller.create);
  if (schema.getBySlug) router.get('/slug/:slug', validate(schema.getBySlug), controller.getBySlug);
  router
    .route('/:id')
    .get(validate(schema.get), controller.get)
    .put(validate(schema.update), controller.update)
    .delete(validate(schema.remove), controller.remove);
  router.patch('/:id/soft-delete', validate(schema.softDelete), controller.softDelete);
  router.patch('/:id/restore', validate(schema.restore), controller.restore);
  router.patch('/:id/is-active', validate(schema.setActive), controller.setActive);
  router.patch('/:id/status', validate(schema.setStatus), controller.setStatus);
  return router;
};

module.exports = createCatalogRouter;
