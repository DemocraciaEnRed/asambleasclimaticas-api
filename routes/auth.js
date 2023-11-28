const express = require('express');
const { check } = require('express-validator');

const Auth = require('../controllers/auth');
const validate = require('../middlewares/validate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ message: "You are in the Auth Endpoint. Register or Login to test Authentication." });
});

router.post('/register', [
	check('email').isEmail().withMessage('Enter a valid email address'),
	check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
	check('name').not().isEmpty().withMessage('Your name is required'),
	check('lang').not().isEmpty().withMessage('Your language is required'),
], validate, Auth.register);

router.post("/login", [
	check('email').isEmail().withMessage('Enter a valid email address'),
	check('password').not().isEmpty(),
], validate, Auth.login);

router.get('/verify/:token', [
	check('token').not().isEmpty().withMessage('Token is required'),
], validate, Auth.verify);

router.post('/resend', [
	check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Auth.resendToken);

router.post('/forgot', [
	check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Auth.forgot);


router.post('/reset/:token', [
	check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
	check('confirmPassword', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
], validate, Auth.resetPassword);

router.get('/logged', optionalAuthenticate, Auth.logged);

module.exports = router;