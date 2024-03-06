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
    query('page').optional().isInt({ min: 1 }).withMessage('validationError.page'),
    query('limit').optional().isInt({ min: 10, max: 25 }).withMessage('validationError.limit'),
    query('query').optional().isString().withMessage('validationError.query'),
    query('includeDeleted').optional().isBoolean().withMessage('validationError.boolean'),
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
    query('page').optional().isInt({ min: 1 }).withMessage('validationError.page'),
    query('limit').optional().isInt({ min: 10, max: 25 }).withMessage('validationError.limit'),
    query('includeDeleted').optional().isBoolean().withMessage('validationError.boolean'),
  ],
  validate,
  UserController.listAuthors
)

// GET 		/admin/users/:userId
router.get('/users/:userId',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
  ],
  validate,
  UserController.get
)

// PUT    /admin/users/:userId
router.put('/users/:userId',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
    body('name').isString().withMessage('validationError.string'),
    body('bio').isString().withMessage('validationError.string'),
    body('countryCode').isString().isLength({min: 2, max: 2}).withMessage('validationError.countryCode'),
    body('lang').isString().isIn(['es', 'pt']).withMessage('validationError.lang'),
  ],
  validate,
  UserController.update
)

router.put('/users/:userId/role',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
    body('role').isIn(constants.ROLES.ALL).withMessage('validationError.role'),
  ],
  validate,
  UserController.setRole
)

router.put('/users/:userId/participation',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
    body('participatedInAssembly').isBoolean().withMessage('validationError.boolean'),
  ],
  validate,
  UserController.setParticipationInAssembly
)

router.post('/users/:userId/force-verify',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
  ],
  validate,
  UserController.forceVerifyByAdmin
)

router.put('/users/:userId/password',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
    body('password').isString().withMessage('validationError.password'),
  ],
  validate,
  UserController.changePasswordByAdmin
)

router.put('/users/:userId/email',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    param('userId').isMongoId().withMessage('validationError.mongoId'),
    body('email').isEmail().withMessage('validationError.email'),
    body('forceVerified').optional().isBoolean().withMessage('validationError.boolean'),
  ],
  validate,
  UserController.changeEmailByAdmin
)

router.get('/projects',
  authorize(constants.ROLES.ADMINISTRATOR),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('validationError.page'),
    query('limit').optional().isInt({ min: 1 }).withMessage('validationError.limit'),
  ],
  validate,
  AdminController.listProjects
)

router.get('/stats',
  authorize(constants.ROLES.ADMINISTRATOR),
  AdminController.getAppStats
)

module.exports = router;
