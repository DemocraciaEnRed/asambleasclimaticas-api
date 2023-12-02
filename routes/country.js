const express = require('express');
const { check } = require('express-validator');
const validate = require('../middlewares/validate');
const CountryController = require('../controllers/country');
const constants = require('../services/constants');
const authenticate = require('../middlewares/authenticate');

// initialize router
const router = express.Router();

router.get('/', CountryController.get)

module.exports = router;