const express = require('express');
const controllerFor = require('../controllers/catalog.controller');
const validate = require('../middlewares/validate.middleware');
const schemas = require('../validators/catalog.validator');

const createCatalogRouter = (type) => {
  const router = express.Router();
  const controller = controllerFor(type);
  const schema = schemas[type];
  router.route('/').get(validate(schema.list), controller.list).post(validate(schema.create), controller.create);
  router
    .route('/:id')
    .get(validate(schema.get), controller.get)
    .put(validate(schema.update), controller.update)
    .delete(validate(schema.remove), controller.remove);
  return router;
};

module.exports = createCatalogRouter;
