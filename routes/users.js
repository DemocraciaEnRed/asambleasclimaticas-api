const express = require('express');
const { check } = require('express-validator');
// const multer = require('multer');

const constants = require('../services/constants');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
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
	authenticate(),
	UserController.me
);

// GET 		/users/:userId
router.get('/:userId',
	optionalAuthenticate,
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