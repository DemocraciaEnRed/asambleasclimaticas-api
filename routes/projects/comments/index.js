const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const constants = require('../../../services/constants');
const authenticate = require('../../../middlewares/authorize');
const exists = require('../../../middlewares/exists');
const projectAuthorization = require('../../../middlewares/projectAuthorization');
const validate = require('../../../middlewares/validate');

const CommentController = require('../../../controllers/commentController');
const LikeController = require('../../../controllers/likeController');  
const ProjectController = require('../../../controllers/projectController');
const project = require('../../../models/project');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects/:projectId/comments
// -----------------------------------------------
// GET 		  /projects/:projectId/comments
// POST 	  /projects/:projectId/comments
// DELETE 	/projects/:projectId/comments/:commentId
// POST 	  /projects/:projectId/comments/:commentId/like
// POST 	  /projects/:projectId/comments/:commentId/dislike
// POST 	  /projects/:projectId/comments/:commentId/resolve
// POST 	  /projects/:projectId/comments/:commentId/highlight
// GET		  /projects/:projectId/comments/:commentId/replies
// POST 	  /projects/:projectId/comments/:commentId/replies
// POST 	  /projects/:projectId/comments/:commentId/replies/:replyId/like
// POST 	  /projects/:projectId/comments/:commentId/replies/:replyId/dislike
// -----------------------------------------------

// GET 		/projects/:projectId/comments
router.get('/',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	CommentController.listComments
)
// POST 	/projects/:projectId/comments
router.post('/',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	CommentController.createComment
)


// DELETE /projects/:projectId/comments/:commentId
router.delete('/:commentId',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.onlyModerators,
	CommentController.deleteComment
)

// POST 	/projects/:projectId/comments/:commentId/like
router.post('/:commentId/like',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleLike
)

// POST 	/projects/:projectId/comments/:commentId/dislike
router.post('/:commentId/dislike',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleDislike
)

// POST 	/projects/:projectId/comments/:commentId/resolve
router.post('/:commentId/resolve',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.onlyEditors,
	CommentController.resolveComment
)

// POST 	/projects/:projectId/comments/:commentId/highlight
router.post('/:commentId/highlight',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
	], 
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.onlyEditors,
	CommentController.highlightComment
)

// GET		/projects/:projectId/comments/:commentId/replies
router.get('/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	CommentController.listReplies
)

// POST 	/projects/:projectId/comments/:commentId/replies
router.post('/:commentId/replies',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	CommentController.createReply	
)

// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/like
router.post('/:commentId/replies/:replyId/like',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	],
	validate,
	exists.project,
	exists.comment,
	exists.reply,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleLike
)

// POST 	/projects/:projectId/comments/:commentId/replies/:replyId/dislike
router.post('/:commentId/replies/:replyId/dislike',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		param('replyId').isMongoId().withMessage('Invalid Reply ID'),
	],
	validate,
	exists.project,
	exists.comment,
	exists.reply,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleDislike
)

// export router
module.exports = router;