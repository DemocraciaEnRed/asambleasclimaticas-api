
// This middleware recieves a string or an array of strings representing the roles that are allowed to access the route.
exports.default = (roles) => {
  return (req, res, next) => {
      if(!req.user){
        res.status(401).send('Unauthorized');
      }

      const userRole = req.user.role;
      
      if (Array.isArray(roles)) {
          // If roles is an array, check if the user has any of these roles
          if (roles.includes(userRole)) {
              next(); // User has the required role, allow access
          } else {
              res.status(403).send('Forbidden'); // User doesn't have the required role
          }
      } else if (typeof roles === 'string') {
          // If roles is a single string, check if the user has this role
          if (userRole === roles) {
              next(); // User has the required role, allow access
          } else {
              res.status(403).send('Forbidden'); // User doesn't have the required role
          }
      } else {
          res.status(500).send('Invalid role configuration'); // Invalid role configuration
      }
  };
};