const passport = require("passport");

/**
 * Middleware that recieves an array of roles and checks if the user has any of these roles.
 * If the user has any of these roles, the next middleware is called.
 * If the user doesn't have any of these roles, a 403 Forbidden error is returned.
 * If the user is not authenticated, a 401 Unauthorized error is returned.
 * If roles is not defined or an empty array, any authenticated user can access the route.
 * @param {Array|String|null|undefined} roles - An array of roles. Can be a single string or an array of strings.
 * @returns 
 */
module.exports = (roles) => {
	return (req, res, next) => {
		passport.authenticate('jwt', function (err, user, info) {
			if (err) return next(err);

			if (!user) {
				console.log('JWT - Unauthorized Access - No Token Provided!');
				return res.status(401).json({ message: "Unauthorized Access - No Token Provided!" });
			}

			// If roles is not defined, allow access to all roles
			if (roles == undefined || roles == null) {
				req.user = user;
				return next();
			}

			const userRole = user.role;

			if (Array.isArray(roles)) {
				// If roles is an array, check if the user has any of these roles
				if (roles.includes(userRole)) {
					req.user = user;
					return next(); // User has the required role, allow access
				} else {
					return res.status(403).json({ message: 'Forbidden' }); // User doesn't have the required role
				}
			} else if (typeof roles === 'string') {
				// If roles is a single string, check if the user has this role
				if (userRole === roles) {
					req.user = user;
					return next(); // User has the required role, allow access
				} else {
					return res.status(403).json({ message: 'Forbidden' }); // User doesn't have the required role
				}
			} else {
				return res.status(500).json({ message: 'Invalid role configuration' }); // Invalid role configuration
			}
		})(req, res, next);
	};
}
