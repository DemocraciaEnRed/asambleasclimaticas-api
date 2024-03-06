const express = require('express');
// const multer = require('multer');
const { check, param, body, query } = require('express-validator');
const constants = require('../services/constants');
const validate = require('../middlewares/validate');
const authorize = require('../middlewares/authorize');
const UserController = require('../controllers/userController');

const router = express.Router();

// -----------------------------------------------
// BASE     /users
// -----------------------------------------------
// GET 		/users/me
// PUT 	  /users/me
// PUT 	  /users/me/password
// PUT 	  /users/me/email
// GET 		/users/:userId
// -----------------------------------------------

// GET 		/users/me
router.get('/me', 
	authorize(),
	UserController.me
);

// PUT 	  /users/me
router.put('/me', 
	authorize(),
  [
    body('name').isString().withMessage('validationError.string'),
    body('bio').isString().withMessage('validationError.string'),
    body('countryCode').isString().isLength({min: 2, max: 2}).withMessage('validationError.countryCode'),
    body('lang').isString().isIn(['es', 'pt']).withMessage('validationError.lang'),
  ],
  validate,
	UserController.update
);

// PUT 	  /users/me/password
router.put('/me/password', 
	authorize(),
  [
		body('currentPassword').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
		body('newPassword').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
  ],
  validate,
	UserController.changePassword
);

// PUT 	  /users/me/email
router.put('/me/email', 
	authorize(),
  [
		body('email').isEmail().withMessage('validationError.email'),
		body('password').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
  ],
  validate,
	UserController.changeEmail
);

// GET 		/users/:userId
router.get('/:userId',
	UserController.get
);

module.exports = router;