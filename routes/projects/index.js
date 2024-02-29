const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const validate = require('../../middlewares/validate');
const constants = require('../../services/constants');
const authorize = require('../../middlewares/authorize');
const exists = require('../../middlewares/exists');
const projectAuthorization = require('../../middlewares/projectAuthorization');


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
// GET			/projects/:projectId/stats
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
		query('page').optional().isInt({min: 1}).withMessage('validationError.page'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('validationError.limit'),
	],
	ProjectController.listProjects
);

// POST /projects
router.post('/',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR), // checks if the user is authenticated and adds it to the request object (req.user)
	[
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('slug').isString().isSlug().withMessage('Slug must be a string with no spaces and URL friendly'),
		body('coverUrl').optional().isString().isURL().withMessage('Cover URL must be a valid URL'),
		body('youtubeUrl').optional().isString().isURL().withMessage('Youtube URL must be a valid URL'),
		body('author').optional().isMongoId().withMessage('Author must be a valid Mongo ID'),
		body('shortAbout_es').isString().withMessage('Short about (es) must be a string'),
		body('shortAbout_pt').isString().withMessage('Short about (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
		body('stage').isString().withMessage('Stage must be a string'),
		body('closedAt').isISO8601().withMessage('Closed at must be a valid date'),
		body('publishedAt').optional().isISO8601().withMessage('Published at must be a valid date'),
		body('articles').isArray().withMessage('Articles must be an array'),
		body('articles.*.position').isInt().withMessage('Article position must be an integer'),
		body('articles.*.text_es').isString().withMessage('Article body (es) must be a string'),
		body('articles.*.text_pt').isString().withMessage('Article body (pt) must be a string'),
	],
	validate, // validates the array of checks above
	ProjectController.createProject
)

// GET /projects/:projectId
router.get('/:projectId', 
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		query('withArticles').optional().isBoolean().withMessage('withArticles must be a boolean'),
		// query('withComments').optional().isBoolean().withMessage('withComments must be a boolean'),
	], 
	validate, // validates the array of checks above
	exists.project, // checks if the project exists and adds it to the request object
	projectAuthorization.isAccesible, // checks if the project is accesible
	ProjectController.getProject // calls the controller
)

// PUT /projects/:projectId
router.put('/:projectId',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('slug').isString().isSlug().withMessage('Slug must be a string with no spaces and URL friendly'),
		body('coverUrl').optional().isString().isURL().withMessage('Cover URL must be a valid URL'),
		body('youtubeUrl').optional().isString().isURL().withMessage('Youtube URL must be a valid URL'),
		body('author').optional().isMongoId().withMessage('Author must be a valid Mongo ID'),
		body('stage').isString().withMessage('Stage must be a string'),
		body('shortAbout_es').isString().withMessage('Short about (es) must be a string'),
		body('shortAbout_pt').isString().withMessage('Short about (pt) must be a string'),
		body('authorNotes_es').optional().isString().withMessage('Author Notes (es) must be a string'),
		body('authorNotes_pt').optional().isString().withMessage('Author Notes (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
		body('closedAt').isISO8601().withMessage('Closed at must be a valid date'),
	],
	validate,
	exists.project,
	projectAuthorization.onlyEditors,
	ProjectController.updateProject
)

// POST /projects/:projectId/publish
router.post('/:projectId/publish',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	], 
	validate,
	exists.project,
	projectAuthorization.onlyEditors,
	ProjectController.publishProject
)


// POST /projects/:projectId/hide
router.post('/:projectId/hide',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	], 
	validate,
	exists.project,
	projectAuthorization.onlyEditors,
	ProjectController.toggleHideProject
)

// POST 	/projects/:projectId/like
router.post('/:projectId/like',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	], 
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleLike
)

// POST 	/projects/:projectId/dislike
router.post('/:projectId/dislike',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	], 
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleDislike
)

// GET /projects/:projectId/stats
router.get('/:projectId/stats',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	], 
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	ProjectController.getProjectStats
)


// add /articles routes
// -----------------------------------------------
router.use('/:projectId/articles', ArticlesRoutes);
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