const User = require('../models/user');
const Token = require('../models/token');
const mailer = require('../services/mailer');
const agenda = require('../services/agenda');
const AuthHelper = require('../helpers/authHelper');
const UtilsHelper = require('../helpers/utilsHelper');
const express = require('express');

/**
 * It registers a new user
 * @route POST /auth/register
 * @param {String} req.body.email - The email of the user
 * @param {String} req.body.password - The password of the user
 * @param {String} req.body.name - The name of the user
 * @param {String} req.body.lang - The language of the user
 */
exports.register = async (req, res) => {
	try {
		const { email, password, name, lang, country } = req.body;

		// Make sure this account doesn't already exist
		const user = await User.findOne({ email });

		if (user){
			return res.status(401).json({ message: 'The email address you have entered is already associated with another account.' });
		} 

		const newUser = new User({
			email: email,
			password: password,
			name: name,
			lang: lang,
			country: country,
			isVerified: true
		});

		await newUser.save();	

		// generate and set password reset token
		const token = newUser.generateVerificationToken();
		// save the verification token
		await token.save()
		// make the url
		const url = `${process.env.APP_URL}/auth/verify/${token.token}`;
		// send email
		await AuthHelper.sendSignupEmail(newUser, url);

		return res.status(200).json({ message: req.__('auth.success.verificationMailSent', { email: newUser.email }) });
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
	}
};

/**
 * Logs in a user and return the user with a token
 * @route POST /auth/login
 * @param {Object} req.body.email - The email of the user
 * @param {Object} req.body.password - The password of the user
 * @returns {Object} - The user and JWT token that should be used as the authorization header
 */
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).populate({
			path: 'country',
			select: 'name code emoji unicode image'
		});

		if (!user){
			return res.status(401).json({ message: req.__('auth.error.invalidCredentials') });
		}

		//validate password
		if (!user.comparePassword(password)) {
			return res.status(401).json({ message: req.__('auth.error.invalidCredentials') });
		}

		// Make sure the user has been verified
		if (!user.isVerified) {
			return res.status(401).json({ message: req.__('auth.error.unverified') });
		}

		const outputUser = {
			_id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			lang: user.lang,
			country: user.country,
		}
		// Login successful, write token, and send back user
		return res.status(200).json({ token: await user.generateJWT(), user: outputUser });
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
	}
};

/**
 * Refreshes the token of a user
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.refreshToken = async (req, res) => {
	try {
		// authenticate middleware already checked if the user is logged
		const user = req.user;

		// Login successful, write token, and send back user
		return res.status(200).json({ token: await user.generateJWT()});
		
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
	}
}

/**
 * Verifies a user's email address
 * @route GET /auth/verify/:token
 * @param {string} req.params.token - The token sent to the user's email address
 * @returns {Object} - A message that the user's email has been verified
 */
exports.verify = async (req, res) => {
	try {
		// Find a matching token
		const token = await Token.findOne({ token: req.params.token });
		// if the token is not found, return an error 
		if (!token) {
			return res.status(400).json({ message: req.__('auth.error.tokenNotFound') });
		}
		// If we found a token, find a matching user
		const user = await User.findOne({ _id: token.userId });
		// if the user is not found return an error
		if (!user) {
			return res.status(400).json({ message: req.__('auth.error.userNotFound') });
		}
		// if the user is already verified, return error
		if (user.isVerified) {
			return res.status(400).json({ message: req.__('auth.error.alreadyVerified') });
		}
		// token exists and the user is not verified, so we can verify the user
		user.isVerified = true;
		// save it
		await user.save();
		// return success
		return res.status(200).json({ message: req.__('auth.success.verification') });
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: req.__('error.default') })
	}
};

/**
 * Resends a verification token to a user
 * @route POST /auth/resend
 * @param {Object} req.body.email - The email of the user
 */
exports.resendToken = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		// if the user was not found, return error
		if (!user) {
			return res.status(401).json({ message: req.__('auth.error.emailNotFound') });
		}
		// if the user is already verified, return error
		if (user.isVerified) {
			return res.status(400).json({ message: req.__('auth.error.alreadyVerified') });
		}
		// generate a new token 
		const token = user.generateVerificationToken();
		// Save the verification token
		await token.save();
		// make the url
		const url = `${process.env.APP_URL}/auth/verify/${token.token}`;
		// send email
		await AuthHelper.sendVerificationEmail(user, url);


		return res.status(200).json({ message: req.__('auth.success.verificationResent', { email: user.email }) });
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: req.__('error.default') })
	}
};

exports.forgot = async (req, res) => {
	try {
		const { email } = req.body;
		// find the user with the email
		const user = await User.findOne({ email });
		// if user is not found, return error
		if (!user) {
			return res.status(401).json({ message: req.__('auth.error.emailNotAssociated', { email: email }) });
		}
		// generate and set password reset token
		user.generatePasswordReset();
		// Save the updated user object
		await user.save();
		// now send the password change request email
		
		// make the url
		const url = `${process.env.APP_URL}/auth/restore-password/${user.resetPasswordToken}`;

		await AuthHelper.sendPasswordResetEmail(user, url);

		res.status(200).json({ message: req.__('auth.success.resetMailSent', { email: user.email }) });
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: req.__('error.default') })
	}
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
	try {
		const { token } = req.params;

		const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

		if (!user) return res.status(401).json({ message: req.__('auth.error.tokenNotFound') });

		//Set the new password
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		user.isVerified = true;

		// Save the updated user object
		await user.save();

		// let subject = "Your password has been changed";
		// let to = user.email;
		// let from = process.env.FROM_EMAIL;
		// let html = `<p>Hi ${user.username}</p>
		//             <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`

		// await sendEmail({to, from, subject, html});

		return res.status(200).json({ message: req.__('auth.success.passwordUpdated') });

	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
	}
};

exports.loggedIn = async (req, res) => {
	try {
		let loggedIn = false;
		if(req.user) loggedIn = true;
		// return if the user is loggedIn
		return res.status(200).json({ loggedIn: loggedIn });
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: req.__('error.default') })
	}
}
