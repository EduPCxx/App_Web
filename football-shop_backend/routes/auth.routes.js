const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validate(authValidator.login), authController.login);

module.exports = router;
