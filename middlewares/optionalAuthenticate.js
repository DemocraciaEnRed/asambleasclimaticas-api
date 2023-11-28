const passport = require("passport");

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
		return next();
	})(req, res, next);
};