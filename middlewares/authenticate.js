const passport = require("passport");
const i18n = require('../services/i18n');

module.exports = (req, res, next) => {
	// if there is no token, continue
	// if (!req.headers.authorization) return next();
  // console.log('optionalAuthenticate')
	passport.authenticate('jwt', function (err, user, info) {
		if (err) return next(err);

		if (!user) {
			return next();
		}

		req.user = user;
		// set up locale
		i18n.setLocale(req, user.lang || 'es');
		return next();
	})(req, res, next);
};