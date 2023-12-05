const express = require('express');
const { check, param, body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const ProjectController = require('../controllers/project');
const constants = require('../services/constants');
const authenticate = require('../middlewares/authenticate');
const exists = require('../middlewares/exists');

// initialize router
const router = express.Router();


// GET /project
router.get('/', ProjectController.list);

// POST /project
router.post('/',
	[
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('path_es').isString().withMessage('Path (es) must be a string'),
		body('path_pt').isString().withMessage('Path (pt) must be a string'),
		body('about_es').isString().withMessage('About (es) must be a string'),
		body('about_pt').isString().withMessage('About (pt) must be a string'),
	],
	validate, // validates the array of checks above
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR), // checks if the user is authenticated and adds it to the request object (req.user)
	ProjectController.create
)


// GET /project/:id
router.get('/:projectId', 
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate, // validates the array of checks above
	exists.project, // checks if the project exists and adds it to the request object
	ProjectController.get // calls the controller
)

// PUT /project/:id
// router.put('/:projectId', [
// 	check('projectId').isMongoId().withMessage('Invalid Project ID'),
// ], validate, authenticate(constants.ROLES.ADMIN_OR_AUTHOR), ProjectController.update)

// POST /project/:id/hide
router.post('/:projectId/hide',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	ProjectController.toggleHide
)

// POST 	/project/:projectId/like
router.post('/:projectId/like',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	ProjectController.toggleLike
)

// POST 	/project/:projectId/dislike
router.post('/:projectId/dislike',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	], 
	validate,
	exists.project,
	authenticate(),
	ProjectController.toggleDislike
)

// POST 	/project/:projectId/event
// POST 	/project/:projectId/version
// GET 		/project/:projectId/version/:version
// GET 		/project/:projectId/version/:version/article
// POST 	/project/:projectId/comment
router.post('/:projectId/comment',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	authenticate(),
	ProjectController.createComment
)


// DELETE /project/:projectId/comment/:commentId
router.delete('/:projectId/comment/:commentId',
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

// POST 	/project/:projectId/comment/:commentId/like
router.post('/:projectId/comment/:commentId/like',
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

// POST 	/project/:projectId/comment/:commentId/dislike
router.post('/:projectId/comment/:commentId/dislike',
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

// POST 	/project/:projectId/comment/:commentId/reply
router.post('/:projectId/comment/:commentId/reply',
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

// POST 	/project/:projectId/comment/:commentId/reply/:replyId/like
router.post('/:projectId/comment/:commentId/reply/:replyId/like',
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
// POST 	/project/:projectId/comment/:commentId/reply/:replyId/dislike
router.post('/:projectId/comment/:commentId/reply/:replyId/dislike',
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

// GET 		/project/:projectId/article

// POST		/project/:projectId/article/:articleId/like
router.post('/:projectId/article/:articleId/like',
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

// POST		/project/:projectId/article/:articleId/dislike
router.post('/:projectId/article/:articleId/dislike',
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

// POST 	/project/:projectId/article/:articleId/comment
router.post('/:projectId/article/:articleId/comment',
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
// DELETE /project/:projectId/article/:articleId/comment/:commentId
router.delete('/:projectId/article/:articleId/comment/:commentId',
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

// POST 	/project/:projectId/article/:articleId/comment/:commentId/like
router.post('/:projectId/article/:articleId/comment/:commentId/like',
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

// POST 	/project/:projectId/article/:articleId/comment/:commentId/dislike
router.post('/:projectId/article/:articleId/comment/:commentId/dislike',
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

// POST 	/project/:projectId/article/:articleId/comment/:commentId/resolve
router.post('/:projectId/article/:articleId/comment/:commentId/resolve',
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

// POST 	/project/:projectId/article/:articleId/comment/:commentId/highlight
router.post('/:projectId/article/:articleId/comment/:commentId/highlight',
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

// POST 	/project/:projectId/article/:articleId/comment/:commentId/reply
router.post('/:projectId/article/:articleId/comment/:commentId/reply',
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

// DELETE	/project/:projectId/article/:articleId/comment/:commentId/reply/:replyId/delete
router.delete('/:projectId/article/:articleId/comment/:commentId/reply/:replyId/delete',
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