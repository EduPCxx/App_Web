const express = require('express');
const controller = require('../controllers/product.controller');
const authenticate = require('../middlewares/authentication');
const authorize = require('../middlewares/authorization');
const validate = require('../middlewares/validate.middleware');
const {
  createProductSchema,
  listProductsSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  softDeleteProductSchema,
  setProductActiveSchema,
  setProductStatusSchema,
  restoreProductSchema,
  getProductBySlugSchema,
  updateProductBySlugSchema,
  softDeleteProductBySlugSchema,
  setProductActiveBySlugSchema
} = require('../validators/product.validator');

const router = express.Router();
const manageCatalog = [authenticate, authorize(['admin', 'editor'])];

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Catálogo relacional de productos.
 */
router
  .route('/')
  .get(validate(listProductsSchema), controller.list)
  .post(...manageCatalog, validate(createProductSchema), controller.create);

router
  .route('/slug/:slug')
  .get(validate(getProductBySlugSchema), controller.getBySlug)
  .put(...manageCatalog, validate(updateProductBySlugSchema), controller.updateBySlug);

router.patch('/slug/:slug/soft-delete', ...manageCatalog, validate(softDeleteProductBySlugSchema), controller.softDeleteBySlug);
router.patch('/slug/:slug/is-active', ...manageCatalog, validate(setProductActiveBySlugSchema), controller.setActiveBySlug);

router
  .route('/:id')
  .get(validate(getProductSchema), controller.getById)
  .put(...manageCatalog, validate(updateProductSchema), controller.update)
  .delete(...manageCatalog, validate(deleteProductSchema), controller.remove);

router.patch('/:id/soft-delete', ...manageCatalog, validate(softDeleteProductSchema), controller.softDelete);
router.patch('/:id/restore', ...manageCatalog, validate(restoreProductSchema), controller.restore);
router.patch('/:id/is-active', ...manageCatalog, validate(setProductActiveSchema), controller.setActive);
router.patch('/:id/status', ...manageCatalog, validate(setProductStatusSchema), controller.setStatus);

module.exports = router;
