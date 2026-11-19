const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authValidator = require('../validators/auth.validator');
const authenticate = require('../middlewares/authentication');

const router = express.Router();

router.post('/login', validate(authValidator.login), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

module.exports = router;
