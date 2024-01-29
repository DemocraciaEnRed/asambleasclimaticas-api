const ProjectHelper = require('../helpers/projectsHelper');

/**
 * YOU MUST load the project with the "exists" middleware and authenticate the user before calling this middleware.
 * 
 * This middleware checks if the user can edit the project.
 * 
 * Editors are users that are admin or the author of the project.
 */
exports.onlyEditors = async (req, res, next) => {
  const project = req.project;
  const user = req.user;

  const canEdit = await ProjectHelper.canEdit(user, project)
  if (!canEdit) {
    return res.status(403).json({
      message: req.__('project.error.cantEdit')
    });
  }

  next();
}

/**
 * YOU MUST load the project with the "exists" middleware and authenticate the user before calling this middleware.
 * 
 * This middleware checks if the user can moderate the project.
 * 
 * Moderators can be users that are admin, the author of the project or a user with the role "moderator"
 */

exports.onlyModerators = async (req, res, next) => {
  const project = req.project;
  const user = req.user;

  const canEdit = await ProjectHelper.canModerate(user, project)
  if (!canEdit) {
    return res.status(403).json({
      message: req.__('project.error.cantModerate')
    });
  }

  next();
}

/**
 * YOU MUST load the project with the "exists" middleware and authenticate the user before calling this middleware.
 * 
 * This middleware checks if the project is accesible
 * 
 * A project is accesible to a "common" user if: (1) the project has a publishedAt date, (2) if the project is not hidden. 
 * 
 * But if the user is an admin or the author of the project, then the project is accesible even if it is hidden or unpublished.
 */
exports.isAccesible = async (req, res, next) => {
  const project = req.project;
  const user = req.user;

  // there is no user, check if the project is published and not hidden
  if(!user) {
    if(!project.publishedAt || project.hidden) {
      // the project is not accesible
      return res.status(403).json({
        message: req.__('project.error.notAvailable')
      });
    } else {
      // the project is accesible
      return next();
    }
  }

  // there is a user, check if the user is admin or author
  const canEdit = await ProjectHelper.canEdit(user, project);
  if(!canEdit) {
    // the user is not admin or author, check if the project is published and not hidden
    if(!project.publishedAt || project.hidden) {
      // the project is not accesible
      return res.status(403).json({
        message: req.__('project.error.notAvailable')
      });
    }
  }
  // the project is accesible
  next();
}

/**
 * YOU MUST load the project with the "exists" middleware and authenticate the user before calling this middleware.
 * 
 * This middleware checks if the project is open. The project has a "closedAt" date, if the current date is after the "closedAt" date, then the project is closed.
 *
 * If the user is admin or author, the middleware will allow the request to continue.
 */
exports.isOpenForContributions = async (req, res, next) => {
  const project = req.project;
  const user = req.user;

  // if there is a user...
  if(user){
    // check if the user is admin or author
    const canEdit = await ProjectHelper.canEdit(user, project);
    if(canEdit) {
      // admins or the author can contribute to the project even if it is closed
      return next();
    }
  }

  // if the project has no closedAt date, then the project is open indefinitely
  if(!project.closedAt) {
    // the project is open
    return next();
  }

  // the project has a closedAt date, check if the current date is after the closedAt date
  const now = new Date();
  if(now > project.closedAt) {
    // the project is closed
    return res.status(403).json({
      message: req.__('project.error.closed')
    });
  }

  // the project is open
  next();
}

/**
 * YOU MUST load the project with the "exists" middleware and authenticate the user before calling this middleware.
 * 
 * This middleware checks if the project is open. The project has a "closedAt" date, if the current date is after the "closedAt" date, then the project is closed.
 * 
 * Is similar to "isOpenForContributions" but even if the user is admin or author, the project must be open for the request to continue.
 */
exports.mustBeOpen = async (req, res, next) => {
  const project = req.project;

  // if the project has no closedAt date, then the project is open
  if(!project.closedAt) {
    // the project is open
    return next();
  }

  // the project has a closedAt date, check if the current date is after the closedAt date
  const now = new Date();
  if(now > project.closedAt) {
    // the project is closed
    return res.status(403).json({
      message: req.__('project.error.isClosed')
    });
  }

  // the project is open
  next();
}