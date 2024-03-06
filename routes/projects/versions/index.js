const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const validate = require('../../../middlewares/validate');
const constants = require('../../../services/constants');
const authorize = require('../../../middlewares/authorize');
const exists = require('../../../middlewares/exists');
const projectAuthorization = require('../../../middlewares/projectAuthorization');

const ProjectController = require('../../../controllers/projectController');
const CommentController = require('../../../controllers/commentController');
const project = require('../../../models/project');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects/:projectId/versions
// -----------------------------------------------
// POST 	  /
// GET 		  /:version
// GET		  /:version/comments
// GET		  /:version/comments/:commentId/replies
// GET 		  /:version/articles
// GET		  /:version/articles/:articleId/comments
// POST		  /:version/articles/:articleId/comments/:commentId/replies
// -----------------------------------------------


// POST 	/projects/:projectId/versions
router.post('/',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		body('title_es').isString().withMessage('validationError.text_es'),
		body('title_pt').isString().withMessage('validationError.text_pt'),
		body('about_es').isString().withMessage('validationError.about_es'),
		body('about_pt').isString().withMessage('validationError.about_pt'),
		body('authorNotes_es').isString().withMessage('validationError.authorNotes_es'),
		body('authorNotes_pt').isString().withMessage('validationError.authorNotes_pt'),
		body('coverUrl').optional().isString().isURL().withMessage('validationError.coverUrl'),
		body('youtubeUrl').optional().isString().isURL().withMessage('validationError.youtubeUrl'),
		body('stage').isString().isIn(constants.PROJECT_STAGES).withMessage('validationError.stage'),
		body('closedAt').isISO8601().withMessage('validationError.date'),
		body('articles').isArray().withMessage('validationError.articles'),
		body('articles.*.position').isInt({min: 1}).withMessage('validationError.position'),
		body('articles.*.text_es').isString().withMessage('validationError.text_es'),
		body('articles.*.text_pt').isString().withMessage('validationError.text_pt'),
	],
	validate,
	exists.project,
	projectAuthorization.onlyEditors,
	ProjectController.createVersion

)
// GET 		/projects/:projectId/versions/:version
router.get('/:version',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
	],
	validate,
	exists.project,
	exists.version,
	projectAuthorization.isAccesible,
	ProjectController.getVersion
)

// GET		/projects/:projectId/versions/:version/comments
router.get('/:version/comments',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
		query('page').optional().isInt({min: 1}).withMessage('validationError.page'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.version,
	projectAuthorization.isAccesible,
	CommentController.listComments
)

// GET		/projects/:projectId/versions/:version/comments/:commentId/replies
router.get('/:version/comments/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		query('page').optional().isInt({min: 1}).withMessage('validationError.page'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.version,
	exists.comment,
	projectAuthorization.isAccesible,
	CommentController.listReplies
)

// GET 		/projects/:projectId/versions/:version/articles
router.get('/:version/articles',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
	],
	validate,
	exists.project,
	exists.version,
	projectAuthorization.isAccesible,
	ProjectController.getArticles
)

// GET		/projects/:projectId/versions/:version/articles/:articleId/comments
router.get('/:version/articles/:articleId/comments',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
    param('articleId').isMongoId().withMessage('validationError.mongoId'),
		query('page').optional().isInt({min: 1}).withMessage('validationError.page'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.version,
  exists.article,
	projectAuthorization.isAccesible,
	CommentController.listComments
)

// POST		/projects/:projectId/versions/:version/articles/:articleId/comments/:commentId/replies
router.get('/:version/articles/:articleId/comments/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('version').isInt({min: 1}).withMessage('validationError.version'),
    param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		query('page').optional().isInt({min: 1}).withMessage('validationError.page'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.version,
  exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	CommentController.listReplies
)

module.exports = router;
