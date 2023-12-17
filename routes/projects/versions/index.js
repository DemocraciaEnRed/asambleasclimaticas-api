const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const constants = require('../../../services/constants');
const authenticate = require('../../../middlewares/authenticate');
const exists = require('../../../middlewares/exists');
const validate = require('../../../middlewares/validate');

const ProjectController = require('../../../controllers/projectController');
const CommentController = require('../../../controllers/commentController');

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
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
		body('coverUrl').optional().isString().isURL().withMessage('Cover URL must be a valid URL'),
		body('youtubeUrl').optional().isString().isURL().withMessage('Youtube URL must be a valid URL'),
		body('stage').isString().withMessage('Stage must be a string'),
		body('closedAt').isISO8601().withMessage('Closed at must be a valid date'),
		body('articles').isArray().withMessage('Articles must be an array'),
		body('articles.*.position').isInt().withMessage('Article position must be an integer'),
		body('articles.*.body_es').isString().withMessage('Article body (es) must be a string'),
		body('articles.*.body_pt').isString().withMessage('Article body (pt) must be a string'),
	],
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.createVersion

)
// GET 		/projects/:projectId/versions/:version
router.get('/:version',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('version').isInt({min: 1}).withMessage('Invalid Version'),
	],
	validate,
	exists.project,
	exists.version,
	ProjectController.getVersion
)

// GET		/projects/:projectId/versions/:version/comments
router.get('/:version/comments',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('version').isInt({min: 1}).withMessage('Invalid Version'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.version,
	CommentController.listComments
)

// GET		/projects/:projectId/versions/:version/comments/:commentId/replies
router.get('/:version/comments/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('version').isInt({min: 1}).withMessage('Invalid Version'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.version,
	exists.comment,
	CommentController.listReplies
)

// GET 		/projects/:projectId/versions/:version/articles
// TODO

// GET		/projects/:projectId/versions/:version/articles/:articleId/comments
router.get('/:version/articles/:articleId/comments',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('version').isInt({min: 1}).withMessage('Invalid Version'),
    param('articleId').isMongoId().withMessage('Invalid Article ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.version,
  exists.article,
	CommentController.listComments
)

// POST		/projects/:projectId/versions/:version/articles/:articleId/comments/:commentId/replies
router.get('/:version/articles/:articleId/comments/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('version').isInt({min: 1}).withMessage('Invalid Version'),
    param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.version,
  exists.article,
	exists.comment,
	CommentController.listReplies
)

module.exports = router;
