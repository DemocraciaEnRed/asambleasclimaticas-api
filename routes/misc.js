const express = require('express');
const { check } = require('express-validator');
const validate = require('../middlewares/validate');
const MiscController = require('../controllers/miscController');
const constants = require('../services/constants');
const authenticate = require('../middlewares/authorize');

// initialize router
const router = express.Router();

// GET    /misc/countries
router.get('/countries', 
  MiscController.getCountries
);

module.exports = router;