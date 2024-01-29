/**
 * This middleware checks if the request has a req.user object.
 * If it does, it returns a 403 error.
 * This middleware is used in routes that should only be accessed by anonymous users.
*/

module.exports = (req, res, next) => {
  if(req.user) {
    console.error('requiresAnon - User is already logged in');
    return res.status(403).json({ message: req.__('auth.error.alreadyLoggedIn') });
  }

  // No user, continue
  next();
}