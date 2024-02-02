const User = require('../models/user');
const Country = require('../models/country');
const UserHelper = require('../helpers/usersHelper');
const agenda = require('../services/agenda');


exports.list = async function (req, res) {
	try {
		const user = req.user;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
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
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
}

exports.listAuthors = async function (req, res) {
	try {
		const user = req.user;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		let includeDeleted = false;
		let public = true;
		let extraQuery = {role: {$in: ['author', 'admin']}}; // only authors and admins
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
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
}				

exports.me = async function (req, res) {
	try {
		// check if the query has a "refreshToken" param
		const refreshToken = req.query.refreshToken || null;
		// get the userId
		const userId = req.user._id;
		const output = {};

		// get the user
		const user = await User.findById(userId, {
			password: false,
			resetPasswordToken: false,
			resetPasswordExpires: false,
			createdAt: false,
			updatedAt: false,
			deletedAt: false,
			__v: false
		}, ).populate({
			path: 'country',
			select: '_id name code emoji unicode image'
		})
		output.user = user;
		// if there is a refreshToken, generate a new token
		if (refreshToken) {
			output.token = await user.generateJWT();
		}
		return res.status(200).json(output);
	} catch (error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
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
		
		let queryProjection = querySelect;

		if(userLogged && userLogged.role == 'admin'){
			queryProjection = querySelectForAdmins;
		}

		const user = await User.findById(userId, queryProjection).populate({
			path: 'country',
			select: '_id name code emoji unicode image'
		});

		if (!user) return res.status(401).json({ message: 'User does not exist' });

		return res.status(200).json(user);
	} catch (error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
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

exports.update = async function (req, res) {
	try {
		const update = req.body;
		const userId = req.params.userId;
		const loggedUser = req.user;

		if(loggedUser.role != 'admin'){
			// Make sure the passed id is that of the logged in user
			if (userId !== loggedUser._id.toString()){
				return res.status(401).json({ message: "Sorry, you don't have the permission to update this data." });
			}
		}

		if(update.countryCode) {
			const country = await Country.findOne({ code: update.countryCode });
			if (!country) return res.status(400).json({ message: 'Invalid country code' });
			update.country = country._id;
			delete update.countryCode;
		}

		console.log(update) 

		const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });

		return res.status(200).json({ user, message: 'User has been updated' });

	} catch (error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
};


exports.setRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const role = req.body.role;

		// check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // check if the role is valid
    user.role = role;
    await user.save();

    return res.status(200).send()
  } catch (error) {
		console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
}
