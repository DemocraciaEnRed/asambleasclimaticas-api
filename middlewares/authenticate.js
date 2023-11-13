const passport = require("passport");

// roles can be null, a string, or an array of strings representing the roles that are allowed to access the route.
module.exports = (roles) => {
    return (req, res, next) => {
        passport.authenticate('jwt', function(err, user, info) {
            if (err) return next(err);
    
            if (!user) {
                console.log('JWT - Unauthorized Access - No Token Provided!');
                return res.status(401).json({message: "Unauthorized Access - No Token Provided!"});
            }

            // If roles is not defined, allow access to all roles
            if(roles == undefined || roles == null) {
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
                    return res.status(403).json({message: 'Forbidden'}); // User doesn't have the required role
                }
            } else if (typeof roles === 'string') {
                // If roles is a single string, check if the user has this role
                if (userRole === roles) {
                    req.user = user;
                    return next(); // User has the required role, allow access
                } else {
                    return res.status(403).json({message: 'Forbidden'}); // User doesn't have the required role
                }
            } else {
                return res.status(500).json({message: 'Invalid role configuration'}); // Invalid role configuration
            }
        })(req, res, next);
    };
}