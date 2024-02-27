const User = require('../models/user');
const Country = require('../models/country');
const UserHelper = require('../helpers/usersHelper');
const AuthHelper = require('../helpers/authHelper');
const agenda = require('../services/agenda');


exports.list = async function (req, res) {
	try {
		const user = req.user;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const query = req.query.query || null;
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

		// if there is a query
		if (query) {
			// query can be a string that is for the name or the email
			extraQuery = {
				$or: [
					{ name: { $regex: query, $options: 'i' } },
					{ email: { $regex: query, $options: 'i' } }
				]
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

		if (!user) return res.status(401).json({ message: req.__('user.error.notFound') });

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
		const userId = req.params.userId || req.user._id;
		const loggedUser = req.user;

		if(loggedUser.role != 'admin'){
			// Make sure the passed id is that of the logged in user
			if (userId !== loggedUser._id.toString()){
				return res.status(401).json({ message: req.__('auth.error.forbidden') });
			}
		}

		if(update.countryCode) {
			const country = await Country.findOne({ code: update.countryCode });
			if (!country) return res.status(400).json({ message: req.__('user.error.invalidCountryCode') });
			update.country = country._id;
			delete update.countryCode;
		}
		
		const user = await User.findByIdAndUpdate(userId, { $set: update }, { select: '-password -deletedAt -resetPasswordExpires -lastLogin -updatedAt -deletedAt -__v -createdAt -isVerified', new: true })
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		return res.status(200).json({ user, message: req.__('user.success.updated') });

	} catch (error) {
    console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
};

exports.changePassword = async function (req, res) {
	try {
		const userId = req.user._id
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		if (!user.comparePassword(currentPassword)) {
			return res.status(401).json({ message: req.__('user.error.invalidPassword') });
		}

		user.password = newPassword;
		await user.save();

		return res.status(200).json({ message: req.__('user.success.passwordUpdated') });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}
};

exports.changeEmail = async function (req, res) {
	// the user will have to match the current password
	// then a new verification email will be sent
	try {
		const userId = req.user._id;
		const { email, password } = req.body;

		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		if (!user.comparePassword(password)) {
			return res.status(401).json({ message: req.__('user.error.invalidPassword')  });
		}

		user.email = email;
		user.isVerified = false;
		await user.save();

		// generate a new token 
		const token = user.generateVerificationToken();
		// Save the verification token
		await token.save();
		// make the url
		const url = `${process.env.APP_URL}/auth/verify/${token.token}`;
		// send email
		await AuthHelper.sendVerificationEmail(user, url);

		return res.status(200).json({ 
			message: req.__('auth.success.verificationMailSent.invalidPassword') 
		});
		
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: req.__('error.default') });
	}	
}

exports.setRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const role = req.body.role;

		// check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: req.__('user.error.notFound') });
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

exports.forceVerifyByAdmin = async (req,res) => {
	try {
		const userId = req.params.userId;
		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		user.isVerified = true;
		await user.save();

		return res.status(200).json({ message: 'User has been verified' });
	} catch(error) {
		console.error(error)
		return res.status(500).json({message: req.__('error.default') })
	}
}

exports.changePasswordByAdmin = async (req,res) => {
	try {
		const userId = req.params.userId;
		const password = req.body.password;

		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		user.password = password;
		await user.save();		

		return res.status(200).json({ message: req.__('user.success.passwordUpdated') });
	} catch(error) {
		console.error(error)
		return res.status(500).json({message: req.__('error.default') })
	}
}

exports.changeEmailByAdmin = async (req,res) => {
	try {
		const userId = req.params.userId;
		const email = req.body.email;
		const forceVerified = req.body.forceVerified || false;

		const user = await User.findById(userId)
		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		user.email = email;

		if(forceVerified && req.user.role == 'admin'){
			user.isVerified = true;
			await user.save();
			return res.status(200).json({ message: req.__('user.success.emailAndUserVerified') });
		}

		// by default, changing the email address will make the user unverified
		user.isVerified = false;
		await user.save();

		// generate a new token 
		const token = user.generateVerificationToken();
		// Save the verification token
		await token.save();
		// make the url
		const url = `${process.env.APP_URL}/auth/verify/${token.token}`;
		// send email
		await AuthHelper.sendVerificationEmail(user, url);

		return res.status(200).json({ 
			message: req.__('user.success.emailChanged')
		});

	} catch(error) {
		console.error(error)
		return res.status(500).json({message: req.__('error.default') })
	}
}

exports.setParticipationInAssembly = async (req, res) => {
	try {
		const userId = req.params.userId;
		const participation = req.body.participatedInAssembly;
		const user = await User.findById(userId)

		if (!user) return res.status(404).json({ message: req.__('user.error.notFound') });

		user.participatedInAssembly = participation;

		await user.save();

		return res.status(200).json({ message: req.__('user.success.updated') });
	} catch(error) {
		console.error(error)
		return res.status(500).json({message: req.__('error.default') })
	}
}
