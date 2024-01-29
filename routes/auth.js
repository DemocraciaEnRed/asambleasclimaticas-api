const express = require('express');
const { check } = require('express-validator');

const validate = require('../middlewares/validate');
const authorize = require('../middlewares/authorize');
const requiresAnon = require('../middlewares/requiresAnon');
const AuthController = require('../controllers/authController');

// initialize router
const router = express.Router();

// -----------------------------------------------
// BASE     /auth
// -----------------------------------------------
// POST 	/auth/register
// POST 	/auth/login
// POST 	/auth/refresh-token
// GET 		/auth/verify/:token
// POST 	/auth/resend
// POST 	/auth/forgot
// POST 	/auth/reset/:token
// GET 		/auth/logged-in
// -----------------------------------------------


router.post('/register', 
	requiresAnon,
	[
		check('email').isEmail().withMessage('validationError.email'),
		check('password').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
		check('name').not().isEmpty().withMessage('validationError.name'),
		check('lang').not().isEmpty().isIn(['es', 'pt']).withMessage('validationError.lang')
	], 
	validate,
	AuthController.register
);

router.post("/login",
	requiresAnon,
	[
		check('email').isEmail().withMessage('validationError.email'),
		check('password').not().isEmpty().isLength({ min: 6 }).withMessage('validationError.password'),
	],
	validate,
	AuthController.login
);

router.post('/refresh-token',
	authorize(),
	AuthController.refreshToken
);

router.get('/verify/:token',
	[
		check('token').not().isEmpty().withMessage('Token is required'),
	],
	validate,
	AuthController.verify
);

router.post('/resend', 
	requiresAnon,
	[
		check('email').isEmail().withMessage('Enter a valid email address'),
	],
	validate,
	AuthController.resendToken
);

router.post('/forgot', 
	requiresAnon,
	[
		check('email').isEmail().withMessage('Enter a valid email address'),
	],
	validate,
	AuthController.forgot
);


router.post('/reset/:token',
	requiresAnon,
	[
		check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
		check('confirmPassword', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
	],
	validate,
	AuthController.resetPassword
);

router.get('/logged-in',
	AuthController.loggedIn
);

module.exports = router;