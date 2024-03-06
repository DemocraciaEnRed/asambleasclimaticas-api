const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const constants = require('../../../../services/constants');
const authorize = require('../../../../middlewares/authorize');
const exists = require('../../../../middlewares/exists');
const projectAuthorization = require('../../../../middlewares/projectAuthorization');
const validate = require('../../../../middlewares/validate');

const CommentController = require('../../../../controllers/commentController');
const LikeController = require('../../../../controllers/likeController');  
const ProjectController = require('../../../../controllers/projectController');
const optionalAuthenticate = require('../../../../middlewares/authenticate');

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
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		query('page').optional().isInt({ min: 1 }).withMessage('validationError.page'),
    query('limit').optional().isInt({ min: 10, max: 25 }).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.article,
	projectAuthorization.isAccesible,
	CommentController.listComments
)

// POST 	/projects/:projectId/articles/:articleId/comments
router.post('/',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		body('body').isString().withMessage('validationError.text'),
	],
	validate,
	exists.project,
	exists.article,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	CommentController.createComment
)
// DELETE /projects/:projectId/articles/:articleId/comments/:commentId
router.delete('/:commentId',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	CommentController.deleteComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/like
router.post('/:commentId/like',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	LikeController.toggleLike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/dislike
router.post('/:commentId/dislike',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	LikeController.toggleDislike
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/resolve
router.post('/:commentId/resolve',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.onlyEditors,
	CommentController.resolveComment
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/highlight
router.post('/:commentId/highlight',
	authorize(constants.ROLES.ADMIN_OR_AUTHOR),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.onlyEditors,
	CommentController.highlightComment
)

// GET 		/projects/:projectId/articles/:articleId/comments/:commentId/replies
router.get('/:commentId/replies',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		query('page').optional().isInt({ min: 1 }).withMessage('validationError.page'),
    query('limit').optional().isInt({ min: 10, max: 25 }).withMessage('validationError.limit'),
	],
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	CommentController.listReplies
)

// POST 	/projects/:projectId/articles/:articleId/comments/:commentId/replies
router.post('/:commentId/replies',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		body('body').isString().withMessage('validationError.text'),
	],
	validate,
	exists.project,
	exists.article,
	exists.comment,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	CommentController.createReply	
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/like
router.post('/:commentId/replies/:replyId/like',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		param('replyId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	projectAuthorization.isAccesible,
	LikeController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId/dislike
router.post('/:commentId/replies/:replyId/dislike',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		param('replyId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	projectAuthorization.isAccesible,
	LikeController.toggleDislike
)

// DELETE	/projects/:projectId/articles/:articleId/comments/:commentId/replies/:replyId
router.delete('/:commentId/replies/:replyId',
	authorize(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('validationError.mongoId'),
		param('commentId').isMongoId().withMessage('validationError.mongoId'),
		param('replyId').isMongoId().withMessage('validationError.mongoId'),
	], 
	validate,
	exists.project,
	exists.article,
	exists.comment,
	exists.reply,
	projectAuthorization.isAccesible,
	CommentController.deleteReply
)

module.exports = router;