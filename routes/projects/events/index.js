const express = require('express');
const { check, param, body, query, oneOf } = require('express-validator');
const constants = require('../../../services/constants');
const authenticate = require('../../../middlewares/authenticate');
const exists = require('../../../middlewares/exists');
const projectAuthorization = require('../../../middlewares/projectAuthorization');
const validate = require('../../../middlewares/validate');

const EventController = require('../../../controllers/eventController');

// initialize router
const router = express.Router({mergeParams: true});

// -----------------------------------------------
// BASE     /projects/:projectId/events
// -----------------------------------------------
// GET 		 	/projects/:projectId/events
// POST 	  /projects/:projectId/events
// DELETE 	/projects/:projectId/events/:eventId
// -----------------------------------------------

// GET 	/projects/:projectId/events
router.get('/',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		query('page').optional().isInt({min: 1}).withMessage('Page must be an integer'),
		query('limit').optional().isInt({min: 1, max: 25}).withMessage('Limit must be an integer'),
	],
	validate,
	exists.project,
	projectAuthorization.isAccesible,
	EventController.listEvents
)

// POST 	/projects/:projectId/events
router.post('/',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		body('title_es').isString().withMessage('Title (es) must be a string'),
		body('title_pt').isString().withMessage('Title (pt) must be a string'),
		body('text_es').isString().withMessage('Text (es) must be a string'),
		body('text_pt').isString().withMessage('Text (pt) must be a string'),
		body('date').isISO8601().withMessage('Date must be a valid date'),
	],
	validate,
	exists.project,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	projectAuthorization.onlyEditors,
	EventController.createEvent
)

// DELETE /projects/:projectId/events/:eventId
router.delete('/:eventId',
	[
		oneOf([param('projectId').isMongoId(),param('projectId').isSlug()], {message: 'Invalid Project ID'}),
		param('eventId').isMongoId().withMessage('Invalid Event ID'),
	], 
	validate,
	exists.project,
	exists.event,
	authenticate(constants.ROLES.ADMIN_OR_AUTHOR),
	projectAuthorization.onlyEditors,
	EventController.deleteEvent
)

module.exports = router;
