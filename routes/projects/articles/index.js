const express = require('express');
const { check, param, body, query } = require('express-validator');
const constants = require('../../../services/constants');
const authenticate = require('../../../middlewares/authenticate');
const exists = require('../../../middlewares/exists');
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
		param('projectId').isMongoId().withMessage('Invalid Project ID'),
	],
	validate,
	exists.project,
	ProjectController.getArticles
);

// POST		/projects/:projectId/articles/:articleId/like
router.post('/:articleId/like',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	authenticate(),
	LikeController.toggleLike
)

// POST		/projects/:projectId/articles/:articleId/dislike
router.post('/:articleId/dislike',
	[
		check('projectId').isMongoId().withMessage('Invalid Project ID'),
		check('articleId').isMongoId().withMessage('Invalid Article ID'),
	], 
	validate,
	exists.project,
	exists.article,
	authenticate(),
	LikeController.toggleDislike
)

// -----------------------------------------------
// add /comments routes
// -----------------------------------------------
router.use('/:articleId/comments', CommentsRoutes);

module.exports = router;