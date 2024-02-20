const passport = require("passport");
const i18n = require('../services/i18n');

module.exports = (roles) => (req, res, next) => {
	// optionalAuthenticate runs first, so it will set req.user if there is a token

	// if there is no user, dont continue
	if (!req.user) {
		console.error('JWT - Unauthorized Access - No Token Provided!');
		return res.status(401).json({ message: req.__('auth.error.noToken') });
	}
	// If roles is not defined, allow access to all roles
	if (roles == undefined || roles == null) {
		return next();
	}

	const userRole = req.user.role;
	
	if (Array.isArray(roles)) {
		// If roles is an array, check if the user has any of these roles
		if (roles.includes(userRole)) {
			return next(); // User has the required role, allow access
		} else {
			console.error('JWT - Unauthorized Access - User does not have the required role');
			return res.status(403).json({ message: req.__('auth.error.forbidden') }); // User doesn't have the required role
		}
	} else if (typeof roles === 'string') {
		// If roles is a single string, check if the user has this role
		if (userRole === roles) {
			return next(); // User has the required role, allow access
		} else {
			console.error('JWT - Unauthorized Access - User does not have the required role');
			return res.status(403).json({ message: req.__('auth.error.forbidden') }); // User doesn't have the required role
		}
	} else {
		console.error('authenticate.js - Invalid role configuration');
		return res.status(500).json({ message: req.__('error.default') });
	}

}
	


// /**
//  * Middleware that recieves an array of roles and checks if the user has any of these roles.
//  * If the user has any of these roles, the next middleware is called.
//  * If the user doesn't have any of these roles, a 403 Forbidden error is returned.
//  * If the user is not authenticated, a 401 Unauthorized error is returned.
//  * If roles is not defined or an empty array, any authenticated user can access the route.
//  * @param {Array|String|null|undefined} roles - An array of roles. Can be a single string or an array of strings.
//  * @returns 
//  */
// module.exports = (roles) => {
// 	return (req, res, next) => {
// 		passport.authenticate('jwt', function (err, user, info) {
// 			if (err) return next(err);

// 			if (!user) {
// 				console.error('JWT - Unauthorized Access - No Token Provided!');
// 				return res.status(401).json({ message: req.__('auth.error.noToken') });
// 			}

// 			// If roles is not defined, allow access to all roles
// 			if (roles == undefined || roles == null) {
// 				req.user = user;
// 				// set up locale
// 				i18n.setLocale(req, user.lang || 'es');
// 				return next();
// 			}

// 			const userRole = user.role;

// 			if (Array.isArray(roles)) {
// 				// If roles is an array, check if the user has any of these roles
// 				if (roles.includes(userRole)) {
// 					req.user = user;
// 					i18n.setLocale(req, user.lang || 'es');
// 					return next(); // User has the required role, allow access
// 				} else {
// 					console.error('JWT - Unauthorized Access - User does not have the required role');
// 					return res.status(403).json({ message: req.__('auth.error.forbidden') }); // User doesn't have the required role
// 				}
// 			} else if (typeof roles === 'string') {
// 				// If roles is a single string, check if the user has this role
// 				if (userRole === roles) {
// 					req.user = user;
// 					i18n.setLocale(req, user.lang || 'es');
// 					return next(); // User has the required role, allow access
// 				} else {
// 					console.error('JWT - Unauthorized Access - User does not have the required role');
// 					return res.status(403).json({ message: req.__('auth.error.forbidden') }); // User doesn't have the required role
// 				}
// 			} else {
// 				console.error('authenticate.js - Invalid role configuration');
// 				return res.status(500).json({ message: req.__('error.default') });
// 			}
// 		})(req, res, next);
// 	};
// }
