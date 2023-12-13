const User = require('../models/user');
const UserHelper = require('../helpers/usersHelper');
const agenda = require('../services/agenda');


exports.list = async function (req, res) {
	try {
		const user = req.user;
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		let includeDeleted = false;
		let public = true;
		let extraQuery = null;
		// if it is an admin
		if (user && user.role === 'admin') {
			public = false;
			// check req.query.includeDeleted
			if (req.query.includeDeleted && req.query.includeDeleted === 'true') {
				includeDeleted = true;
			}
		}

		// get the users
		const output = await UserHelper.listUsers(page, limit, extraQuery, public, includeDeleted);
		return res.json(output);

	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
}

exports.me = async function (req, res) {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId, {
			password: false,
			resetPasswordToken: false,
			resetPasswordExpires: false,
			createdAt: false,
			updatedAt: false,
			__v: false
		}).populate({
			path: 'country',
			select: '_id name code emoji unicode image'
		})
		return res.status(200).json(user);
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: error.message })
	}
};

/**
 * Returns a specific user
 * @returns 
 */
exports.get = async function (req, res) {
	try {
		const userId = req.params.userId;
		const userLogged = req.user;
		let querySelect = {
			password: false,
			resetPasswordToken: false,
			resetPasswordExpires: false,
			isVerified: false,
			createdAt: false,
			updatedAt: false,
			__v: false
		}
		const querySelectForAdmins = {
			password: false,
			__v: false
		}
		
		let queryProjection;

		if(userLogged && userLogged.role.includes['admin']){
			queryProjection = querySelectForAdmins;
		}

		const user = await User.findById(userId, querySelect);

		if (!user) return res.status(401).json({ message: 'User does not exist' });

		return res.status(200).json(user);
	} catch (error) {
		return res.status(500).json({ message: error.message })
	}
};

// /**
//  * Creates a new user and sends a verification email
//  * @param {Object} req.body.email - The email of the user
//  * @param {Object} req.body.password - The password of the user
//  * @param {Object} req.body.fullname - The fullname of the user
//  * @param {Object} req.body.language - The language of the user
//  * 
//  * @returns 
//  */
// exports.create = async (req, res) => {
// 	try {
// 		const { email } = req.body;

// 		// Make sure this account doesn't already exist
// 		const user = await User.findOne({ email });

// 		if (user) return res.status(401).json({ message: 'The email address you have entered is already associated with another account. You can change this users role instead.' });

// 		const newUser = new User({ ...req.body, password });

// 		const user_ = await newUser.save();

// 		//Generate and set password reset token
// 		user_.generatePasswordReset();

// 		await user_.save();

// 		// send email
// 		agenda.now('send-mail', {
// 			template: "signup",
// 			subject: "Completá tu registro",
// 			to: [user_.email],
// 			url: "http://" + req.headers.host + "/api/auth/reset/" + user_.resetPasswordToken
// 		})

// 		console.log("http://" + req.headers.host + "/api/auth/reset/" + user_.resetPasswordToken)

// 		return res.status(200).json({ message: 'An email has been sent to ' + user_.email + '.' });

// 	} catch (error) {
// 		console.error(error)
// 		return res.status(500).json({ success: false, message: error.message })
// 	}
// };


// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
	try {
		const update = req.body;
		const id = req.params.id;
		const userId = req.user._id;

		// Make sure the passed id is that of the logged in user
		if (userId.toString() !== id.toString()) return res.status(401).json({ message: "Sorry, you don't have the permission to upd this data." });

		const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true });

		return res.status(200).json({ user, message: 'User has been updated' });

	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

