const express = require('express');
const { check, param, body, query } = require('express-validator');
const constants = require('../../services/constants');
const authorize = require('../../middlewares/authorize');
const exists = require('../../middlewares/exists');
const validate = require('../../middlewares/validate');

const UserController = require('../../controllers/userController');
const AdminController = require('../../controllers/adminController');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /admin
// -----------------------------------------------
// GET 		/admin/users
// GET    /admin/users/authors
// GET 		/admin/users/:userId
// PUT    /admin/users/:userId
// PUT    /admin/users/:userId/role
// GET    /admin/projects
// -----------------------------------------------

// GET 		/admin/users
router.get('/users',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 10 }).withMessage('Limit must be an integer greater than 1'),
    query('includeDeleted').optional().isBoolean().withMessage('Include deleted must be a boolean'),
  ],
  validate,
  UserController.list
)

router.get('/users/csv',
  authorize(constants.ROLES.ADMINISTRATOR),
  AdminController.exportUsers
)

// GET 		/admin/users/authors
router.get('/users/authors',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer greater than 1'),
    query('includeDeleted').optional().isBoolean().withMessage('Include deleted must be a boolean'),
  ],
  validate,
  UserController.listAuthors
)

// GET 		/admin/users/:userId
router.get('/users/:userId',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('Invalid User ID'),
  ],
  validate,
  UserController.get
)

// PUT    /admin/users/:userId
router.put('/users/:userId',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('Invalid User ID'),
    body('name').isString().withMessage('Name must be a string'),
    body('bio').isString().withMessage('Bio must be a string'),
    body('countryCode').isString().withMessage('Country code must be a string'),
    body('lang').isString().withMessage('Language must be a string'),
  ],
  validate,
  UserController.update
)

router.put('/users/:userId/role',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('Invalid User ID'),
    body('role').isIn(constants.ROLES.ALL).withMessage('Invalid role'),
  ],
  validate,
  UserController.setRole
)

router.get('/projects',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer greater than 1'),
  ],
  validate,
  AdminController.listProjects
)

module.exports = router;
