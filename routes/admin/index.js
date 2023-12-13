const express = require('express');
const { check, param, body, query } = require('express-validator');
const constants = require('../../services/constants');
const authenticate = require('../../middlewares/authenticate');
const exists = require('../../middlewares/exists');
const validate = require('../../middlewares/validate');

const UserController = require('../../controllers/userController');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /admin
// -----------------------------------------------
// GET 		/admin/users
// GET 		/admin/users/:userId
// -----------------------------------------------

// GET 		/admin/users
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 10 }).withMessage('Limit must be an integer greater than 0'),
    query('includeDeleted').optional().isBoolean().withMessage('Include deleted must be a boolean'),
  ],
  validate,
  authenticate(constants.ROLES.ADMINISTRATOR),
  UserController.list
)

// GET 		/admin/users/:userId
router.get('/users/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid User ID'),
  ],
  validate,
  authenticate(constants.ROLES.ADMINISTRATOR),
  UserController.get
)

module.exports = router;
