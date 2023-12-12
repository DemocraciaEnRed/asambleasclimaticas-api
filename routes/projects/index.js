const express = require('express');
const { check, param, body, query } = require('express-validator');
const constants = require('../../services/constants');
const authenticate = require('../../middlewares/authenticate');
const exists = require('../../middlewares/exists');
const validate = require('../../middlewares/validate');


const ProjectController = require('../../controllers/projectController');
const CommentController = require('../../controllers/commentController');
const LikeController = require('../../controllers/likeController');

const CommentsRoutes = require('./comments');
const VersionsRoutes = require('./versions');
const ArticlesRoutes = require('./articles');
const EventsRoutes = require('./events');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects
// -----------------------------------------------
// GET 		  /projects
// POST 	  /projects
// GET 		  /projects/:projectId
// PUT 		  /projects/:projectId
// POST 	  /projects/:projectId/publish
// POST 	  /projects/:projectId/hide
// POST 	  /projects/:projectId/like
// POST 	  /projects/:projectId/dislike
// -----------------------------------------------
// ROUTER   /projects/:projectId/articles
// ROUTER   /projects/:projectId/comments
// ROUTER   /projects/:projectId/versions
// ROUTER   /projects/:projectId/events
// -----------------------------------------------

// GET /projects
router.get('/',
	[
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	ProjectController.listProjects
);

// POST /projects
router.post('/',
	[
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('path_es').isString().withMessage('Path (es) must be a string'),
		body('path_pt').isString().withMessage('Path (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
		body('closedAt').isISO8601().withMessage('Closed at must be a valid date'),
		body('articles').isArray().withMessage('Articles must be an array'),
		body('articles.*.position').isInt().withMessage('Article position must be an integer'),
		body('articles.*.body_es').isString().withMessage('Article body (es) must be a string'),
		body('articles.*.body_pt').isString().withMessage('Article body (pt) must be a string'),
	],
	validate, // validates the array of checks above
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR), // checks if the user is authenticated and adds it to the request object (req.user)
	ProjectController.createProject
)

// GET /projects/:projectId
router.get('/:projectId', 
	[
		query('withComments').optional().isBoolean().withMessage('withComments must be a boolean'),
		query('withArticles').optional().isBoolean().withMessage('withArticles must be a boolean'),
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate, // validates the array of checks above
	exists.project, // checks if the project exists and adds it to the request object
	ProjectController.getProject // calls the controller
)

// PUT /projects/:projectId
router.put('/:projectId',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('path_es').isString().withMessage('Path (es) must be a string'),
		body('path_pt').isString().withMessage('Path (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
		body('closedAt').isISO8601().withMessage('Closed at must be a valid date'),
	],
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.updateProject
)

// POST /projects/:projectId/publish
router.post('/:projectId/publish',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.publishProject
)


// POST /projects/:projectId/hide
router.post('/:projectId/hide',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.toggleHideProject
)

// POST 	/projects/:projectId/like
router.post('/:projectId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	LikeController.toggleLike
)

// POST 	/projects/:projectId/dislike
router.post('/:projectId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	LikeController.toggleDislike
)

// add /articles routes
// -----------------------------------------------
router.use('/:projectId/articles', ArticlesRoutes);
// -----------------------------------------------
// -----------------------------------------------
// add /comments routes
// -----------------------------------------------
router.use('/:projectId/comments', CommentsRoutes);
// -----------------------------------------------
// add /versions routes
// -----------------------------------------------
router.use('/:projectId/versions', VersionsRoutes);
// -----------------------------------------------
// add /events routes
// -----------------------------------------------
router.use('/:projectId/events', EventsRoutes);

module.exports = router;