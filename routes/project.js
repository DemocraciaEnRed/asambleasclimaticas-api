const express = require('express');
const { check, param, body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const ProjectController = require('../controllers/project');
const constants = require('../services/constants');
const authenticate = require('../middlewares/authenticate');
const exists = require('../middlewares/exists');

// initialize router
const router = express.Router();


// GET /projects
router.get('/', ProjectController.list);

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
	ProjectController.create
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
	ProjectController.get // calls the controller
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
	ProjectController.update
)

// POST /projects/:projectId/publish
router.post('/:projectId/publish',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.publish
)


// POST /projects/:projectId/hide
router.post('/:projectId/hide',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.toggleHide
)

// POST 	/projects/:projectId/like
router.post('/:projectId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	ProjectController.toggleLike
)

// POST 	/projects/:projectId/dislike
router.post('/:projectId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	ProjectController.toggleDislike
)

// POST 	/projects/:projectId/event
// POST 	/projects/:projectId/version
// GET 		/projects/:projectId/version/:version
// GET 		/projects/:projectId/version/:version/articles
// POST 	/projects/:projectId/comments
router.post('/:projectId/comments',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	authenticate(),
	ProjectController.createComment
)


// DELETE /projects/:projectId/comments/:commentId
router.delete('/:projectId/comments/:commentId',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	authenticate(),
	ProjectController.deleteComment
)

// POST 	/projects/:projectId/comments/:commentId/like
router.post('/:projectId/comments/:commentId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	authenticate(),
	ProjectController.toggleLike
)

// POST 	/projects/:projectId/comments/:commentId/dislike
router.post('/:projectId/comments/:commentId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	authenticate(),
	ProjectController.toggleDislike
)

// POST 	/projects/:projectId/comments/:commentId/replies
router.post('/:projectId/comments/:commentId/replies',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	exists.comment,
	authenticate(),
	ProjectController.createReply	
)

// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/like
router.post('/:projectId/comments/:commentId/replies/:replyId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	],
	validate,
	exists.project,
	exists.comment,
	exists.reply,
	authenticate(),
	ProjectController.toggleLike
)
// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/dislike
router.post('/:projectId/comments/:commentId/replies/:replyId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	],
	validate,
	exists.project,
	exists.comment,
	exists.reply,
	authenticate(),
	ProjectController.toggleDislike
)

// GET 		/projects/:projectId/articles

// POST		/projects/:projectId/articles/:articleId/like
router.post('/:projectId/articles/:articleId/like',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	authenticate(),
	ProjectController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/dislike
router.post('/:projectId/articles/:articleId/dislike',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	authenticate(),
	ProjectController.toggleDislike
)

// POST 	/projects/:projectId/articles/:articleId/comments
router.post('/:projectId/articles/:articleId/comments',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	exists.article,
	authenticate(),
	ProjectController.createComment
)
// DELETE /projects/:projectId/articles/:articleId/comments/:commentId
router.delete('/:projectId/articles/:articleId/comments/:commentId',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
		check('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.deleteComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/like
router.post('/:projectId/articles/:articleId/comments/:commentId/like',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
		check('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.toggleLike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/dislike
router.post('/:projectId/articles/:articleId/comments/:commentId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.toggleDislike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/resolve
router.post('/:projectId/articles/:articleId/comments/:commentId/resolve',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.resolveComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/highlight
router.post('/:projectId/articles/:articleId/comments/:commentId/highlight',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.highlightComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/replies
router.post('/:projectId/articles/:articleId/comments/:commentId/replies',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	exists.article,
	exists.comment,
	authenticate(),
	ProjectController.createReply	
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
router.post('/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	authenticate(),
	ProjectController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
router.post('/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	authenticate(),
	ProjectController.toggleDislike
)

// DELETE	/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/delete
router.delete('/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/delete',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	authenticate(),
	ProjectController.deleteReply
)




module.exports = router;