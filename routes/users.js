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
// GET 		/users/:userId
// -----------------------------------------------

// GET 		/users/me
router.get('/me', 
	authorize(),
	UserController.me
);

router.put('/me', 
	authorize(),
  [
    body('name').isString().withMessage('Name must be a string'),
    body('bio').isString().withMessage('Bio must be a string'),
    body('countryCode').isString().withMessage('Country code must be a string'),
    body('lang').isString().withMessage('Language must be a string'),
  ],
  validate,
	UserController.update
);

router.put('/me/password', 
	authorize(),
  [
		body('currentPassword').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
		body('newPassword').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
  ],
  validate,
	UserController.changePassword
);

// GET 		/users/:userId
router.get('/:userId',
	UserController.get
);

// router.post('/', [
// 	check('email').isEmail().withMessage('Enter a valid email address'),
// 	check('username').not().isEmpty().withMessage('You username is required'),
// 	check('firstName').not().isEmpty().withMessage('You first name is required'),
// 	check('lastName').not().isEmpty().withMessage('You last name is required')
// ], validate, authenticate(constants.ROLES.ADMINISTRATOR), User.create);

//UPDATE
// router.put('/:id', upload, User.update);
//router.put('/:id', optionalAuthenticate, User.update);

module.exports = router;