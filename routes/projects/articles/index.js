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

const CommentsRoutes = require('./comments');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects/:projectId/articles
// -----------------------------------------------
// GET 		  /projects/:projectId/articles
// POST		  /projects/:projectId/articles/:articleId/like
// POST		  /projects/:projectId/articles/:articleId/dislike
// -----------------------------------------------
// ROUTER   /projects/:projectId/articles/:articleId/comments
// -----------------------------------------------

// GET 		/projects/:projectId/articles
router.get('/',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
	],
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	ProjectController.getArticles
);

// POST		/projects/:projectId/articles/:articleId/like
router.post('/:articleId/like',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/dislike
router.post('/:articleId/dislike',
	authenticate(),
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'validationError.invalidProjectId'}),
		param('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	projectAuthorization.isAccesible,
	projectAuthorization.isOpenForContributions,
	LikeController.toggleDislike
)

// -----------------------------------------------
// add /comments routes
// -----------------------------------------------
router.use('/:articleId/comments', CommentsRoutes);

module.exports = router;