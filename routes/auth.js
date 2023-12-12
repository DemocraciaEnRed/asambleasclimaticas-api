const express = require('express');
const { check } = require('express-validator');

const validate = require('../middlewares/validate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const AuthController = require('../controllers/authController');

// initialize router
const router = express.Router();

// -----------------------------------------------
// BASE     /auth
// -----------------------------------------------
// GET 		/auth
// POST 	/auth/register
// POST 	/auth/login
// GET 		/auth/verify/:token
// POST 	/auth/resend
// POST 	/auth/forgot
// POST 	/auth/reset/:token
// GET 		/auth/logged
// -----------------------------------------------

router.get('/', (req, res) => {
	res.status(200).json({ message: "You are in the Auth Endpoint. Register or Login to test Authentication." });
});

router.post('/register', [
	check('email').isEmail().withMessage('Enter a valid email address'),
	check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
	check('name').not().isEmpty().withMessage('Your name is required'),
	check('lang').not().isEmpty().withMessage('Your language is required'),
], validate, AuthController.register);

router.post("/login", [
	check('email').isEmail().withMessage('Enter a valid email address'),
	check('password').not().isEmpty(),
], validate, AuthController.login);

router.get('/verify/:token', [
	check('token').not().isEmpty().withMessage('Token is required'),
], validate, AuthController.verify);

router.post('/resend', [
	check('email').isEmail().withMessage('Enter a valid email address'),
], validate, AuthController.resendToken);

router.post('/forgot', [
	check('email').isEmail().withMessage('Enter a valid email address'),
], validate, AuthController.forgot);


router.post('/reset/:token', [
	check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
	check('confirmPassword', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
], validate, AuthController.resetPassword);

router.get('/logged', optionalAuthenticate, AuthController.logged);

module.exports = router;