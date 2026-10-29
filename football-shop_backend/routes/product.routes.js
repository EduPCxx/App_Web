const express = require('express');
const controller = require('../controllers/product.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createProductSchema,
  listProductsSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  getProductBySlugSchema,
  updateProductBySlugSchema,
  softDeleteProductBySlugSchema,
  setProductActiveBySlugSchema
} = require('../validators/product.validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Catálogo relacional de productos.
 */
router
  .route('/')
  .get(validate(listProductsSchema), controller.list)
  .post(validate(createProductSchema), controller.create);

router
  .route('/slug/:slug')
  .get(validate(getProductBySlugSchema), controller.getBySlug)
  .put(validate(updateProductBySlugSchema), controller.updateBySlug);

router.patch('/slug/:slug/soft-delete', validate(softDeleteProductBySlugSchema), controller.softDeleteBySlug);
router.patch('/slug/:slug/is-active', validate(setProductActiveBySlugSchema), controller.setActiveBySlug);

router
  .route('/:id')
  .get(validate(getProductSchema), controller.getById)
  .put(validate(updateProductSchema), controller.update)
  .delete(validate(deleteProductSchema), controller.remove);

module.exports = router;
