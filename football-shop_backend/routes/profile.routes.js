const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate.middleware');
const profileValidator = require('../validators/profile.validator');

const router = express.Router();

router.get('/me', authenticate, validate(profileValidator.getMyProfile), profileController.getMyProfile);
router.patch('/me', authenticate, validate(profileValidator.updateMyProfile), profileController.updateMyProfile);

module.exports = router;
