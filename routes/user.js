const express = require('express');
const { check } = require('express-validator');
// const multer = require('multer');

const User = require('../controllers/user');
const constants = require('../services/constants');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');

const router = express.Router();

// const upload = multer().single('profileImage');


router.get('/', [
	check('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
	check('limit').optional().isInt({ min: 10 }).withMessage('Limit must be an integer greater than 0'),
], validate, authenticate(constants.ROLES.ADMINISTRATOR), User.list);

router.get('/me', authenticate(), User.me);


// router.post('/', [
// 	check('email').isEmail().withMessage('Enter a valid email address'),
// 	check('username').not().isEmpty().withMessage('You username is required'),
// 	check('firstName').not().isEmpty().withMessage('You first name is required'),
// 	check('lastName').not().isEmpty().withMessage('You last name is required')
// ], validate, authenticate(constants.ROLES.ADMINISTRATOR), User.create);

//SHOW
router.get('/:id', User.get);

//UPDATE
// router.put('/:id', upload, User.update);
//router.put('/:id', optionalAuthenticate, User.update);

module.exports = router;