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
		const url = `${UtilsHelper.getHost(req)}/auth/verify/${token.token}`
		// send email
		await AuthHelper.sendVerificationEmail(newUser, url);

		return res.status(200).json({ message: 'An email has been sent to ' + newUser.email + '.' });
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
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
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		//validate password
		if (!user.comparePassword(password)) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Make sure the user has been verified
		if (!user.isVerified) {
			return res.status(401).json({ message: 'Your account has not been verified.' });
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
		res.status(200).json({ token: await user.generateJWT(), user: outputUser });
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
};


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
			return res.status(400).json({ message: 'We were unable to find a valid token. Your token may have expired.' });
		}
		// If we found a token, find a matching user
		const user = await User.findOne({ _id: token.userId });
		// if the user is not found return an error
		if (!user) {
			return res.status(400).json({ message: 'We were unable to find a user for this token.' });
		}
		// if the user is already verified, return error
		if (user.isVerified) {
			return res.status(400).json({ message: 'This user has already been verified.' });
		}
		// token exists and the user is not verified, so we can verify the user
		user.isVerified = true;
		// save it
		await user.save();
		// return success
		return res.status(200).json({ message: "The account has been verified. Please log in." });
	} catch (error) {
		res.status(500).json({ message: error.message })
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
			return res.status(401).json({ message: 'Email not found or invalid email' });
		}
		// if the user is already verified, return error
		if (user.isVerified) {
			return res.status(400).json({ message: 'This account has already been verified. Please log in.' });
		}
		// generate a new token 
		const token = user.generateVerificationToken();
		// Save the verification token
		await token.save();
		// make the url
		const url = `http://${req.headers.host}/api/auth/verify/${token.token}`;
		// send email
		await AuthHelper.sendVerificationEmail(user, url);


		return res.status(200).json({ message: 'A verification email has been sent to ' + user.email + '.' });
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
};

exports.forgot = async (req, res) => {
	try {
		const { email } = req.body;
		// find the user with the email
		const user = await User.findOne({ email });
		// if user is not found, return error
		if (!user) {
			return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });
		}
		// generate and set password reset token
		user.generatePasswordReset();
		// Save the updated user object
		await user.save();
		// now send the password change request email
		
		// make the url
		const url = `http://${req.headers.host}/api/auth/reset/${user.resetPasswordToken}`;

		await AuthHelper.sendPasswordResetEmail(user, url);

		res.status(200).json({ message: 'A reset email has been sent to ' + user.email + '.' });
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
	try {
		const { token } = req.params;

		const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

		if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });

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

		res.status(200).json({ message: 'Your password has been updated.' });

	} catch (error) {
		res.status(500).json({ message: error.message })
	}
};

exports.logged = async (req, res) => {
	try {
		let logged = false;
		if(req.user) logged = true;
		// return if the user is logged
		return res.status(200).json({ logged });
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}
