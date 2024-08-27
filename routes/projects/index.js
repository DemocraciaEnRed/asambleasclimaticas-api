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
		body('title_es').isString().withMessage('validationError.text_es'),
		body('title_pt').isString().withMessage('validationError.text_pt'),
		body('slug').isString().isSlug().withMessage('validationError.slug'),
		body('coverUrl').optional().isString().isURL().withMessage('validationError.coverUrl'),
		body('youtubeUrl').optional().isString().isURL().withMessage('validationError.youtubeUrl'),
		body('author').optional().isMongoId().withMessage('validationError.mongoId'),
		body('shortAbout_es').isString().withMessage('validationError.shortAbout_es'),
		body('shortAbout_pt').isString().withMessage('validationError.shortAbout_pt'),
		body('about_es').isString().withMessage('validationError.about_es'),
		body('about_pt').isString().withMessage('validationError.about_pt'),
		body('stage').isString().isIn(constants.PROJECT_STAGES).withMessage('validationError.stage'),
		body('closedAt').isISO8601().withMessage('validationError.date'),
		body('publishedAt').optional().isISO8601().withMessage('validationError.date'),
		body('articles').isArray().withMessage('validationError.articles'),
		body('articles.*.position').isInt({min: 1}).withMessage('validationError.position'),
		body('articles.*.text_es').isString().withMessage('validationError.text_es'),
		body('articles.*.text_pt').isString().withMessage('validationError.text_pt'),
		body('articles.*.notInteractive').isBoolean().withMessage('validationError.notInteractive'),
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
		body('title_es').isString().withMessage('validationError.text_es'),
		body('title_pt').isString().withMessage('validationError.text_pt'),
		body('slug').isString().isSlug().withMessage('validationError.slug'),
		body('coverUrl').optional().isString().isURL().withMessage('validationError.coverUrl'),
		body('youtubeUrl').optional().isString().isURL().withMessage('validationError.youtubeUrl'),
		body('author').optional().isMongoId().withMessage('validationError.mongoId'),
		body('stage').isString().isIn(constants.PROJECT_STAGES).withMessage('validationError.stage'),
		body('shortAbout_es').isString().withMessage('validationError.shortAbout_es'),
		body('shortAbout_pt').isString().withMessage('validationError.shortAbout_pt'),
		body('authorNotes_es').optional().isString().withMessage('validationError.authorNotes_es'),
		body('authorNotes_pt').optional().isString().withMessage('validationError.authorNotes_pt'),
		body('about_es').isString().withMessage('validationError.about_es'),
		body('about_pt').isString().withMessage('validationError.about_pt'),
		body('closedAt').isISO8601().withMessage('validationError.date'),
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