const express = require('express');
const { check, param, body, query } = require('express-validator');
const constants = require('../../../../services/constants');
const authenticate = require('../../../../middlewares/authenticate');
const exists = require('../../../../middlewares/exists');
const validate = require('../../../../middlewares/validate');

const CommentController = require('../../../../controllers/commentController');
const LikeController = require('../../../../controllers/likeController');  
const ProjectController = require('../../../../controllers/projectController');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects/:projectId/articles/:articleId/comments
// -----------------------------------------------
// GET 		/projects/:projectId/articles/:articleId/comments
// POST 	/projects/:projectId/articles/:articleId/comments
// DELETE 	/projects/:projectId/articles/:articleId/comments/:commentId
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/like
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/dislike
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/resolve
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/highlight
// GET 		/projects/:projectId/articles/:articleId/comments/:commentId/replies
// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/replies
// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
// DELETE	/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/delete
// -----------------------------------------------

// GET 		/projects/:projectId/articles/:articleId/comments
router.get('/',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.article,
	CommentController.listComments
)

// POST 	/projects/:projectId/articles/:articleId/comments
router.post('/',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
		body('body').isString().withMessage('Content must be a string'),
	],
	validate,
	exists.project,
	exists.article,
	authenticate(),
	CommentController.createComment
)
// DELETE /projects/:projectId/articles/:articleId/comments/:commentId
router.delete('/:commentId',
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
	CommentController.deleteComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/like
router.post('/:commentId/like',
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
	LikeController.toggleLike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/dislike
router.post('/:commentId/dislike',
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
	LikeController.toggleDislike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/resolve
router.post('/:commentId/resolve',
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
	CommentController.resolveComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/highlight
router.post('/:commentId/highlight',
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
	CommentController.highlightComment
)

// GET 		/projects/:projectId/articles/:articleId/comments/:commentId/replies
router.get('/:commentId/replies',
	[
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
		param('commentId').isMongoId().withMessage('Invalid Comment ID'),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	exists.article,
	exists.comment,
	CommentController.listReplies
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/replies
router.post('/:commentId/replies',
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
	CommentController.createReply	
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
router.post('/:commentId/replies/:replyId/like',
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
	LikeController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
router.post('/:commentId/replies/:replyId/dislike',
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
	LikeController.toggleDislike
)

// DELETE	/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/delete
router.delete('/:commentId/replies/:replyId/delete',
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
	CommentController.deleteReply
)

module.exports = router;